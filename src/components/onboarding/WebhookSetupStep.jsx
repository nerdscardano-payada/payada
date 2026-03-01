import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

const DEFAULT_EVENTS = [
  { value: "payment_confirmed", label: "Payment Confirmed" },
  { value: "payment_detected", label: "Payment Detected" },
  { value: "payment_refunded", label: "Payment Refunded" },
];

export default function WebhookSetupStep({ data, onChange }) {
  const [newEndpoint, setNewEndpoint] = useState({ url: "", selectedEvents: [] });

  const addEndpoint = () => {
    if (!newEndpoint.url || newEndpoint.selectedEvents.length === 0) {
      return;
    }

    const endpoints = data.webhook_endpoints || [];
    onChange({
      ...data,
      webhook_endpoints: [
        ...endpoints,
        {
          url: newEndpoint.url,
          event_types: newEndpoint.selectedEvents,
          enabled: true,
        },
      ],
    });

    setNewEndpoint({ url: "", selectedEvents: [] });
  };

  const removeEndpoint = (index) => {
    const endpoints = data.webhook_endpoints || [];
    onChange({
      ...data,
      webhook_endpoints: endpoints.filter((_, i) => i !== index),
    });
  };

  const toggleEvent = (eventValue) => {
    setNewEndpoint((prev) => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(eventValue)
        ? prev.selectedEvents.filter((e) => e !== eventValue)
        : [...prev.selectedEvents, eventValue],
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Webhook Configuration</CardTitle>
          <CardDescription>
            Connect your systems to receive real-time payment notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Webhooks are optional but recommended. They allow your system to be
              notified instantly when payments are confirmed.
            </AlertDescription>
          </Alert>

          {/* Webhook Endpoints List */}
          {data.webhook_endpoints && data.webhook_endpoints.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Configured Endpoints</h3>
              {data.webhook_endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {endpoint.url}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {endpoint.event_types?.join(", ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEndpoint(idx)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Endpoint */}
          <div className="space-y-4 p-4 border-2 border-dashed border-slate-200 rounded-lg">
            <h3 className="font-medium text-slate-900">Add Webhook Endpoint</h3>

            <div className="space-y-2">
              <Label htmlFor="webhook_url">Endpoint URL</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://your-domain.com/webhooks"
                value={newEndpoint.url}
                onChange={(e) =>
                  setNewEndpoint({ ...newEndpoint, url: e.target.value })
                }
              />
              <p className="text-xs text-slate-500">
                We'll send POST requests to this URL with payment updates
              </p>
            </div>

            <div className="space-y-3">
              <Label>Subscribe to Events</Label>
              {DEFAULT_EVENTS.map((event) => (
                <div key={event.value} className="flex items-center gap-2">
                  <Checkbox
                    id={event.value}
                    checked={newEndpoint.selectedEvents.includes(event.value)}
                    onCheckedChange={() => toggleEvent(event.value)}
                  />
                  <label
                    htmlFor={event.value}
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    {event.label}
                  </label>
                </div>
              ))}
            </div>

            <Button
              onClick={addEndpoint}
              disabled={!newEndpoint.url || newEndpoint.selectedEvents.length === 0}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Endpoint
            </Button>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <p className="text-sm font-medium text-slate-900">Webhook Format</p>
            <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(
                {
                  event_type: "payment_confirmed",
                  data: {
                    payment_id: "pay_123...",
                    amount_ada: 100,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}