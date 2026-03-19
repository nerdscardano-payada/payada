import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { eventId, ticketTypeId, attendeeName, attendeeEmail } = await req.json();

    if (!eventId || !ticketTypeId) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const sr = base44.asServiceRole;
    const event = await sr.entities.Event.get(eventId);
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });
    if (event.status !== 'active') return Response.json({ error: 'Event is not accepting tickets' }, { status: 400 });

    const ticketType = (event.ticket_types || []).find(t => t.id === ticketTypeId);
    if (!ticketType) return Response.json({ error: 'Ticket type not found' }, { status: 404 });
    if (ticketType.capacity && (ticketType.sold || 0) >= ticketType.capacity) {
      return Response.json({ error: 'This ticket type is sold out' }, { status: 400 });
    }

    const priceAda = ticketType.price_ada;
    const feeModel = event.fee_model || 'merchant_pays';
    const feePercent = PLATFORM_FEE_PERCENT;

    let amountTotalAda, merchantAmountAda, platformFeeAda;

    if (feeModel === 'merchant_pays') {
      amountTotalAda = priceAda;
      platformFeeAda = priceAda * (feePercent / 100);
      merchantAmountAda = priceAda - platformFeeAda;
    } else if (feeModel === 'customer_pays') {
      platformFeeAda = priceAda * (feePercent / 100);
      amountTotalAda = priceAda + platformFeeAda;
      merchantAmountAda = priceAda;
    } else { // split
      platformFeeAda = priceAda * (feePercent / 100);
      amountTotalAda = priceAda + (platformFeeAda / 2);
      merchantAmountAda = priceAda - (platformFeeAda / 2);
    }

    // Get merchant receive address
    const merchantId = event.merchant_id;
    let merchantAddress = event.receive_address;
    if (!merchantAddress) {
      const profiles = await sr.entities.MerchantProfile.filter({ user_id: merchantId });
      merchantAddress = profiles[0]?.default_receive_address;
    }

    return Response.json({
      eventId: event.id,
      ticketTypeId,
      amount_total_ada: Math.round(amountTotalAda * 1000) / 1000,
      merchant_amount_ada: Math.round(merchantAmountAda * 1000) / 1000,
      platform_fee_ada: Math.round(platformFeeAda * 1000) / 1000,
      merchant_amount_lovelace: Math.floor(merchantAmountAda * 1_000_000),
      platform_fee_lovelace: Math.floor(platformFeeAda * 1_000_000),
      merchant_address: merchantAddress,
      platform_fee_percent: feePercent,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});