import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function fetchTxInfo(txHash) {
  const res = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blockfrost error: ${res.status}`);
  return res.json();
}

function generateQrCode() {
  return 'EVT-' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { txHash, eventId, attendeeEmail, attendeeName, walletAddress } = await req.json();
    if (!txHash || !eventId) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const sr = base44.asServiceRole;

    // Check if ticket already exists for this tx
    const existing = await sr.entities.EventTicket.filter({ event_id: eventId, tx_hash: txHash });
    if (existing.length > 0) {
      const existingTicket = existing[0];
      // If ticket exists but email was never sent, try sending it now
      if (!existingTicket.email_sent && existingTicket.attendee_email) {
        const event = await sr.entities.Event.get(eventId);
        if (event) {
          const entryUrl = `${req.headers.get('origin') || 'https://app.payada.io'}/EventEntry?ticket=${existingTicket.qr_code}`;
          try {
            await sr.integrations.Core.SendEmail({
              to: existingTicket.attendee_email,
              subject: `Your ticket for ${event.title}`,
              body: `<h2>🎟 Your Ticket</h2>
<p>Hi ${existingTicket.attendee_name || 'there'},</p>
<p>Your payment has been confirmed! Here are your ticket details:</p>
<table style="border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#666">Event:</td><td><strong>${event.title}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ticket:</td><td>${existingTicket.ticket_type_name}</td></tr>
  ${event.event_date ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Date:</td><td>${new Date(event.event_date).toLocaleString()}</td></tr>` : ''}
  ${event.location ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Location:</td><td>${event.location}</td></tr>` : ''}
</table>
<p><strong>Your Ticket ID:</strong> <code>${existingTicket.qr_code}</code></p>
<p>Present the following link at the entrance:</p>
<p><a href="${entryUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:8px 0">View Ticket & Check-in</a></p>
<p style="color:#999;font-size:12px">Powered by PayADA</p>`,
            });
            await sr.entities.EventTicket.update(existingTicket.id, { email_sent: true });
          } catch (emailErr) {
            console.error('Email send failed (non-fatal):', emailErr.message);
          }
        }
      }
      return Response.json({ ticket: existingTicket });
    }

    // Verify TX on blockchain
    const txInfo = await fetchTxInfo(txHash);
    if (!txInfo) return Response.json({ ticket: null, pending: true });

    // Get associated payment record, or create one for event payments
    let existingPayments = await sr.entities.Payment.filter({ tx_hash: txHash });
    let payment = existingPayments[0] || null;

    // Get event to find correct ticket type from pending state
    // We rely on the payment link data or just use event defaults
    const event = await sr.entities.Event.get(eventId);
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });

    // If no payment record exists yet, create one so it shows up in the payments dashboard
    if (!payment) {
      const receivedLovelace = txInfo.output_amount?.find(a => a.unit === 'lovelace')?.quantity || 0;
      const receivedAda = receivedLovelace / 1_000_000;
      payment = await sr.entities.Payment.create({
        merchant_id: event.merchant_id,
        event_id: eventId,
        tx_hash: txHash,
        status: 'confirmed',
        payment_type: 'ada',
        received_amount_ada: receivedAda,
        expected_amount_ada: receivedAda,
        payer_address: walletAddress || null,
        payer_name: attendeeName || null,
        payer_email: attendeeEmail || null,
        confirmed_at: new Date().toISOString(),
      });
    } else {
      // Backfill event_id and/or wallet address if missing
      const updates = {};
      if (!payment.event_id) updates.event_id = eventId;
      if (!payment.payer_address && walletAddress) updates.payer_address = walletAddress;
      if (Object.keys(updates).length > 0) {
        await sr.entities.Payment.update(payment.id, updates);
        payment = { ...payment, ...updates };
      }
    }

    // Find matching ticket type by price (approximate)
    const receivedAda = payment?.received_amount_ada || (txInfo.output_amount?.find(a => a.unit === 'lovelace')?.quantity / 1_000_000) || 0;
    const matchedType = (event.ticket_types || []).find(tt => Math.abs(tt.price_ada - receivedAda) < tt.price_ada * 0.05)
      || event.ticket_types?.[0];

    const qrCode = generateQrCode();

    const ticket = await sr.entities.EventTicket.create({
      event_id: eventId,
      merchant_id: event.merchant_id,
      ticket_type_id: matchedType?.id || null,
      ticket_type_name: matchedType?.name || "General Admission",
      price_ada: matchedType?.price_ada || 0,
      attendee_name: payment?.payer_name || attendeeName || null,
      attendee_email: payment?.payer_email || attendeeEmail || null,
      wallet_address: walletAddress || payment?.payer_address || null,
      tx_hash: txHash,
      payment_id: payment?.id || null,
      qr_code: qrCode,
      status: 'confirmed',
    });

    // Update event stats + sold count on ticket type
    const updatedTicketTypes = (event.ticket_types || []).map(tt =>
      tt.id === matchedType?.id ? { ...tt, sold: (tt.sold || 0) + 1 } : tt
    );
    await sr.entities.Event.update(eventId, {
      total_tickets_sold: (event.total_tickets_sold || 0) + 1,
      total_received_ada: (event.total_received_ada || 0) + (matchedType?.price_ada || 0),
      ticket_types: updatedTicketTypes,
    });

    // Send email with ticket
    const emailTo = ticket.attendee_email || attendeeEmail;
    if (emailTo) {
      if (!ticket.attendee_email) {
        await sr.entities.EventTicket.update(ticket.id, { attendee_email: emailTo });
      }
      try {
        const entryUrl = `${req.headers.get('origin') || 'https://app.payada.io'}/EventEntry?ticket=${qrCode}`;
        await sr.integrations.Core.SendEmail({
          to: emailTo,
          subject: `Your ticket for ${event.title}`,
          body: `<h2>🎟 Your Ticket</h2>
<p>Hi ${ticket.attendee_name || 'there'},</p>
<p>Your payment has been confirmed! Here are your ticket details:</p>
<table style="border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#666">Event:</td><td><strong>${event.title}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ticket:</td><td>${ticket.ticket_type_name}</td></tr>
  ${event.event_date ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Date:</td><td>${new Date(event.event_date).toLocaleString()}</td></tr>` : ''}
  ${event.location ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Location:</td><td>${event.location}</td></tr>` : ''}
</table>
<p><strong>Your Ticket ID:</strong> <code>${qrCode}</code></p>
<p>Present the following link at the entrance:</p>
<p><a href="${entryUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:8px 0">View Ticket & Check-in</a></p>
<p style="color:#999;font-size:12px">Powered by PayADA</p>`,
        });
        await sr.entities.EventTicket.update(ticket.id, { email_sent: true });
      } catch (emailErr) {
        console.error('Email send failed (non-fatal):', emailErr.message);
      }
    }

    return Response.json({ ticket });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});