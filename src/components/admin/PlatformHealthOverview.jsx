import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import MetricsCard from "./MetricsCard";
import { Users, Webhook, DollarSign, AlertCircle } from "lucide-react";

export default function PlatformHealthOverview() {
  const { data: merchantCount = 0, isLoading: merchantLoading } = useQuery({
    queryKey: ["merchant-count"],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.list();
      return profiles.length;
    },
  });

  const { data: webhookStats = {}, isLoading: webhookLoading } = useQuery({
    queryKey: ["webhook-stats"],
    queryFn: async () => {
      const endpoints = await base44.entities.WebhookEndpoint.list();
      const activeEndpoints = endpoints.filter((e) => e.enabled).length;
      const totalDeliveries = endpoints.reduce(
        (sum, e) => sum + (e.delivery_count || 0),
        0
      );
      const failedDeliveries = endpoints.reduce(
        (sum, e) => sum + (e.failure_count || 0),
        0
      );
      return {
        active: activeEndpoints,
        total: endpoints.length,
        deliveries: totalDeliveries,
        failures: failedDeliveries,
      };
    },
  });

  const { data: paymentStats = {}, isLoading: paymentLoading } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const payments = await base44.entities.Payment.list();
      const confirmedPayments = payments.filter((p) => p.status === "confirmed");
      const totalAda = confirmedPayments.reduce(
        (sum, p) => sum + (p.received_amount_ada || 0),
        0
      );
      return {
        confirmed: confirmedPayments.length,
        total: payments.length,
        volumeAda: totalAda,
      };
    },
  });

  const { data: errorCount = 0, isLoading: errorLoading } = useQuery({
    queryKey: ["error-count"],
    queryFn: async () => {
      const notifications = await base44.entities.Notification.filter({
        category: "admin",
      });
      return notifications.filter(
        (n) => n.severity === "critical" || n.severity === "warning"
      ).length;
    },
    refetchInterval: 10000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Total Merchants"
        value={merchantCount}
        isLoading={merchantLoading}
        icon={Users}
        description="Active merchant accounts"
      />

      <MetricsCard
        title="Active Webhooks"
        value={`${webhookStats.active}/${webhookStats.total}`}
        isLoading={webhookLoading}
        icon={Webhook}
        description={`${webhookStats.deliveries} total deliveries`}
      />

      <MetricsCard
        title="Transaction Volume"
        value={`${(paymentStats.volumeAda || 0).toFixed(2)} ADA`}
        isLoading={paymentLoading}
        icon={DollarSign}
        description={`${paymentStats.confirmed || 0} confirmed payments`}
      />

      <MetricsCard
        title="Critical Errors"
        value={errorCount}
        isLoading={errorLoading}
        icon={AlertCircle}
        description="Unresolved issues"
      />
    </div>
  );
}