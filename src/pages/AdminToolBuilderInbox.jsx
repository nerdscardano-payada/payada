import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AdminAIBuildAccessDenied from "@/components/ai-builder/AdminAIBuildAccessDenied";
import AdminRequestInbox from "@/components/ai-builder/AdminRequestInbox";

export default function AdminToolBuilderInbox() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <AdminAIBuildAccessDenied />;
  }

  return <AdminRequestInbox />;
}