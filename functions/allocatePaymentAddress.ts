import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, paymentLinkId, merchantId } = await req.json();

    if (!paymentId || !paymentLinkId || !merchantId) {
      return Response.json({
        error: 'Missing required fields: paymentId, paymentLinkId, merchantId'
      }, { status: 400 });
    }

    // Fetch payment link to get receive address
    const paymentLinks = await base44.entities.PaymentLink.filter({
      id: paymentLinkId,
      merchant_id: merchantId
    });

    if (paymentLinks.length === 0) {
      return Response.json({
        error: 'Payment link not found'
      }, { status: 404 });
    }

    const paymentLink = paymentLinks[0];
    const receiveAddress = paymentLink.receive_address;

    if (!receiveAddress) {
      return Response.json({
        error: 'Payment link has no receive address configured'
      }, { status: 400 });
    }

    // Check if address is already in use
    const activeAddresses = await base44.entities.ActiveAddress.filter({
      address: receiveAddress,
      status: 'in_use'
    });

    if (activeAddresses.length > 0) {
      return Response.json({
        error: 'Address is currently in use by another payment',
        code: 'ADDRESS_IN_USE'
      }, { status: 409 });
    }

    // Check if address is in cooldown
    const coolingAddresses = await base44.entities.ActiveAddress.filter({
      address: receiveAddress,
      status: 'expired'
    });

    const now = new Date();
    for (const addr of coolingAddresses) {
      if (addr.cooldown_until && new Date(addr.cooldown_until) > now) {
        return Response.json({
          error: 'Address is in cooldown period',
          code: 'ADDRESS_COOLDOWN',
          cooldownUntil: addr.cooldown_until
        }, { status: 429 });
      }
    }

    // Create active address record
    const expiresAt = paymentLink.expires_at ? new Date(paymentLink.expires_at) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const addressRecord = await base44.entities.ActiveAddress.create({
      address: receiveAddress,
      payment_id: paymentId,
      merchant_id: merchantId,
      status: 'in_use',
      allocated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    });

    // Update payment with receive address
    await base44.entities.Payment.update(paymentId, {
      payer_address: receiveAddress
    });

    return Response.json({
      success: true,
      addressId: addressRecord.id,
      address: receiveAddress,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'address_allocation_error'
    }, { status: 500 });
  }
});