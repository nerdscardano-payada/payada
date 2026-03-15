import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendTicketEmail({ to, attendeeName, event, ticketTypeName, qrCode, entryUrl }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "PayADA Tickets <tickets@payada.io>",
      to: [to],
      subject: `Your ticket for ${event.title}`,
      html: `<h2>🎟 Your Ticket</h2>
<p>Hi ${attendeeName || 'there'},</p>
<p>Your payment has been confirmed! Here are your ticket details:</p>
<table style="border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:4px 12px 4px 0;color:#666">Event:</td><td><strong>${event.title}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;color:#666">Ticket:</td><td>${ticketTypeName}</td></tr>
  ${event.event_date ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Date:</td><td>${new Date(event.event_date).toLocaleString()}</td></tr>` : ''}
  ${event.location ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Location:</td><td>${event.location}</td></tr>` : ''}
</table>
<p><strong>Your Ticket ID:</strong> <code>${qrCode}</code></p>
<p>Present the following link at the entrance:</p>
<p><a href="${entryUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:8px 0">View Ticket &amp; Check-in</a></p>
<p style="color:#999;font-size:12px">Powered by PayADA</p>`,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${res.status} ${err}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sr = base44.asServiceRole;

    // Fetch all confirmed tickets without email sent that have an email address
    const tickets = await sr.entities.EventTicket.filter({ status: 'confirmed', email_sent: false });
    const toSend = tickets.filter(t => t.attendee_email);

    const results = { sent: 0, failed: 0, skipped: tickets.length - toSend.length };

    // Cache events to avoid duplicate fetches
    const eventCache = {};

    for (const ticket of toSend) {
      if (!eventCache[ticket.event_id]) {
        eventCache[ticket.event_id] = await sr.entities.Event.get(ticket.event_id);
      }
      const event = eventCache[ticket.event_id];
      if (!event) { results.failed++; continue; }

      const entryUrl = `https://app.payada.io/EventEntry?ticket=${ticket.qr_code}`;
      try {
        await sendTicketEmail({
          to: ticket.attendee_email,
          attendeeName: ticket.attendee_name,
          event,
          ticketTypeName: ticket.ticket_type_name || 'General Admission',
          qrCode: ticket.qr_code,
          entryUrl,
        });
        await sr.entities.EventTicket.update(ticket.id, { email_sent: true });
        results.sent++;
      } catch (err) {
        console.error(`Failed for ticket ${ticket.id}:`, err.message);
        results.failed++;
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});