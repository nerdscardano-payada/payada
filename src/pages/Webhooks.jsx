import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Webhook, Plus, Trash2, MoreHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const eventTypes = [
  "payment.detected",
  "payment.confirmed",
  "payment.expired",
  "subscription.created",
  "subscription.invoice_created",
  "subscription.payment_detected",
  "subscription.payment_confirmed",
  "subscription.late",
  "subscription.cancelled",
];

export default function Webhooks() {
  const [showDialog, setShowDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["webhookEndpoints"],
    queryFn: () => base44.entities.WebhookEndpoint.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WebhookEndpoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhookEndpoints"] });
      toast.success("Webhook endpoint created");
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhookEndpoints"] });
      toast.success("Webhook deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.WebhookEndpoint.update(id, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhookEndpoints"] }),
  });

  const resetForm = () => { setUrl(""); setName(""); setSelectedEvents([]); };

  const toggleEvent = (event) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreate = () => {
    const secret = "whsec_" + Math.random().toString(36).slice(2, 18);
    createMutation.mutate({ url, name, event_types: selectedEvents, secret, enabled: true });
  };

  return (
    <div>
      <PageHeader
        title="Webhooks"
        subtitle="Receive event notifications via HTTP callbacks"
        action={() => setShowDialog(true)}
        actionLabel="Add Endpoint"
        actionIcon={Plus}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No webhook endpoints"
            description="Add a webhook endpoint to receive real-time event notifications."
            actionLabel="Add Endpoint"
            onAction={() => setShowDialog(true)}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{wh.name || wh.url}</p>
                    <span className={`w-2 h-2 rounded-full ${wh.enabled ? "bg-emerald-400" : "bg-slate-300"}`} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{wh.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(wh.event_types || []).map((evt) => (
                      <span key={evt} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{evt}</span>
                    ))}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleMutation.mutate({ id: wh.id, enabled: !wh.enabled })}>
                      {wh.enabled ? "Disable" : "Enable"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(wh.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Server" />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL *</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourserver.com/webhooks/payada" />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {eventTypes.map((evt) => (
                  <label key={evt} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedEvents.includes(evt)}
                      onCheckedChange={() => toggleEvent(evt)}
                    />
                    <span className="font-mono text-xs text-slate-600">{evt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!url || createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Endpoint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}