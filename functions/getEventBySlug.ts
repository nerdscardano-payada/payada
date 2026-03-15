import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug } = await req.json();
    if (!slug) return Response.json({ error: 'Missing slug' }, { status: 400 });

    const sr = base44.asServiceRole;
    const events = await sr.entities.Event.filter({ slug });
    if (!events.length) return Response.json({ error: 'Event not found' }, { status: 404 });

    const event = events[0];
    if (event.status === 'cancelled') return Response.json({ error: 'This event has been cancelled' }, { status: 404 });

    return Response.json({ event });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});