import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { qrCode } = await req.json();
    if (!qrCode) return Response.json({ ok: false, message: 'No ticket code' }, { status: 400 });

    const sr = base44.asServiceRole;
    const tickets = await sr.entities.EventTicket.filter({ qr_code: qrCode });
    if (!tickets.length) return Response.json({ ok: false, message: 'Ticket not found' });

    const ticket = tickets[0];
    if (ticket.status === 'cancelled') return Response.json({ ok: false, message: 'Ticket cancelled' });
    if (ticket.status === 'pending') return Response.json({ ok: false, message: 'Payment not confirmed' });
    if (ticket.status === 'checked_in') {
      const event = await sr.entities.Event.get(ticket.event_id);
      return Response.json({ ok: true, ticket, event, alreadyCheckedIn: true });
    }

    const updated = await sr.entities.EventTicket.update(ticket.id, {
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
    });

    const event = await sr.entities.Event.get(ticket.event_id);
    return Response.json({ ok: true, ticket: updated, event, alreadyCheckedIn: false });
  } catch (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
});