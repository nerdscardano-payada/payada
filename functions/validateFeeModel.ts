import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const EXPECTED_FEE_PERCENT = 1.75;

async function testFeeCalculation(testAmount) {
  const feeAmount = (testAmount * EXPECTED_FEE_PERCENT) / 100;
  const merchantAmount = testAmount - feeAmount;
  return {
    testAmount,
    expectedFeePercent: EXPECTED_FEE_PERCENT,
    calculatedFeeAmount: parseFloat(feeAmount.toFixed(6)),
    calculatedMerchantAmount: parseFloat(merchantAmount.toFixed(6)),
    verification: Math.abs((feeAmount / testAmount) * 100 - EXPECTED_FEE_PERCENT) < 0.001
  };
}

async function testMerchantStatusValidation(base44, merchantId) {
  const profiles = await base44.entities.MerchantProfile.filter({ user_id: merchantId });
  if (profiles.length === 0) return { error: 'Merchant not found' };
  
  const profile = profiles[0];
  return {
    merchantId,
    status: profile.status,
    isBlocked: profile.status === 'blocked',
    canAcceptPayments: profile.status !== 'blocked',
    platformFeePercent: profile.platform_fee_percent || EXPECTED_FEE_PERCENT
  };
}

async function testPaymentFeeBreakdown(base44, paymentId) {
  const payments = await base44.entities.Payment.filter({ id: paymentId });
  if (payments.length === 0) return { error: 'Payment not found' };
  
  const payment = payments[0];
  const totalAmount = payment.received_amount_ada || payment.expected_amount_ada;
  const feeAmount = payment.fee_amount_ada;
  const merchantAmount = payment.merchant_amount_ada;
  
  const expectedFee = (totalAmount * EXPECTED_FEE_PERCENT) / 100;
  const feeCorrect = Math.abs(feeAmount - expectedFee) < 0.000001;
  
  return {
    paymentId,
    status: payment.status,
    totalAmount,
    feeAmount,
    merchantAmount,
    expectedFee: parseFloat(expectedFee.toFixed(6)),
    feeCorrect,
    breakdown: {
      totalAda: totalAmount?.toFixed(3),
      platformFeeAda: feeAmount?.toFixed(3),
      merchantAda: merchantAmount?.toFixed(3)
    }
  };
}

async function testNotificationFeeDetails(base44, merchantId) {
  const notifications = await base44.entities.Notification.filter({
    merchant_id: merchantId,
    type: 'payment_confirmed'
  }, '-created_date', 1);
  
  if (notifications.length === 0) return { message: 'No payment_confirmed notifications found' };
  
  const notification = notifications[0];
  const metadata = notification.metadata || {};
  
  return {
    notificationId: notification.id,
    type: notification.type,
    hasFeeBreakdown: !!(metadata.total_ada && metadata.platform_fee && metadata.merchant_ada),
    metadata: {
      total_ada: metadata.total_ada,
      platform_fee: metadata.platform_fee,
      merchant_ada: metadata.merchant_ada
    }
  };
}

async function testCheckoutSessionFees(base44, checkoutSessionId) {
  const sessions = await base44.entities.CheckoutSession.filter({ id: checkoutSessionId });
  if (sessions.length === 0) return { error: 'Checkout session not found' };
  
  const session = sessions[0];
  const totalLovelace = session.amount_total_lovelace;
  const feeLovelace = session.platform_fee_lovelace;
  const merchantLovelace = session.merchant_amount_lovelace;
  
  const expectedFeePercent = session.fee_percent || EXPECTED_FEE_PERCENT;
  const expectedFeeLovelace = (totalLovelace * expectedFeePercent) / 100;
  
  return {
    checkoutSessionId,
    totalLovelace,
    feeLovelace,
    merchantLovelace,
    expectedFeePercent,
    expectedFeeLovelace: Math.round(expectedFeeLovelace),
    feeCorrect: Math.abs(feeLovelace - expectedFeeLovelace) < 1
  };
}

async function runFullValidationSuite(base44) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test 1: Fee calculation
  results.tests.feeCalculation = {
    test_50_ada: await testFeeCalculation(50),
    test_100_ada: await testFeeCalculation(100),
    test_1000_ada: await testFeeCalculation(1000)
  };
  
  // Test 2: Get sample merchant for status validation
  try {
    const merchants = await base44.entities.MerchantProfile.list(null, 1);
    if (merchants.length > 0) {
      results.tests.merchantStatus = await testMerchantStatusValidation(base44, merchants[0].user_id);
    }
  } catch (e) {
    results.tests.merchantStatus = { error: e.message };
  }
  
  // Test 3: Get sample payment for fee breakdown
  try {
    const payments = await base44.entities.Payment.filter({ status: 'confirmed' }, '-created_date', 1);
    if (payments.length > 0) {
      results.tests.paymentBreakdown = await testPaymentFeeBreakdown(base44, payments[0].id);
    }
  } catch (e) {
    results.tests.paymentBreakdown = { error: e.message };
  }
  
  // Test 4: Check notifications
  try {
    const merchants = await base44.entities.MerchantProfile.list(null, 1);
    if (merchants.length > 0) {
      results.tests.notificationFeeDetails = await testNotificationFeeDetails(base44, merchants[0].id);
    }
  } catch (e) {
    results.tests.notificationFeeDetails = { error: e.message };
  }
  
  return results;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testType = 'full' } = await req.json().catch(() => ({}));
    
    let result;
    
    if (testType === 'full') {
      result = await runFullValidationSuite(base44);
    } else if (testType === 'feeCalculation') {
      const { amount = 100 } = await req.json().catch(() => ({}));
      result = await testFeeCalculation(amount);
    } else {
      result = {
        error: 'Unknown test type',
        availableTests: ['full', 'feeCalculation'],
        expectedFeePercent: EXPECTED_FEE_PERCENT
      };
    }
    
    return Response.json({
      success: true,
      result,
      expectedFeePercent: EXPECTED_FEE_PERCENT,
      validationDate: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'validation_error'
    }, { status: 500 });
  }
});