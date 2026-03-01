import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookEndpointManager from "@/components/webhooks/WebhookEndpointManager";
import WebhookEventHistory from "@/components/webhooks/WebhookEventHistory";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function WebhooksPage() {
  const { data: merchantProfile, isLoading } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.MerchantProfile.filter({
        user_id: user.id,
      });
      return profiles[0] || null;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-4 mt-6">
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!merchantProfile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-slate-600">Unable to load merchant data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Webhooks</h1>
          <p className="text-slate-600 mt-1">
            Manage webhook endpoints and monitor delivery history
          </p>
        </div>

        <Tabs defaultValue="endpoints" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="history">Event History</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-4 mt-6">
            <WebhookEndpointManager
              merchantId={merchantProfile.user_id}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <WebhookEventHistory merchantId={merchantProfile.user_id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}