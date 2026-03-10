import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Link2, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function PaymentIntegrationStep({ merchantId }) {
  const integrations = [
    {
      icon: Link2,
      color: "green",
      title: "Payment Links",
      description: "Create shareable payment links from your dashboard. Perfect for invoices, fundraising, and simple checkouts. No coding required.",
      details: [
        "Generate links with custom amounts",
        "Track payment status in real-time",
        "Collect customer information",
        "Share via email, SMS, or social media"
      ],
      link: createPageUrl("PaymentLinks")
    },
    {
      icon: Zap,
      color: "orange",
      title: "POS Terminal",
      description: "Accept payments at physical locations with our embedded POS terminal. Great for stores, restaurants, and service businesses.",
      details: [
        "QR code payment requests",
        "Customer-facing display",
        "Receipt printing support",
        "Offline transaction support"
      ],
      link: createPageUrl("PayTerminals")
    },
    {
      icon: Smartphone,
      color: "purple",
      title: "Payment Button",
      description: "Embed a payment button on your website with just a few lines of HTML. Get started in seconds.",
      details: [
        "One-click payment buttons",
        "Customizable styling",
        "Automatic webhook notifications",
        "Mobile-friendly checkout"
      ],
      link: createPageUrl("ButtonGenerator")
    },
    {
      icon: Zap,
      color: "blue",
      title: "Discord Integration",
      description: "Gate access to Discord communities and grant roles automatically after payment. Perfect for exclusive servers and memberships.",
      details: [
        "Automatic role assignment",
        "Member verification",
        "Revenue tracking",
        "Easy integration setup"
      ],
      link: createPageUrl("DiscordPlugin")
    }
  ];

  const colorClasses = {
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    blue: "text-blue-600"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrated Payment Tools</CardTitle>
          <CardDescription>
            Choose a payment method and start accepting ADA today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Your profile is set up. Choose from our ready-to-use payment tools below.
            </AlertDescription>
          </Alert>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, idx) => {
              const Icon = integration.icon;
              return (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${colorClasses[integration.color]} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{integration.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{integration.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-8">
                    <p className="text-xs font-medium text-slate-700">Key features:</p>
                    <ul className="space-y-1">
                      {integration.details.map((detail, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>


                </div>
              );
            })}
          </div>


        </CardContent>
      </Card>
    </div>
  );
}