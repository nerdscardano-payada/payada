import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon, Copy, CheckCircle2, Clock, Loader2,
  ExternalLink, AlertCircle, Wallet, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";

export default function Pay() {
  const [slug, setSlug] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentLink, setPaymentLink] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // Wallet state
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [txSubmitted, setTxSubmitted] = useState(false);

  // Extract slug or cartItems from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paySlug = params.get("slug");
    const cartParam = params.get("cartItems");
    
    if (paySlug) {
      setSlug(paySlug);
    } else if (cartParam) {
      try {
        const items = JSON.parse(atob(cartParam));
        setCartItems(items);
      } catch (e) {
        console.error("Failed to parse cartItems:", e);
      }
    }
    setLoading(false);
  }, []);

  // For single slug checkout
  const { data: links = [] } = useQuery({
    queryKey: ["checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  // For multi-item cart checkout
  const uniqueSlugs = [...new Set(cartItems.map(item => item.slug || item.id))].filter(Boolean);
  const { data: cartLinks = [], isFetching: cartLinksFetching } = useQuery({
    queryKey: ["checkout-links-cart", uniqueSlugs],
    queryFn: async () => {
      if (uniqueSlugs.length === 0) return [];
      const results = await Promise.all(
        uniqueSlugs.map(s => base44.entities.PaymentLink.filter({ slug: s, status: "active" }, "-created_date", 1))
      );
      return results.flat();
    },
    enabled: cartItems.length > 0 && uniqueSlugs.length > 0,
  });

  // For debugging
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("Cart items:", cartItems);
      console.log("Unique slugs to search:", uniqueSlugs);
      console.log("Found payment links:", cartLinks);
    }
  }, [cartItems, uniqueSlugs, cartLinks]);

  useEffect(() => {
    if (slug && links.length > 0) {
      setPaymentLink(links[0]);
      setLoading(false);
    } else if (slug && links.length === 0) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [links, slug]);

  useEffect(() => {
    if (cartItems.length > 0 && !cartLinksFetching) {
      // Create payment link from cart items, even if some links aren't found
      if (cartLinks.length > 0) {
        const totalAda = cartItems.reduce((sum, item) => {
          const link = cartLinks.find(l => l.slug === item.slug || l.slug === item.id);
          const itemPrice = link?.amount_ada || parseFloat(item.price) || 0;
          const qty = item.quantity || 1;
          return sum + (itemPrice * qty);
        }, 0);

        const firstLink = cartLinks[0];
        setPaymentLink({
          id: "cart-" + Date.now(),
          title: `${cartItems.length} items`,
          amount_ada: isNaN(totalAda) || totalAda === 0 ? cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0) : totalAda,
          merchant_id: firstLink?.merchant_id || "default",
          receive_address: firstLink?.receive_address,
          collect_email: firstLink?.collect_email || false,
          collect_name: firstLink?.collect_name || false,
          collect_shipping: firstLink?.collect_shipping || false,
        });
        setLoading(false);
      } else if (uniqueSlugs.length > 0) {
        // No links found after searching
        console.warn("No payment links found for slugs:", uniqueSlugs);
        setLoading(false);
      }
    }
  }, [cartItems, cartLinks, cartLinksFetching, uniqueSlugs]);

  const handleStartCheckout = async () => {
   try {
     const linkId = paymentLink.id || slug;
     if (!linkId) {
       toast.error("Invalid payment link");
       return;
     }
     const response = await base44.functions.invoke('createPublicCheckoutSession', {
       paymentLinkId: linkId,
       cartItems: cartItems.length > 0 ? cartItems : undefined
     });
     setSessionData(response.data);
     setSessionStarted(true);
   } catch (err) {
     console.error("Checkout error:", err);
     toast.error("Failed to start checkout");
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
  }, [paymentLink, payerEmail, payerName]);

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
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
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
                  <Label htmlFor="payer-email" className="text-slate-300 text-xs">Email</Label>
                  <Input id="payer-email" name="payer-email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {paymentLink.collect_name && (
                <div className="space-y-2">
                  <Label htmlFor="payer-name" className="text-slate-300 text-xs">Name</Label>
                  <Input id="payer-name" name="payer-name" value={payerName} onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {paymentLink.collect_shipping && (
                <div className="space-y-3">
                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Shipping Address</p>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Street Address</Label>
                        <Input value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)}
                          placeholder="123 Main St"
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs">City</Label>
                          <Input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)}
                            placeholder="Brussels"
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-xs">Postal Code</Label>
                          <Input value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)}
                            placeholder="1000"
                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">Country</Label>
                        <Input value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)}
                          placeholder="Belgium"
                          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={handleStartCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">
                Continue to Payment
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
                    {paymentStatus === "pending" ? "Connect your Cardano wallet to pay" : "Your transaction was submitted."}
                  </p>
                </div>
              </div>

              {paymentStatus === "pending" && (
                <>
                  {/* Fee breakdown */}
                  {sessionData && (
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
                      Supported: Nami · Eternl · Flint · Lace · Typhon · GeroWallet · Yoroi
                    </p>
                    <WalletConnect
                      onConnected={(w) => setConnectedWallet(w)}
                      onDisconnected={() => setConnectedWallet(null)}
                    />
                    {connectedWallet && (
                      <>
                        <WalletPayButton
                          connectedWallet={connectedWallet}
                          sessionData={sessionData}
                          paymentLink={paymentLink}
                          onSuccess={handleTxSuccess}
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
          Secure Cardano ADA payment · PayADA.io
        </p>
      </div>
    </div>
  );
}