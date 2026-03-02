import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // No auth required — this is a public address, not a secret
    const address = Deno.env.get("PAYADA_FEE_WALLET");
    if (!address) {
      return Response.json({ error: 'Fee wallet not configured' }, { status: 500 });
    }
    return Response.json({ address });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});