import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Copy, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentIntegrationStep({ merchantId }) {
  const [copied, setCopied] = useState(false);

  const apiKey = `pk_${merchantId.substring(0, 8)}_demo`;
  const paymentLinkExample = `https://payada.io/checkout/${merchantId}/payment-link-slug`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Payment Integration</CardTitle>
          <CardDescription>
            Integrate PayADA into your application to start accepting ADA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Your profile and webhook endpoints have been configured. Now integrate
              payment processing into your application.
            </AlertDescription>
          </Alert>

          {/* API Key */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900">Your API Key</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-slate-100 rounded text-sm font-mono text-slate-900">
                {apiKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(apiKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Keep this key secure. Never expose it publicly.
            </p>
          </div>

          {/* Integration Methods */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Integration Options</h3>

            {/* Payment Links */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Payment Links</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Generate shareable payment links from the dashboard. No code
                    required.
                  </p>
                </div>
              </div>
              <div className="ml-7">
                <p className="text-xs text-slate-500 mb-2">Example:</p>
                <code className="block text-xs bg-slate-100 p-2 rounded font-mono text-slate-900 truncate">
                  {paymentLinkExample}
                </code>
              </div>
            </div>

            {/* REST API */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">REST API</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Programmatically create payments and manage subscriptions.
                  </p>
                </div>
              </div>
              <div className="ml-7 space-y-2">
                <p className="text-xs text-slate-500">Example Request:</p>
                <pre className="text-xs bg-slate-100 p-3 rounded font-mono text-slate-900 overflow-x-auto">
{`curl -X POST https://api.payada.io/v1/payments \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d amount_ada=50 \\
  -d description="Order #123"`}
                </pre>
              </div>
            </div>

            {/* SDKs */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Code className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Official SDKs</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Use our JavaScript or Python SDKs for seamless integration.
                  </p>
                </div>
              </div>
              <div className="ml-7 space-y-2">
                <p className="text-xs text-slate-500">JavaScript:</p>
                <pre className="text-xs bg-slate-100 p-2 rounded font-mono text-slate-900 overflow-x-auto">
{`npm install @payada/sdk`}
                </pre>
                <p className="text-xs text-slate-500 mt-3">Python:</p>
                <pre className="text-xs bg-slate-100 p-2 rounded font-mono text-slate-900 overflow-x-auto">
{`pip install payada`}
                </pre>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
            <p className="font-medium text-indigo-900">Next Steps</p>
            <ul className="text-sm text-indigo-800 space-y-1 ml-4 list-disc">
              <li>Create your first payment link</li>
              <li>Review the API documentation</li>
              <li>Test payment processing in sandbox mode</li>
              <li>Set up production webhook endpoints</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}