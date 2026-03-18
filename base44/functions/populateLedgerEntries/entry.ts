import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both: scheduled automations (no user) and direct admin calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const sr = base44.asServiceRole;

    // Parse request (optional filters for manual invocation)
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const { paymentId, merchantId, pageSize = 50, offset = 0 } = body;

    // Determine query filter
    const query = { status: 'confirmed' };
    if (merchantId) query.merchant_id = merchantId;
    if (paymentId) query.id = paymentId;

    // Fetch confirmed payments
    const payments = await sr.entities.Payment.filter(query, '-confirmed_at', pageSize, offset);

    if (!payments || payments.length === 0) {
      return Response.json({ status: 'success', processed: 0, created_entries: 0, skipped: 0, message: 'No confirmed payments to process' });
    }

    let processedCount = 0;
    let entriesCreated = 0;
    let skippedCount = 0;
    const failedPayments = [];

    // Process all payments in parallel
    await Promise.all(payments.map(async (payment) => {
      try {
        // Idempotency check + payment link lookup in parallel
        const [existingEntries, paymentLinks] = await Promise.all([
          sr.entities.LedgerEntry.filter({ payment_id: payment.id, merchant_id: payment.merchant_id }),
          payment.payment_link_id
            ? sr.entities.PaymentLink.filter({ id: payment.payment_link_id })
            : Promise.resolve([])
        ]);

        if (existingEntries && existingEntries.length > 0) {
          skippedCount++;
          return;
        }

        const referenceType = payment.subscription_invoice_id
          ? 'subscription_invoice'
          : (paymentLinks.length > 0 ? 'payment_link' : null);
        const referenceId = payment.subscription_invoice_id || payment.payment_link_id || null;

        const feeAmount = payment.fee_amount_ada || (payment.received_amount_ada * 0.015);
        const merchantAmount = payment.merchant_amount_ada || (payment.received_amount_ada - feeAmount);
        const meta = { tx_hash: payment.tx_hash };

        // Create all 3 ledger entries in parallel
        await Promise.all([
          sr.entities.LedgerEntry.create({
            merchant_id: payment.merchant_id,
            payment_id: payment.id,
            type: 'gross',
            amount_lovelace: payment.received_amount_ada * 1_000_000,
            currency: 'ADA',
            description: `Gross payment received: ${payment.received_amount_ada} ADA`,
            reference_type: referenceType,
            reference_id: referenceId,
            metadata: { ...meta, confirmations: payment.confirmations, payer_address: payment.payer_address }
          }),
          sr.entities.LedgerEntry.create({
            merchant_id: payment.merchant_id,
            payment_id: payment.id,
            type: 'fee',
            amount_lovelace: -(feeAmount * 1_000_000),
            currency: 'ADA',
            description: `Platform fee: ${feeAmount.toFixed(6)} ADA`,
            reference_type: referenceType,
            reference_id: referenceId,
            metadata: { ...meta, fee_percentage: 1.75 }
          }),
          sr.entities.LedgerEntry.create({
            merchant_id: payment.merchant_id,
            payment_id: payment.id,
            type: 'net',
            amount_lovelace: merchantAmount * 1_000_000,
            currency: 'ADA',
            description: `Net amount to merchant: ${merchantAmount.toFixed(6)} ADA`,
            reference_type: referenceType,
            reference_id: referenceId,
            metadata: { ...meta, fee_deducted: feeAmount }
          })
        ]);

        entriesCreated += 3;
        processedCount++;

        // Log audit event (fire-and-forget, don't block)
        sr.functions.invoke('logAuditEvent', {
          merchantId: payment.merchant_id,
          eventType: 'payment_confirmed',
          resourceType: 'ledger_entry',
          resourceId: payment.id,
          result: 'success',
          changes: { ledger_entries_created: 3, gross: payment.received_amount_ada, fee: feeAmount, net: merchantAmount },
          metadata: { ledger_processing: true, tx_hash: payment.tx_hash }
        }).catch(err => console.error(`Audit log failed for ${payment.id}: ${err.message}`));

      } catch (paymentError) {
        failedPayments.push({ payment_id: payment.id, error: paymentError.message });
        console.error(`Error processing payment ${payment.id}:`, paymentError.message);
      }
    }));

    return Response.json({
      status: 'success',
      processed: processedCount,
      skipped: skippedCount,
      created_entries: entriesCreated,
      failed: failedPayments.length,
      failed_payments: failedPayments.length > 0 ? failedPayments : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ledger population error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});