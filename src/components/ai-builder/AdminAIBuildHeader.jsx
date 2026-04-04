import React from "react";
import { Bot } from "lucide-react";

export default function AdminAIBuildHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bot className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">AI Payment Builder</h1>
        <p className="text-sm text-muted-foreground">Admin-only prototype to generate payment links and subscription plans by chat.</p>
      </div>
    </div>
  );
}