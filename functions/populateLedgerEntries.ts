import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse request
    const body = await req.json();
    const { paymentId, merchantId, pageSize = 50, offset = 0 } = body;

    // Determine query filter
    let query = { status: 'confirmed' };
    if (merchantId) query.merchant_id = merchantId;
    if (paymentId) query.id = paymentId;

    // Fetch confirmed payments
    const payments = await base44.asServiceRole.entities.Payment.filter(query, '-confirmed_at', pageSize, offset);

    if (!payments || payments.length === 0) {
      return Response.json({
        status: 'success',
        processed: 0,
        created_entries: 0,
        skipped: 0,
        message: 'No confirmed payments to process'
      });
    }

    let processedCount = 0;
    let entriesCreated = 0;
    let skippedCount = 0;
    const failedPayments = [];

    for (const payment of payments) {
      try {
        // Check if ledger entries already exist for this payment (idempotency check)
        const existingEntries = await base44.asServiceRole.entities.LedgerEntry.filter({
          payment_id: payment.id,
          merchant_id: payment.merchant_id
        });

        if (existingEntries && existingEntries.length > 0) {
          skippedCount++;
          console.log(`Ledger entries already exist for payment ${payment.id}, skipping.`);
          continue;
        }

        // Fetch payment link for additional context
        let referenceType = null;
        let referenceId = null;
        let exchangeRateSnapshot = null;

        if (payment.payment_link_id) {
          const paymentLink = await base44.asServiceRole.entities.PaymentLink.filter({
            id: payment.payment_link_id
          });
          if (paymentLink && paymentLink.length > 0) {
            referenceType = 'payment_link';
            referenceId = payment.payment_link_id;
          }
        }

        if (payment.subscription_invoice_id) {
          referenceType = 'subscription_invoice';
          referenceId = payment.subscription_invoice_id;
        }

        // Create gross entry (full amount received)
        const grossEntry = await base44.asServiceRole.entities.LedgerEntry.create({
          merchant_id: payment.merchant_id,
          payment_id: payment.id,
          type: 'gross',
          amount_lovelace: payment.received_amount_ada * 1000000,
          currency: 'ADA',
          description: `Gross payment received: ${payment.received_amount_ada} ADA`,
          reference_type: referenceType,
          reference_id: referenceId,
          exchange_rate_snapshot: exchangeRateSnapshot,
          metadata: {
            tx_hash: payment.tx_hash,
            confirmations: payment.confirmations,
            payer_address: payment.payer_address
          }
        });

        // Create fee entry
        const feeAmount = payment.fee_amount_ada || (payment.received_amount_ada * 0.015); // Default 1.5% if not stored
        const feeEntry = await base44.asServiceRole.entities.LedgerEntry.create({
          merchant_id: payment.merchant_id,
          payment_id: payment.id,
          type: 'fee',
          amount_lovelace: -(feeAmount * 1000000),
          currency: 'ADA',
          description: `Platform fee: ${feeAmount.toFixed(6)} ADA`,
          reference_type: referenceType,
          reference_id: referenceId,
          exchange_rate_snapshot: exchangeRateSnapshot,
          metadata: {
            fee_percentage: 1.5,
            tx_hash: payment.tx_hash
          }
        });

        // Create net entry (merchant's amount)
        const merchantAmount = payment.merchant_amount_ada || (payment.received_amount_ada - feeAmount);
        const netEntry = await base44.asServiceRole.entities.LedgerEntry.create({
          merchant_id: payment.merchant_id,
          payment_id: payment.id,
          type: 'net',
          amount_lovelace: merchantAmount * 1000000,
          currency: 'ADA',
          description: `Net amount to merchant: ${merchantAmount.toFixed(6)} ADA`,
          reference_type: referenceType,
          reference_id: referenceId,
          exchange_rate_snapshot: exchangeRateSnapshot,
          metadata: {
            tx_hash: payment.tx_hash,
            fee_deducted: feeAmount
          }
        });

        entriesCreated += 3; // 3 entries created per payment
        processedCount++;

        // Log audit event
        await base44.asServiceRole.functions.invoke('logAuditEvent', {
          merchantId: payment.merchant_id,
          eventType: 'payment_confirmed',
          resourceType: 'ledger_entry',
          resourceId: payment.id,
          result: 'success',
          changes: {
            ledger_entries_created: 3,
            gross: payment.received_amount_ada,
            fee: feeAmount,
            net: merchantAmount
          },
          metadata: {
            ledger_processing: true,
            tx_hash: payment.tx_hash
          }
        });
      } catch (paymentError) {
        failedPayments.push({
          payment_id: payment.id,
          error: paymentError.message
        });
        console.error(`Error processing payment ${payment.id}:`, paymentError.message);
      }
    }

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