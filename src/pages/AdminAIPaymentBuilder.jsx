import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AdminAIBuildHeader from "@/components/ai-builder/AdminAIBuildHeader";
import AdminAIBuildAccessDenied from "@/components/ai-builder/AdminAIBuildAccessDenied";
import AdminAIBuildIntroCard from "@/components/ai-builder/AdminAIBuildIntroCard";
import AdminAIBuildChat from "@/components/ai-builder/AdminAIBuildChat";

export default function AdminAIPaymentBuilder() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <AdminAIBuildAccessDenied />;
  }

  return (
    <div className="space-y-6">
      <AdminAIBuildHeader />
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AdminAIBuildIntroCard />
        <AdminAIBuildChat />
      </div>
    </div>
  );
}