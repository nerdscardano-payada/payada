import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { qrCode } = await req.json();
    if (!qrCode) return Response.json({ ok: false, message: 'No ticket code provided' }, { status: 400 });

    const sr = base44.asServiceRole; // use service role so public (unauthenticated) users can look up tickets
    const tickets = await sr.entities.EventTicket.filter({ qr_code: qrCode });
    if (!tickets.length) return Response.json({ ok: false, message: 'Ticket not found' });

    const ticket = tickets[0];
    if (ticket.status === 'cancelled') return Response.json({ ok: false, message: 'This ticket has been cancelled' });
    if (ticket.status === 'pending') return Response.json({ ok: false, message: 'Payment not yet confirmed' });

    const event = await sr.entities.Event.get(ticket.event_id);
    const alreadyCheckedIn = ticket.status === 'checked_in';

    return Response.json({ ok: true, ticket, event, alreadyCheckedIn });
  } catch (error) {
    return Response.json({ ok: false, message: error.message }, { status: 500 });
  }
});