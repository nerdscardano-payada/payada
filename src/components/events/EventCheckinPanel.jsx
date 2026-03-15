import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, CheckCircle2, Clock, Users, QrCode, ExternalLink } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function EventCheckinPanel({ event, onBack }) {
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["eventTickets", event.id],
    queryFn: () => base44.entities.EventTicket.filter({ event_id: event.id }, "-created_date"),
    refetchInterval: 10000,
  });

  const checkinUrl = `${window.location.origin}/EventEntry?ticket=`;

  const filtered = tickets.filter(t =>
    !search || t.attendee_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.attendee_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.qr_code?.toLowerCase().includes(search.toLowerCase())
  );

  const confirmed = tickets.filter(t => t.status === "confirmed").length;
  const checkedIn = tickets.filter(t => t.status === "checked_in").length;
  const pending = tickets.filter(t => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Check-in: {event.title}</h1>
          <p className="text-sm text-slate-500">Manage attendees and scan tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Tickets</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{checkedIn}</p>
          <p className="text-xs text-slate-500 mt-0.5">Checked In</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{confirmed}</p>
          <p className="text-xs text-slate-500 mt-0.5">Confirmed</p>
        </div>
      </div>

      {/* QR Scanner link */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <QrCode className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Mobile Check-in</p>
          <p className="text-xs text-indigo-600 mt-0.5">Open the check-in scanner on a mobile device. Each ticket has a unique URL to scan or visit.</p>
          <p className="text-xs text-indigo-500 font-mono mt-1 break-all">{checkinUrl}[ticket-id]</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or ticket ID…" className="pl-9" />
      </div>

      {/* Ticket list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{search ? "No tickets match your search" : "No tickets sold yet"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 truncate">{ticket.attendee_name || "Anonymous"}</p>
                  <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 truncate">{ticket.attendee_email}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ticket.ticket_type_name} · {ticket.price_ada} ₳</p>
                {ticket.checked_in_at && (
                  <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {format(new Date(ticket.checked_in_at), "HH:mm")}
                  </p>
                )}
              </div>
              <a
                href={`${checkinUrl}${ticket.qr_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Open check-in page"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}