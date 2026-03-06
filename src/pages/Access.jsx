import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";
import { CheckCircle, Users, ExternalLink, Loader2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PLATFORM_ICONS = {
  discord: "🎮",
  telegram: "✈️",
  whatsapp: "💬",
  website: "🌐",
  other: "🔗",
};

const PLATFORM_LABELS = {
  discord: "Join Discord Server",
  telegram: "Join Telegram Group",
  whatsapp: "Join WhatsApp Group",
  website: "Access Website",
  other: "Access Community",
};

export default function Access() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const [accessLink, setAccessLink] = useState(null);
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [connectedWallet, setConnectedWallet] = useState(null); // { api, walletId, address, lovelace }

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, detected, confirmed
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    if (!slug) { setError("No access link specified."); setLoading(false); return; }
    base44.functions.invoke("getAccessLinkBySlug", { slug })
      .then(res => {
        const { link, merchantProfile } = res.data;
        if (!link) { setError("Access link not found."); setLoading(false); return; }
        setAccessLink(link);
        setMerchantProfile(merchantProfile);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load access link."); setLoading(false); });
  }, [slug]);

  const handlePaymentConfirmed = async (hash) => {
    setTxHash(hash);
    setPaymentStatus("detected");
    setGrantingAccess(true);

    // Poll for payment confirmation (detected → confirmed status)
    let payment = null;
    const maxCheckAttempts = 20;
    const checkDelayMs = 3000;
    for (let attempt = 1; attempt <= maxCheckAttempts; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, checkDelayMs));
        const res = await base44.functions.invoke("checkTxConfirmation", { txHash: hash });
        payment = res.data;
        if (payment?.status === "confirmed") {
          setPaymentStatus("confirmed");
          break;
        }
      } catch {
        // Endpoint may not exist yet, continue polling
      }
    }

    // Now that payment is confirmed, grant access
    let grantRes = null;
    try {
      const res = await base44.functions.invoke("grantCommunityAccess", { txHash: hash, accessLinkId: accessLink.id });
      grantRes = res.data;
    } catch {
      grantRes = { invite_link: accessLink.invite_link };
    }

    setInviteLink(grantRes?.invite_link || accessLink.invite_link);
    setPaymentConfirmed(true);
    setAccessGranted(true);
    setGrantingAccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Payment status screen
  if (grantingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2">
            {paymentStatus === "detected" && <Clock className="w-5 h-5 text-amber-400 animate-pulse" />}
            {paymentStatus === "confirmed" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-semibold text-slate-300">
              {paymentStatus === "detected" ? "Confirming payment..." : "Payment confirmed"}
            </span>
          </div>

          {paymentStatus === "detected" && (
            <>
              <div className="space-y-2">
                <p className="text-white text-lg font-semibold">Transaction submitted</p>
                <p className="text-slate-400 text-sm">Waiting for blockchain confirmation. This usually takes 20-30 seconds.</p>
              </div>
              {txHash && (
                <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xs hover:underline break-all">
                  {txHash.slice(0, 20)}...
                </a>
              )}
            </>
          )}

          {paymentStatus === "confirmed" && (
            <>
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
              <p className="text-white text-lg font-semibold">Granting access...</p>
            </>
          )}

          {paymentConfirmed && !grantingAccess && (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Payment Confirmed!</h2>
                <p className="text-slate-300 mt-2">Your access is ready.</p>
              </div>
              {inviteLink && (
                <a href={inviteLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-base py-5">
                    {PLATFORM_ICONS[accessLink.platform]} {PLATFORM_LABELS[accessLink.platform]}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}
              {!inviteLink && (
                <p className="text-slate-400 text-sm">Your Discord role has been assigned. Check your server!</p>
              )}
              <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secured by PayADA</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const feePercent = merchantProfile?.platform_fee_percent ?? 1.75;
  const totalAda = accessLink.price_ada;
  const feeAda = +(totalAda * feePercent / 100).toFixed(6);
  const merchantAda = +(totalAda - feeAda).toFixed(6);

  // Build a fake payment link config for WalletPayButton
  const paymentLinkConfig = {
    id: null, // this is an access link, not a payment link
    accessLinkId: accessLink.id,
    merchant_id: accessLink.merchant_id,
    slug: accessLink.slug,
    amount_ada: totalAda,
    amount_mode: "fixed_ada",
    receive_address: accessLink.receive_address || merchantProfile?.default_receive_address,
    collect_name: false,
    collect_email: false,
    confirmations_required: 2,
  };

  const extraData = {
    payer_name: memberName || undefined,
    payer_email: memberEmail || undefined,
    payer_discord_username: discordUsername || undefined,
    access_link_id: accessLink.id,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">

        {/* Header card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center space-y-3">
          {accessLink.logo_url ? (
            <img src={accessLink.logo_url} alt={accessLink.title} className="w-16 h-16 rounded-full mx-auto object-cover" />
          ) : (
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-2xl">
              {PLATFORM_ICONS[accessLink.platform]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{accessLink.title}</h1>
            <p className="text-indigo-300 text-sm mt-0.5">{PLATFORM_LABELS[accessLink.platform]}</p>
          </div>
          {accessLink.description && (
            <p className="text-slate-300 text-sm leading-relaxed">{accessLink.description}</p>
          )}
          <div className="pt-2 border-t border-white/10">
            <p className="text-3xl font-bold text-white">₳ {totalAda.toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-1">One-time access fee</p>
          </div>
        </div>

        {/* Member info fields */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Your Name / Username <span className="text-red-400">*</span></Label>
            <Input
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              placeholder="Full name or username"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-sm">Email Address <span className="text-slate-500 font-normal">(optional)</span></Label>
            <Input
              type="email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>
          {accessLink.platform === "discord" && accessLink.discord_bot_token && (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Discord Username <span className="text-red-400">*</span></Label>
              <Input
                value={discordUsername}
                onChange={e => setDiscordUsername(e.target.value)}
                placeholder="yourname (no @ needed)"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Required for automatic role assignment</p>
            </div>
          )}
        </div>

        {/* Wallet section */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-3">
          <WalletConnect
            onConnected={(walletData) => setConnectedWallet(walletData)}
            onDisconnected={() => setConnectedWallet(null)}
          />

          {connectedWallet && !memberName.trim() && (
            <p className="text-amber-400 text-sm text-center">Please enter your name to continue.</p>
          )}
          {connectedWallet && memberName.trim() && (
            <WalletPayButton
              connectedWallet={connectedWallet}
              sessionData={{
                merchant_address: paymentLinkConfig.receive_address,
                merchant_amount_lovelace: Math.floor(merchantAda * 1_000_000),
                merchant_amount_ada: merchantAda,
                platform_fee_lovelace: Math.floor(feeAda * 1_000_000),
                platform_fee_ada: feeAda,
                amount_total_ada: totalAda,
              }}
              paymentLink={paymentLinkConfig}
              payerName={memberName || null}
              payerEmail={memberEmail || null}
              payerDiscordUsername={discordUsername || null}
              onSuccess={handlePaymentConfirmed}
            />
          )}
        </div>

        {/* Fee info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Platform fee ({feePercent}%): ₳{feeAda.toFixed(4)}</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>PayADA</span>
          </div>
        </div>

      </div>
    </div>
  );
}