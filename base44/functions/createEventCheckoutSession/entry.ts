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

    // Get merchant receive address + fee profile
    const merchantId = event.merchant_id;
    let merchantAddress = event.receive_address;
    const profiles = await sr.entities.MerchantProfile.filter({ user_id: merchantId });
    const merchant = profiles[0] || null;
    if (!merchantAddress) {
      merchantAddress = merchant?.default_receive_address;
    }

    const feePercentValue = merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT;
    const feePercent = feePercentValue / 100;
    const baseLovelace = Math.floor(priceAda * 1_000_000);
    const calculatedFeeLovelace = Math.floor(baseLovelace * feePercent);
    const fullFeeLovelace = calculatedFeeLovelace > 0 ? Math.max(calculatedFeeLovelace, 1_000_000) : 0;
    let amountTotalLovelace, merchantAmountLovelace, platformFeeLovelace;

    if (feeModel === 'customer_pays') {
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace;
      amountTotalLovelace = baseLovelace + fullFeeLovelace;
    } else if (feeModel === 'split') {
      const halfFee = Math.floor(fullFeeLovelace / 2);
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace - halfFee;
      amountTotalLovelace = baseLovelace + halfFee;
    } else {
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace - fullFeeLovelace;
      amountTotalLovelace = baseLovelace;
    }

    return Response.json({
      eventId: event.id,
      ticketTypeId,
      amount_total_ada: amountTotalLovelace / 1_000_000,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      merchant_amount_lovelace: merchantAmountLovelace,
      platform_fee_lovelace: platformFeeLovelace,
      merchant_address: merchantAddress,
      platform_fee_percent: feePercentValue,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});