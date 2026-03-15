import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Loader2, Ticket, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function EventEntry() {
  const params = new URLSearchParams(window.location.search);
  const ticketCode = params.get("ticket");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // null | { ok, ticket, event, message }
  const [checkinLoading, setCheckinLoading] = useState(false);

  useEffect(() => {
    if (!ticketCode) { setResult({ ok: false, message: "No ticket code provided." }); setLoading(false); return; }
    base44.functions.invoke("lookupEventTicket", { qrCode: ticketCode })
      .then(res => setResult(res.data))
      .catch(() => setResult({ ok: false, message: "Failed to look up ticket." }))
      .finally(() => setLoading(false));
  }, [ticketCode]);

  const handleCheckin = async () => {
    setCheckinLoading(true);
    const res = await base44.functions.invoke("checkinEventTicket", { qrCode: ticketCode });
    setResult(res.data);
    setCheckinLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const { ok, ticket, event, message, alreadyCheckedIn } = result || {};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center space-y-5">
        {!ok ? (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Invalid Ticket</h2>
            <p className="text-slate-400 text-sm">{message || "This ticket is not valid."}</p>
          </>
        ) : alreadyCheckedIn ? (
          <>
            <XCircle className="w-16 h-16 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Already Checked In</h2>
            <p className="text-slate-400 text-sm">This ticket was already used on {ticket?.checked_in_at ? format(new Date(ticket.checked_in_at), "d MMM yyyy HH:mm") : "—"}</p>
          </>
        ) : ticket?.status === "checked_in" ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-emerald-400">Check-in Successful!</h2>
            <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2">
              <p className="font-semibold text-white">{ticket.ticket_type_name}</p>
              <p className="flex items-center gap-1.5 text-sm text-slate-300"><User className="w-3.5 h-3.5 text-slate-400" />{ticket.attendee_name}</p>
              {event && <p className="flex items-center gap-1.5 text-sm text-slate-300"><Calendar className="w-3.5 h-3.5 text-slate-400" />{event.title}</p>}
            </div>
          </>
        ) : (
          <>
            <Ticket className="w-16 h-16 text-indigo-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Valid Ticket</h2>
            <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2">
              <p className="font-semibold text-white">{ticket?.ticket_type_name}</p>
              <p className="flex items-center gap-1.5 text-sm text-slate-300"><User className="w-3.5 h-3.5 text-slate-400" />{ticket?.attendee_name}</p>
              {event && <p className="flex items-center gap-1.5 text-sm text-slate-300"><Calendar className="w-3.5 h-3.5 text-slate-400" />{event.title}</p>}
            </div>
            <Button
              onClick={handleCheckin}
              disabled={checkinLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold gap-2"
            >
              {checkinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {checkinLoading ? "Processing…" : "Confirm Check-in"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}