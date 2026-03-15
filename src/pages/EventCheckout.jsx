import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, MapPin, Ticket, CheckCircle2, Loader2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";
import { toast } from "sonner";

export default function EventCheckout() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [step, setStep] = useState("select"); // select | pay | success
  const [ticket, setTicket] = useState(null);
  const [pollingTxHash, setPollingTxHash] = useState(null);

  useEffect(() => {
    if (!slug) { setError("No event found."); setLoading(false); return; }
    base44.functions.invoke("getEventBySlug", { slug })
      .then(res => {
        if (res.data?.error || !res.data?.event) { setError("Event not found."); return; }
        setEvent(res.data.event);
      })
      .catch(() => setError("Failed to load event."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelectTicket = async (ticketType) => {
    setSelectedTicketType(ticketType);
  };

  const handleProceedToPay = async () => {
    if (!selectedTicketType) return;
    if (event.collect_name && !attendeeName.trim()) { toast.error("Please enter your name"); return; }
    if (event.collect_email && !attendeeEmail.trim()) { toast.error("Please enter your email"); return; }

    const res = await base44.functions.invoke("createEventCheckoutSession", {
      eventId: event.id,
      ticketTypeId: selectedTicketType.id,
      attendeeName,
      attendeeEmail,
    });
    if (res.data?.error) { toast.error(res.data.error); return; }
    setSessionData(res.data);
    setStep("pay");
  };

  const handlePaySuccess = async (txHash) => {
    setPollingTxHash(txHash);
    setStep("success");
    // Poll for ticket confirmation
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const res = await base44.functions.invoke("confirmEventTicket", { txHash, eventId: event.id, attendeeEmail });
      if (res.data?.ticket) {
        clearInterval(poll);
        setTicket(res.data.ticket);
      }
      if (attempts > 30) clearInterval(poll);
    }, 5000);
  };

  const downloadTicket = () => {
    if (!ticket) return;
    const content = `PAYADA EVENT TICKET\n\n${event.title}\n${event.event_date ? format(new Date(event.event_date), "d MMM yyyy, HH:mm") : ""}\n${event.location || ""}\n\nTicket: ${ticket.ticket_type_name}\nAttendee: ${ticket.attendee_name}\nEmail: ${ticket.attendee_email}\nTicket ID: ${ticket.qr_code}\n\nPresent this QR code at the entrance: ${window.location.origin}/EventEntry?ticket=${ticket.qr_code}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${event.slug}-${ticket.qr_code?.slice(0, 8)}.txt`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Event Header */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          {event.logo_url && <img src={event.logo_url} alt={event.title} className="w-16 h-16 rounded-xl object-cover mb-4" />}
          <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
          {event.description && <p className="text-slate-400 text-sm mb-3">{event.description}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            {event.event_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {format(new Date(event.event_date), "d MMM yyyy, HH:mm")}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {event.is_online ? "Online" : event.location}
              </span>
            )}
          </div>
        </div>

        {/* Step: Select Ticket */}
        {step === "select" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select a Ticket</h2>
            {(event.ticket_types || []).map(tt => {
              const remaining = tt.capacity ? tt.capacity - (tt.sold || 0) : null;
              const isSoldOut = remaining !== null && remaining <= 0;
              return (
                <button
                  key={tt.id}
                  disabled={isSoldOut}
                  onClick={() => handleSelectTicket(tt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTicketType?.id === tt.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : isSoldOut
                      ? "border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed"
                      : "border-slate-700 bg-slate-900 hover:border-indigo-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{tt.name}</p>
                      {tt.description && <p className="text-xs text-slate-400 mt-0.5">{tt.description}</p>}
                      {remaining !== null && <p className="text-xs text-slate-500 mt-1">{isSoldOut ? "Sold out" : `${remaining} remaining`}</p>}
                    </div>
                    <p className="text-xl font-bold text-indigo-400">₳ {tt.price_ada}</p>
                  </div>
                </button>
              );
            })}

            {selectedTicketType && (
              <div className="space-y-3 pt-2">
                {event.collect_name && (
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Your Name</Label>
                    <Input value={attendeeName} onChange={e => setAttendeeName(e.target.value)} placeholder="Jane Doe" className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                )}
                {event.collect_email && (
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Email Address</Label>
                    <Input type="email" value={attendeeEmail} onChange={e => setAttendeeEmail(e.target.value)} placeholder="jane@example.com" className="bg-slate-800 border-slate-700 text-white" />
                    <p className="text-xs text-slate-500">Your ticket will be sent to this address</p>
                  </div>
                )}
                <Button onClick={handleProceedToPay} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold mt-2">
                  Continue to Payment →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step: Pay */}
        {step === "pay" && sessionData && (
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-400 mb-1">You are purchasing</p>
              <p className="font-semibold text-white">{selectedTicketType.name}</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">₳ {sessionData.amount_total_ada?.toFixed(2)}</p>
            </div>
            <WalletConnect onConnected={setConnectedWallet} onDisconnected={() => setConnectedWallet(null)} />
            {connectedWallet && (
              <WalletPayButton
                connectedWallet={connectedWallet}
                sessionData={sessionData}
                paymentLink={{ ...event, id: event.id, amount_mode: "fixed_ada", receive_address: event.receive_address || sessionData.merchant_address }}
                payerEmail={attendeeEmail}
                payerName={attendeeName}
                onSuccess={handlePaySuccess}
              />
            )}
            <button onClick={() => setStep("select")} className="text-xs text-slate-500 hover:text-slate-300 underline w-full text-center">← Go back</button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Payment Submitted!</h2>
            <p className="text-slate-400 text-sm">Your transaction is being confirmed on the Cardano blockchain. Your ticket will be sent to {attendeeEmail}.</p>

            {ticket ? (
              <div className="space-y-3 pt-2">
                <div className="bg-slate-800 rounded-xl p-4 text-left space-y-1.5">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Your Ticket</p>
                  <p className="font-semibold text-white">{ticket.ticket_type_name}</p>
                  <p className="text-xs text-slate-400 font-mono break-all">ID: {ticket.qr_code}</p>
                </div>
                <Button onClick={downloadTicket} variant="outline" className="w-full gap-2 border-slate-700 text-slate-300 hover:text-white">
                  <Download className="w-4 h-4" /> Download Ticket
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for blockchain confirmation…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}