import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function EventForm({ event, user, onBack }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    is_online: false,
    event_date: "",
    doors_open: "",
    logo_url: "",
    organizer_name: "",
    receive_address: "",
    fee_model: "merchant_pays",
    collect_name: true,
    collect_email: true,
    status: "active",
    ticket_types: [{ id: generateId(), name: "General Admission", description: "", price_ada: "", capacity: "" }],
    ...event,
    ticket_types: event?.ticket_types?.length ? event.ticket_types : [{ id: generateId(), name: "General Admission", description: "", price_ada: "", capacity: "" }],
    event_date: event?.event_date ? event.event_date.slice(0, 16) : "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setTicket = (idx, k, v) => setForm(f => {
    const tts = [...f.ticket_types];
    tts[idx] = { ...tts[idx], [k]: v };
    return { ...f, ticket_types: tts };
  });

  const addTicketType = () => setForm(f => ({
    ...f,
    ticket_types: [...f.ticket_types, { id: generateId(), name: "", description: "", price_ada: "", capacity: "" }]
  }));

  const removeTicketType = (idx) => setForm(f => ({
    ...f,
    ticket_types: f.ticket_types.filter((_, i) => i !== idx)
  }));

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (event?.id) return base44.entities.Event.update(event.id, data);
      return base44.entities.Event.create({ ...data, merchant_id: user.email, total_tickets_sold: 0, total_received_ada: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(event ? "Event updated" : "Event created");
      onBack();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    if (!form.ticket_types.length) { toast.error("Add at least one ticket type"); return; }
    for (const tt of form.ticket_types) {
      if (!tt.name || !tt.price_ada) { toast.error("All ticket types need a name and price"); return; }
    }
    // Check slug uniqueness
    const existing = await base44.entities.Event.filter({ slug: form.slug });
    const conflict = existing.find(e => e.id !== event?.id);
    if (conflict) { toast.error(`Slug "${form.slug}" is already in use. Please choose a different slug.`); return; }
    saveMutation.mutate({
      ...form,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      ticket_types: form.ticket_types.map(tt => ({
        ...tt,
        price_ada: parseFloat(tt.price_ada) || 0,
        capacity: tt.capacity ? parseInt(tt.capacity) : null,
        sold: tt.sold || 0,
      })),
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{event ? "Edit Event" : "New Event"}</h1>
          <p className="text-sm text-slate-500">Sell tickets with ADA payments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Event Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Event Name *</Label>
              <Input value={form.title} onChange={e => { set("title", e.target.value); if (!event) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="Cardano Meetup Brussels" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} placeholder="cardano-meetup-bxl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="What is this event about?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={form.event_date} onChange={e => set("event_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Doors Open</Label>
              <Input value={form.doors_open} onChange={e => set("doors_open", e.target.value)} placeholder="19:00" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_online} onCheckedChange={v => set("is_online", v)} />
            <Label>Online Event</Label>
          </div>
          <div className="space-y-1.5">
            <Label>{form.is_online ? "Meeting Link" : "Location"}</Label>
            <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder={form.is_online ? "https://meet.google.com/..." : "Brussels, Belgium"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Organizer Name</Label>
              <Input value={form.organizer_name} onChange={e => set("organizer_name", e.target.value)} placeholder="Cardano Belgium" />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={e => set("logo_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Ticket Types</h2>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Type
            </Button>
          </div>
          {form.ticket_types.map((tt, idx) => (
            <div key={tt.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Ticket Type {idx + 1}</span>
                {form.ticket_types.length > 1 && (
                  <button type="button" onClick={() => removeTicketType(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name *</Label>
                  <Input value={tt.name} onChange={e => setTicket(idx, "name", e.target.value)} placeholder="VIP / Early Bird" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price (ADA) *</Label>
                  <Input type="number" value={tt.price_ada} onChange={e => setTicket(idx, "price_ada", e.target.value)} placeholder="25" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Capacity (optional)</Label>
                  <Input type="number" value={tt.capacity} onChange={e => setTicket(idx, "capacity", e.target.value)} placeholder="100" className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input value={tt.description} onChange={e => setTicket(idx, "description", e.target.value)} placeholder="Includes dinner" className="h-8 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Payment Settings</h2>
          <div className="space-y-1.5">
            <Label>Receive Address</Label>
            <Input value={form.receive_address} onChange={e => set("receive_address", e.target.value)} placeholder="addr1..." />
          </div>
          <div className="space-y-1.5">
            <Label>Fee Model</Label>
            <Select value={form.fee_model} onValueChange={v => set("fee_model", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant_pays">Merchant pays fee</SelectItem>
                <SelectItem value="customer_pays">Customer pays fee</SelectItem>
                <SelectItem value="split">Split 50/50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.collect_name} onCheckedChange={v => set("collect_name", v)} />
              <Label>Collect name</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.collect_email} onCheckedChange={v => set("collect_email", v)} />
              <Label>Collect email</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
          <Button type="submit" disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saveMutation.isPending ? "Saving…" : event ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}