import React from "react";

export default function AdminAIBuildAccessDenied() {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
      <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
      <p className="mt-2 text-sm text-muted-foreground">This prototype is only visible to admins.</p>
    </div>
  );
}