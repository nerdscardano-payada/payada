import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";

const EVENT_TYPES = [
  { value: "payment_detected", label: "Payment Detected", category: "Payment" },
  { value: "payment_confirmed", label: "Payment Confirmed", category: "Payment" },
  { value: "payment_refunded", label: "Payment Refunded", category: "Payment" },
  { value: "subscription_payment_failed", label: "Subscription Payment Failed", category: "Subscription" },
  { value: "dispute_initiated", label: "Dispute Initiated", category: "Dispute" },
  { value: "webhook_failed", label: "Webhook Delivery Failed", category: "System" },
];

export default function WebhookEndpointManager({ merchantId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    name: "",
    event_types: [],
  });
  const queryClient = useQueryClient();

  const { data: endpoints = [], isLoading } = useQuery({
    queryKey: ["webhook-endpoints", merchantId],
    queryFn: () =>
      base44.entities.WebhookEndpoint.filter({
        merchant_id: merchantId,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.WebhookEndpoint.create({
        merchant_id: merchantId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints", merchantId] });
      setFormData({ url: "", name: "", event_types: [] });
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints", merchantId] });
    },
  });

  const toggleEventType = (eventType) => {
    setFormData((prev) => ({
      ...prev,
      event_types: prev.event_types.includes(eventType)
        ? prev.event_types.filter((e) => e !== eventType)
        : [...prev.event_types, eventType],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.url || formData.event_types.length === 0) {
      alert("Please fill in all fields and select at least one event");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Webhook Endpoints</span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Endpoint URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/webhooks"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Endpoint Name</Label>
                    <Input
                      placeholder="e.g., Order Processing System"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="mb-3 block">Subscribe to Events</Label>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Array.from(
                        new Map(
                          EVENT_TYPES.map((e) => [e.category, e])
                        ).values()
                      ).map((category) => (
                        <div key={category.category}>
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            {category.category}
                          </p>
                          <div className="space-y-2 ml-2">
                            {EVENT_TYPES.filter(
                              (e) => e.category === category.category
                            ).map((event) => (
                              <div key={event.value} className="flex items-center gap-2">
                                <Checkbox
                                  id={event.value}
                                  checked={formData.event_types.includes(
                                    event.value
                                  )}
                                  onCheckedChange={() =>
                                    toggleEventType(event.value)
                                  }
                                />
                                <label
                                  htmlFor={event.value}
                                  className="text-sm cursor-pointer"
                                >
                                  {event.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Endpoint"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading endpoints...
            </div>
          ) : endpoints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No webhook endpoints configured</p>
              <Button size="sm" onClick={() => setIsOpen(true)}>
                Add Your First Endpoint
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead>Failures</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{endpoint.name}</p>
                          <p className="text-xs text-slate-500">{endpoint.url}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {endpoint.event_types?.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event.split("_")[0]}
                            </Badge>
                          ))}
                          {endpoint.event_types?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{endpoint.event_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {endpoint.enabled ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Disabled</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {endpoint.delivery_count || 0}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="text-red-600 font-medium">
                          {endpoint.failure_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(endpoint.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {endpoints.some((e) => e.failure_count > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Some webhook endpoints have failed deliveries. Check the event history
            for details and retry options.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}