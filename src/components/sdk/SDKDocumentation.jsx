import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink } from "lucide-react";

export default function SDKDocumentation() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const javascriptUsage = `import PayADA from '@payada/sdk';

const payada = new PayADA({
  apiKey: 'sk_live_xxxxx'
});

// Create payment link
const link = await payada.paymentLinks.create({
  title: 'Product Purchase',
  amount_ada: 10.5,
  collect_email: true
});

console.log('Payment link:', link.slug);`;

  const pythonUsage = `from payada import PayADA

payada = PayADA(api_key='sk_live_xxxxx')

# Create payment link
link = payada.payment_links.create(
    title='Product Purchase',
    amount_ada=10.5,
    collect_email=True
)

print(f'Payment link: {link["slug"]}')`;

  const webhookExample = `// Verify webhook signature (JavaScript)
const isValid = payada.webhooks.verifySignature(
  req.body,
  req.headers['x-payada-signature'],
  req.headers['x-payada-timestamp'],
  process.env.WEBHOOK_SECRET
);

if (isValid) {
  // Process webhook safely
  handlePaymentConfirmed(req.body);
}`;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">PayADA SDKs</h1>
        <p className="text-indigo-700">Official SDKs for seamless Cardano payment integration</p>
      </div>

      <Tabs defaultValue="javascript" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="javascript">JavaScript/TypeScript</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
        </TabsList>

        <TabsContent value="javascript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>@payada/sdk</span>
                <a
                  href="https://www.npmjs.com/package/@payada/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded"
                >
                  npm
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Installation</h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-sm flex items-center justify-between">
                  <span>npm install @payada/sdk</span>
                  <button
                    onClick={() => copyToClipboard("npm install @payada/sdk", "npm-install")}
                    className="hover:bg-slate-700 p-2 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Quick Start</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{javascriptUsage}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(javascriptUsage, "js-usage")}
                  className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Copy className="w-4 h-4" />
                  {copied === "js-usage" ? "Copied!" : "Copy code"}
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Key Methods</h4>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.paymentLinks.create()</code> - Create payment link</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.subscriptionPlans.create()</code> - Create subscription plan</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.payments.list()</code> - List transactions</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.webhooks.verifySignature()</code> - Verify webhooks</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="python" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>payada</span>
                <a
                  href="https://pypi.org/project/payada/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded"
                >
                  PyPI
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Installation</h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-sm flex items-center justify-between">
                  <span>pip install payada</span>
                  <button
                    onClick={() => copyToClipboard("pip install payada", "pip-install")}
                    className="hover:bg-slate-700 p-2 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Quick Start</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre>{pythonUsage}</pre>
                </div>
                <button
                  onClick={() => copyToClipboard(pythonUsage, "py-usage")}
                  className="mt-2 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Copy className="w-4 h-4" />
                  {copied === "py-usage" ? "Copied!" : "Copy code"}
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Key Methods</h4>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.payment_links.create()</code> - Create payment link</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.subscription_plans.create()</code> - Create subscription plan</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.payments.list()</code> - List transactions</li>
                  <li><code className="bg-slate-100 px-2 py-1 rounded">payada.webhooks.verify_signature()</code> - Verify webhooks</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Signature Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Always verify webhook signatures to ensure authenticity:</p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{webhookExample}</pre>
          </div>
          <button
            onClick={() => copyToClipboard(webhookExample, "webhook")}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Copy className="w-4 h-4" />
            {copied === "webhook" ? "Copied!" : "Copy example"}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://docs.payada.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-sm">Full API Documentation</span>
          </a>
          <a
            href="https://github.com/payada/sdk-js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-sm">JavaScript SDK Repository</span>
          </a>
          <a
            href="https://github.com/payada/sdk-python"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-sm">Python SDK Repository</span>
          </a>
          <a
            href="https://discord.gg/payada"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-sm">Developer Community</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}