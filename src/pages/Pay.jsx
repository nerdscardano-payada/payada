import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon, Copy, CheckCircle2, Clock, Loader2, Zap,
  ExternalLink, AlertCircle, Wallet, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MerchantHeader from "@/components/shared/MerchantHeader";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";
import AdaRatePreview from "@/components/checkout/AdaRatePreview";
import WalletHealthCheck from "@/components/checkout/WalletHealthCheck";
import SimplePaySummaryCard from "@/components/pay/SimplePaySummaryCard";

export default function Pay() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentLink, setPaymentLink] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [payerDiscordUsername, setPayerDiscordUsername] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Wallet state
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [txSubmitted, setTxSubmitted] = useState(false);
  const [walletHealth, setWalletHealth] = useState(null);

  const multiCntEnabled = paymentLink?.enable_multi_cnt_checkout && paymentLink?.amount_mode === "fixed_ada" && (paymentLink?.accepted_cnt_tokens || []).length > 0;

  // Detect NFT-related checkouts and merchant fulfillment mode
  const { data: merchantProfiles = [] } = useQuery({
    queryKey: ["merchant-profile-for-pay", paymentLink?.merchant_id],
    queryFn: () => base44.entities.MerchantProfile.filter({ user_id: paymentLink.merchant_id }, "-created_date", 1),
    enabled: !!paymentLink?.merchant_id,
  });
  const merchantProfile = merchantProfiles[0] || null;

  const { data: relatedListings = [] } = useQuery({
    queryKey: ["listing-by-payment-link", paymentLink?.id],
    queryFn: () => base44.entities.NftListing.filter({ payment_link_id: paymentLink.id }, "-created_date", 1),
    enabled: !!paymentLink?.id && !paymentLink.id.startsWith("cart-"),
  });

  const { data: relatedRules = [] } = useQuery({
    queryKey: ["nft-rule-by-payment-link", paymentLink?.id],
    queryFn: () => base44.entities.NftFulfillmentRule.filter({ payment_link_id: paymentLink.id }, "-created_date", 1),
    enabled: !!paymentLink?.id && !paymentLink.id.startsWith("cart-"),
  });

  const isNftCheckout = (cartItems.length > 0) || (relatedListings.length > 0) || (relatedRules.length > 0);
  const showNameInput = isNftCheckout || paymentLink?.collect_name;
  const showEmailInput = isNftCheckout || paymentLink?.collect_email;
  const requireName = isNftCheckout || paymentLink?.collect_name;
  const requireEmail = !isNftCheckout && paymentLink?.collect_email;

  // Extract slug or cartItems from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paySlug = params.get("slug");
    const cartParam = params.get("cartItems");
    
    console.log("URL params - slug:", paySlug, "cartParam:", cartParam);
    
    if (paySlug) {
      setSlug(paySlug);
      setLoading(true);
    } else if (cartParam) {
      try {
        const decoded = atob(cartParam);
        console.log("Decoded cartParam:", decoded);
        const items = JSON.parse(decoded);
        console.log("Parsed cart items:", items);
        setCartItems(items);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cartItems:", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // For single slug checkout
  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ["checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  // For multi-item cart checkout — fetch merchant info from first item's slug
  const uniqueSlugs = [...new Set(cartItems.map(item => item.slug || item.id))].filter(Boolean);
  const { data: cartLinks = [], isFetching: cartLinksFetching } = useQuery({
    queryKey: ["checkout-links-cart", uniqueSlugs],
    queryFn: async () => {
      if (uniqueSlugs.length === 0) return [];
      // Only need first link to get merchant address/settings
      const results = await base44.entities.PaymentLink.filter({ slug: uniqueSlugs[0], status: "active" }, "-created_date", 1);
      return results;
    },
    enabled: cartItems.length > 0 && uniqueSlugs.length > 0,
  });



  useEffect(() => {
    if (slug) {
      if (!linksLoading) {
        if (links.length > 0) {
          setPaymentLink(links[0]);
        }
        setLoading(false);
      }
    }
  }, [links, slug, linksLoading]);

  useEffect(() => {
    if (cartItems.length > 0 && !cartLinksFetching) {
      // Calculate total from cart item prices (provided by the store)
      const totalAda = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0) * (item.qty || item.quantity || 1);
      }, 0);

      const firstLink = cartLinks[0] || null;

      setPaymentLink({
        id: "cart-" + Date.now(),
        title: `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`,
        amount_ada: totalAda,
        merchant_id: firstLink?.merchant_id || null,
        receive_address: firstLink?.receive_address || null,
        collect_email: firstLink?.collect_email || false,
        collect_name: firstLink?.collect_name || false,
        collect_shipping: firstLink?.collect_shipping || false,
      });
      setLoading(false);
    }
  }, [cartItems, cartLinks, cartLinksFetching]);

  useEffect(() => {
    if (!slug || !multiCntEnabled) return;
    navigate(`/MultiTokenCheckout?slug=${encodeURIComponent(slug)}`, { replace: true });
  }, [slug, multiCntEnabled, navigate]);

  const handleStartCheckout = async () => {
    // Validate required fields
    if (requireEmail && !payerEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (requireName && !payerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (paymentLink.collect_shipping) {
      if (!shippingStreet.trim() || !shippingCity.trim() || !shippingPostalCode.trim() || !shippingCountry.trim()) {
        toast.error("Please fill in your complete shipping address");
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      let response;
      if (cartItems.length > 0) {
        // Multi-item cart: use bulk checkout session
        response = await base44.functions.invoke('createBulkCheckoutSession', {
          cartItems: cartItems
        });
        setSessionData(response.data);
      } else if (paymentLink?.amount_mode === "fixed_cnt") {
        // CNT payment: no checkout session needed, build mock session data
        setSessionData({
          merchant_address: paymentLink.receive_address,
          platform_fee_percent: 1.75,
          amount_total_cnt: paymentLink.cnt_amount,
        });
      } else {
        // Single item ADA: use regular checkout session
        if (!paymentLink?.id || paymentLink.id.startsWith("cart-")) {
          toast.error("Invalid payment link");
          setCheckoutLoading(false);
          return;
        }
        response = await base44.functions.invoke('createPublicCheckoutSession', {
          paymentLinkId: paymentLink.id
        });
        setSessionData(response.data);
      }
      setSessionStarted(true);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr || paymentLink?.receive_address);
    toast.success("Address copied!");
  };

  const handleTxSuccess = useCallback(async (hash) => {
    setTxHash(hash);
    setTxSubmitted(true);
    setPaymentStatus("detected");

    // Record the payment in the database, with retries to allow Blockfrost to index the tx
    if (paymentLink) {
      const maxAttempts = 5;
      const delayMs = 15000;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await base44.functions.invoke('recordWalletPayment', {
            txHash: hash,
            paymentLinkId: paymentLink.id,
            merchantId: paymentLink.merchant_id,
            payerEmail: payerEmail || null,
            payerName: payerName || null,
            payerDiscordUsername: payerDiscordUsername || null,
            payerAddress: connectedWallet?.address || null,
            shippingStreet: shippingStreet || null,
            shippingCity: shippingCity || null,
            shippingPostalCode: shippingPostalCode || null,
            shippingCountry: shippingCountry || null
          });
          console.log(`Payment recorded on attempt ${attempt}`);
          break; // success
        } catch (err) {
          console.warn(`recordWalletPayment attempt ${attempt} failed:`, err?.message);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.error("All attempts to record payment failed:", err);
          }
        }
      }
    }

    // Poll for confirmation
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await base44.functions.invoke('checkTxConfirmation', { txHash: hash });
        if (res?.data?.confirmed) {
          clearInterval(interval);
          setPaymentStatus("confirmed");
        }
      } catch {}
      if (attempts >= 30) clearInterval(interval);
    }, 10000);
  }, [paymentLink, payerEmail, payerName, payerDiscordUsername, connectedWallet, shippingStreet, shippingCity, shippingPostalCode, shippingCountry]);

  if (!slug && cartItems.length === 0) {
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

  if (multiCntEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Redirecting to multi-token checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          {paymentLink?.merchant_id && <MerchantHeader merchantId={paymentLink.merchant_id} />}
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        <SimplePaySummaryCard paymentLink={paymentLink} sessionData={sessionData} />

        <div className="mt-4 bg-white rounded-3xl border border-slate-200 shadow-sm">

          {!sessionStarted ? (
            <div className="p-6 space-y-4">
              {showEmailInput && (
                <div className="space-y-2">
                   <Label htmlFor="payer-email" className="text-slate-300 text-xs">
                     Email {requireEmail ? <span className="text-red-400">*</span> : <span className="text-slate-500">(optional)</span>}
                   </Label>
                   <Input id="payer-email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {showNameInput && (
                <div className="space-y-2">
                   <Label htmlFor="payer-name" className="text-slate-300 text-xs">Name <span className="text-red-400">*</span></Label>
                   <Input id="payer-name" value={payerName} onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {paymentLink.collect_shipping && (
                <div className="space-y-3">
                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Shipping Address <span className="text-red-400">*</span></p>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="shipping-street" className="text-slate-300 text-xs">Street Address</Label>
                        <Input id="shipping-street" value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)}
                          placeholder="123 Main St"
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                           <Label htmlFor="shipping-city" className="text-slate-300 text-xs">City</Label>
                           <Input id="shipping-city" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)}
                             placeholder="Brussels"
                             className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                         </div>
                        <div className="space-y-2">
                           <Label htmlFor="shipping-postal" className="text-slate-300 text-xs">Postal Code</Label>
                           <Input id="shipping-postal" value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)}
                             placeholder="1000"
                             className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping-country" className="text-slate-300 text-xs">Country</Label>
                        <Input id="shipping-country" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)}
                          placeholder="Belgium"
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={handleStartCheckout} disabled={checkoutLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">
                {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Setting up checkout…</> : "Continue to Payment"}
              </Button>
            </div>

          ) : paymentStatus === "confirmed" ? (
            <div className="p-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">Payment Complete</p>
                <p className="text-sm text-slate-400 mt-1">Your transaction has been confirmed on the Cardano blockchain.</p>
                {txHash && (
                  <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:underline font-mono">
                    {txHash.slice(0, 16)}…{txHash.slice(-8)} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {paymentLink.success_redirect_url && (
                  <div className="mt-4">
                    <a href={paymentLink.success_redirect_url}
                      className="inline-flex items-center gap-1 text-indigo-400 text-sm hover:underline">
                      Continue <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

          ) : (
            <div className="p-6 space-y-5">
              {/* Status bar */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg">
                {paymentStatus === "pending" && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                {paymentStatus === "detected" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-white">
                    {paymentStatus === "pending" ? "Awaiting payment" : `Confirming on-chain…`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {paymentStatus === "pending" ? "Connect your Cardano wallet and complete payment in one flow" : "Your transaction was submitted."}
                  </p>
                </div>
              </div>

              {paymentStatus === "pending" && (
                <>
                  {/* CNT fee breakdown */}
                  {sessionData && paymentLink.amount_mode === "fixed_cnt" && (() => {
                    const total = paymentLink.cnt_amount || 0;
                    const feePercent = sessionData.platform_fee_percent || 1.75;
                    const feeAmt = Math.round(total * (feePercent / 100));
                    const merchantAmt = total - feeAmt;
                    return (
                      <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="text-white font-semibold">{total.toLocaleString()} {paymentLink.cnt_ticker}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Platform fee ({feePercent}%)</span>
                          <span>{feeAmt.toLocaleString()} {paymentLink.cnt_ticker}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                          <span>Merchant receives</span>
                          <span className="text-emerald-400 font-semibold">{merchantAmt.toLocaleString()} {paymentLink.cnt_ticker}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fee breakdown — ADA only */}
                  {sessionData && paymentLink.amount_mode !== "fixed_cnt" && (
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="text-white font-semibold">₳ {sessionData.amount_total_ada?.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Platform fee ({sessionData.platform_fee_percent}%)</span>
                        <span>₳ {sessionData.platform_fee_ada?.toFixed(3)}</span>
                      </div>
                      <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                        <span>Merchant receives</span>
                        <span className="text-emerald-400 font-semibold">₳ {sessionData.merchant_amount_ada?.toFixed(3)}</span>
                      </div>
                      {sessionData.amount_total_ada < 60 && (
                        <div className="border-t border-slate-700 pt-1.5 flex items-start gap-1.5 text-amber-400/80">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>For payments under ₳60, a minimum platform fee of ₳1 applies, resulting in a higher effective fee percentage.</span>
                        </div>
                      )}
                    </div>
                  )}

                      {/* Wallet flow only */}
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-500 text-center">
                          Wallet connect checkout · Supported: Nami · Eternl · Lace · Typhon · GeroWallet · Yoroi · Vespr
                        </p>
                        <WalletConnect
                          onConnected={(w) => setConnectedWallet(w)}
                          onDisconnected={() => setConnectedWallet(null)}
                        />
                        {connectedWallet && (
                          <>
                            {paymentLink?.amount_mode === "fixed_cnt" && (
                              <WalletHealthCheck
                                connectedWallet={connectedWallet}
                                paymentLink={paymentLink}
                                onHealthChecked={setWalletHealth}
                              />
                            )}
                            <WalletPayButton
                              connectedWallet={connectedWallet}
                              sessionData={sessionData}
                              paymentLink={paymentLink}
                              payerEmail={payerEmail || null}
                              payerName={payerName || null}
                              payerDiscordUsername={payerDiscordUsername || null}
                              onSuccess={handleTxSuccess}
                              walletHealth={walletHealth}
                            />
                            <p className="text-[11px] text-slate-500 text-center">
                              Your wallet will ask you to confirm and enter your password.
                            </p>
                          </>
                        )}
                      </div>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          {paymentLink?.amount_mode === "fixed_cnt"
            ? `Secure Cardano Native Token payment · PayADA.io`
            : `Secure Cardano ADA payment · PayADA.io`}
        </p>
      </div>
    </div>
  );
}