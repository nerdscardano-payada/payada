import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Hexagon, Copy, CheckCircle2, Clock, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function pay() {
  const [slug, setSlug] = useState("");
  const [paymentLink, setPaymentLink] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // Extract slug from URL
  useEffect(() => {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const payIndex = pathSegments.indexOf("pay");
    const paySlug = pathSegments[payIndex + 1];
    if (paySlug) {
      setSlug(paySlug);
    } else {
      setLoading(false);
    }
  }, []);

  // Load payment link by slug
  const { data: links = [] } = useQuery({
    queryKey: ["checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  useEffect(() => {
    if (links.length > 0) {
      setPaymentLink(links[0]);
      setLoading(false);
    } else if (links.length === 0 && slug) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [links, slug]);

  const handleStartCheckout = async () => {
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        paymentLinkId: paymentLink.id
      });
      setSessionData(response.data);
      setSessionStarted(true);
    } catch (err) {
      toast.error("Failed to start checkout");
    }
  };

  const copyAddress = () => {
    if (paymentLink?.receive_address) {
      navigator.clipboard.writeText(paymentLink.receive_address);
      toast.success("Address copied!");
    }
  };

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Invalid checkout link</h2>
          <p className="text-slate-400 mt-2">No payment link slug provided.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Payment link not found</h2>
          <p className="text-slate-400 mt-2">This link may have expired or been disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        {/* Checkout Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white">{paymentLink.title}</h1>
            {paymentLink.description && (
              <p className="text-sm text-slate-400 mt-2">{paymentLink.description}</p>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">₳ {paymentLink.amount_ada?.toFixed(2)}</span>
              <span className="text-sm text-slate-500">ADA</span>
            </div>
          </div>

          {!sessionStarted ? (
            <div className="p-6 space-y-4">
              {paymentLink.collect_email && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Email</Label>
                  <Input
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
              {paymentLink.collect_name && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Name</Label>
                  <Input
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
              <Button
                onClick={handleStartCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold"
              >
                Pay ₳ {paymentLink.amount_ada?.toFixed(2)}
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="flex items-center gap-3">
                {paymentStatus === "pending" && <Clock className="w-5 h-5 text-amber-400" />}
                {paymentStatus === "detected" && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                {paymentStatus === "confirmed" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                <div>
                  <p className="text-sm font-medium text-white">
                    {paymentStatus === "pending" && "Waiting for payment..."}
                    {paymentStatus === "detected" && "Payment detected, confirming..."}
                    {paymentStatus === "confirmed" && "Payment confirmed!"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {paymentStatus === "pending" && "Send ADA to the address below"}
                    {paymentStatus === "detected" && "Waiting for block confirmations"}
                    {paymentStatus === "confirmed" && "Thank you for your payment"}
                  </p>
                </div>
              </div>

              {paymentStatus !== "confirmed" && (
                <>
                  {/* Fee Breakdown */}
                  {sessionData && (
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="text-white font-semibold">₳ {sessionData.amount_total_ada.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Platform Fee ({sessionData.platform_fee_percent}%):</span>
                        <span>₳ {sessionData.platform_fee_ada.toFixed(3)}</span>
                      </div>
                      <div className="border-t border-slate-700 pt-2 flex justify-between">
                        <span>Merchant Receives:</span>
                        <span className="text-emerald-400 font-semibold">₳ {sessionData.merchant_amount_ada.toFixed(3)}</span>
                      </div>
                    </div>
                  )}

                  {/* QR placeholder */}
                  <div className="bg-white rounded-xl p-6 flex items-center justify-center">
                    <div className="w-40 h-40 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                      QR Code
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label className="text-xs text-slate-500">Send ADA to:</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="flex-1 bg-slate-800 px-3 py-2.5 rounded-lg text-xs text-slate-300 font-mono break-all border border-slate-700">
                        {sessionData?.receive_address || paymentLink.receive_address || "addr1q9..."}
                      </code>
                      <Button variant="outline" size="icon" onClick={copyAddress} className="border-slate-700 text-slate-400 hover:text-white flex-shrink-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white gap-2">
                      Connect Wallet
                    </Button>
                  </div>
                </>
              )}

              {paymentStatus === "confirmed" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-base font-semibold text-white">Payment Complete</p>
                  <p className="text-sm text-slate-400 mt-1">Your transaction has been confirmed on the Cardano blockchain.</p>
                  {paymentLink.success_redirect_url && (
                    <a href={paymentLink.success_redirect_url} className="inline-flex items-center gap-1 text-indigo-400 text-sm mt-3 hover:underline">
                      Continue <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Secure Cardano ADA payment · PayADA.io
        </p>
      </div>
    </div>
  );
}