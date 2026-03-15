import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Users, CheckCircle2, Clock, Ticket, Mail, Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-600",
};

const STATUS_ICONS = {
  pending:    <Clock className="w-3 h-3" />,
  confirmed:  <Ticket className="w-3 h-3" />,
  checked_in: <CheckCircle2 className="w-3 h-3" />,
};

export default function EventAttendeesPanel({ event, onBack }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["eventTickets", event.id],
    queryFn: () => base44.entities.EventTicket.filter({ event_id: event.id }, "-created_date"),
    refetchInterval: 15000,
  });

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.attendee_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.attendee_email?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_type_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.qr_code?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = tickets
    .filter(t => t.status !== "cancelled")
    .reduce((sum, t) => sum + (t.price_ada || 0), 0);
  const checkedIn = tickets.filter(t => t.status === "checked_in").length;
  const confirmed = tickets.filter(t => t.status === "confirmed").length;
  const pending = tickets.filter(t => t.status === "pending").length;

  const exportCsv = () => {
    const header = "Name,Email,Ticket Type,Price (ADA),Status,Checked In At,Ticket ID";
    const rows = tickets.map(t => [
      t.attendee_name || "",
      t.attendee_email || "",
      t.ticket_type_name || "",
      t.price_ada || 0,
      t.status,
      t.checked_in_at ? format(new Date(t.checked_in_at), "d MMM yyyy HH:mm") : "",
      t.qr_code || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees-${event.slug}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">Attendees: {event.title}</h1>
          <p className="text-sm text-slate-500">
            {event.event_date ? format(new Date(event.event_date), "d MMM yyyy, HH:mm") : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5 text-xs flex-shrink-0">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Total</p>
          <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Checked In</p>
          <p className="text-2xl font-bold text-emerald-600">{checkedIn}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-blue-500" /> Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{confirmed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Revenue</p>
          <p className="text-2xl font-bold text-indigo-600">₳ {totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or ticket ID…" className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {["all", "confirmed", "checked_in", "pending", "cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                statusFilter === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {s === "all" ? `All (${tickets.length})` : s === "checked_in" ? `Checked In (${checkedIn})` : s === "confirmed" ? `Confirmed (${confirmed})` : s === "pending" ? `Pending (${pending})` : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{search || statusFilter !== "all" ? "No attendees match your filters" : "No tickets sold yet"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Attendee</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Checked In</span>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map(ticket => (
              <div key={ticket.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr_1fr] gap-4 items-center">
                  <span className="font-medium text-slate-900 truncate">{ticket.attendee_name || <span className="text-slate-400 italic">Anonymous</span>}</span>
                  <span className="text-sm text-slate-500 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {ticket.attendee_email || "—"}
                  </span>
                  <span className="text-sm text-slate-600 truncate">{ticket.ticket_type_name}</span>
                  <span className="text-sm font-medium text-indigo-600">₳ {ticket.price_ada}</span>
                  <Badge className={`${STATUS_COLORS[ticket.status]} gap-1 w-fit`}>
                    {STATUS_ICONS[ticket.status]}
                    {ticket.status === "checked_in" ? "Checked In" : ticket.status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {ticket.checked_in_at ? format(new Date(ticket.checked_in_at), "HH:mm") : "—"}
                  </span>
                </div>
                {/* Mobile card */}
                <div className="md:hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{ticket.attendee_name || "Anonymous"}</span>
                    <Badge className={`${STATUS_COLORS[ticket.status]} gap-1`}>
                      {STATUS_ICONS[ticket.status]}
                      {ticket.status === "checked_in" ? "Checked In" : ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{ticket.attendee_email}</p>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>{ticket.ticket_type_name}</span>
                    <span className="text-indigo-600 font-medium">₳ {ticket.price_ada}</span>
                    {ticket.checked_in_at && <span className="text-emerald-600">✓ {format(new Date(ticket.checked_in_at), "HH:mm")}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}