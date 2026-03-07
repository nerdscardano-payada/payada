import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import WebhookEndpointManager from "@/components/webhooks/WebhookEndpointManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Webhook, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure webhooks and integrations for your merchant account"
      />

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="w-3.5 h-3.5" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <Alert className="border-indigo-200 bg-indigo-50">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800 text-sm">
              Webhooks let you receive real-time HTTP notifications when payments are detected or confirmed. 
              Your endpoint will receive a POST request with full payment details.
            </AlertDescription>
          </Alert>

          {user && <WebhookEndpointManager merchantId={user.email} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}