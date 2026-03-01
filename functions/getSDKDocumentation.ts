import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const javascriptSDK = {
      name: "@payada/sdk",
      version: "1.0.0",
      description: "Official PayADA SDK for JavaScript/TypeScript",
      installation: "npm install @payada/sdk",
      usage: `
import PayADA from '@payada/sdk';

const payada = new PayADA({
  apiKey: 'sk_live_xxxxx',
  baseUrl: 'https://api.payada.io'
});

// Create payment link
const link = await payada.paymentLinks.create({
  title: 'Product Purchase',
  description: 'Buy our premium product',
  amount_ada: 10.5,
  success_redirect_url: 'https://example.com/success',
  collect_email: true
});

// Create subscription plan
const plan = await payada.subscriptionPlans.create({
  name: 'Premium Monthly',
  slug: 'premium-monthly',
  amount_ada: 5.0,
  interval_type: 'monthly'
});

// Retrieve transaction
const payment = await payada.payments.get('payment_id_123');

// List payments
const payments = await payada.payments.list({ status: 'confirmed' });

// Webhook verification
const isValid = payada.webhooks.verifySignature(
  payload,
  signature,
  timestamp,
  secret
);
      `
    };

    const pythonSDK = {
      name: "payada",
      version: "1.0.0",
      description: "Official PayADA SDK for Python",
      installation: "pip install payada",
      usage: `
from payada import PayADA

payada = PayADA(
    api_key='sk_live_xxxxx',
    base_url='https://api.payada.io'
)

# Create payment link
link = payada.payment_links.create(
    title='Product Purchase',
    description='Buy our premium product',
    amount_ada=10.5,
    success_redirect_url='https://example.com/success',
    collect_email=True
)

# Create subscription plan
plan = payada.subscription_plans.create(
    name='Premium Monthly',
    slug='premium-monthly',
    amount_ada=5.0,
    interval_type='monthly'
)

# Retrieve transaction
payment = payada.payments.get('payment_id_123')

# List payments
payments = payada.payments.list(status='confirmed')

# Webhook verification
is_valid = payada.webhooks.verify_signature(
    payload,
    signature,
    timestamp,
    secret
)
      `
    };

    const apiReference = {
      baseUrl: "https://api.payada.io",
      authentication: "Bearer token in Authorization header or Idempotency-Key for retry safety",
      endpoints: {
        paymentLinks: {
          create: { method: "POST", path: "/payment-links", description: "Create a payment link" },
          list: { method: "GET", path: "/payment-links", description: "List all payment links" },
          get: { method: "GET", path: "/payment-links/{id}", description: "Get payment link details" },
          update: { method: "PATCH", path: "/payment-links/{id}", description: "Update payment link" },
          delete: { method: "DELETE", path: "/payment-links/{id}", description: "Disable payment link" }
        },
        subscriptionPlans: {
          create: { method: "POST", path: "/subscription-plans", description: "Create subscription plan" },
          list: { method: "GET", path: "/subscription-plans", description: "List all plans" },
          get: { method: "GET", path: "/subscription-plans/{id}", description: "Get plan details" },
          update: { method: "PATCH", path: "/subscription-plans/{id}", description: "Update plan" }
        },
        subscriptions: {
          list: { method: "GET", path: "/subscriptions", description: "List merchant subscriptions" },
          get: { method: "GET", path: "/subscriptions/{id}", description: "Get subscription details" },
          cancel: { method: "POST", path: "/subscriptions/{id}/cancel", description: "Cancel subscription" }
        },
        payments: {
          list: { method: "GET", path: "/payments", description: "List payments with filtering" },
          get: { method: "GET", path: "/payments/{id}", description: "Get payment details" }
        },
        webhooks: {
          create: { method: "POST", path: "/webhooks", description: "Create webhook endpoint" },
          list: { method: "GET", path: "/webhooks", description: "List webhook endpoints" },
          delete: { method: "DELETE", path: "/webhooks/{id}", description: "Delete webhook endpoint" }
        }
      }
    };

    return Response.json({
      status: "success",
      sdks: {
        javascript: javascriptSDK,
        python: pythonSDK
      },
      apiReference: apiReference,
      documentation: "See https://docs.payada.io for full documentation"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});