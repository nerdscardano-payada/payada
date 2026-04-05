import React from "react";
import AIBuilderRequestForm from "@/components/ai-builder/AIBuilderRequestForm";

export default function AIBuilderRequest() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="text-2xl font-semibold text-foreground">Tool builder aanvraag</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Vul hieronder je wensen in. Je accountgegevens worden automatisch ingevuld zodat een admin je aanvraag snel kan uitwerken en testen in de Tool builder.
        </p>
      </div>
      <AIBuilderRequestForm />
    </div>
  );
}