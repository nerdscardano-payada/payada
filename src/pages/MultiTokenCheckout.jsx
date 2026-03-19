import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";
import AdaRatePreview from "@/components/checkout/AdaRatePreview";
import WalletHealthCheck from "@/components/checkout/WalletHealthCheck";
import MultiTokenSelector, { formatAmount } from "@/components/checkout/MultiTokenSelector";

function getTokenRate(tokens, ticker) {
  return Object.values(tokens || {}).find(
    (token) => token?.ticker?.toUpperCase() === ticker?.toUpperCase()
  ) || null;
}

export default function MultiTokenCheckout() {
  const [slug, setSlug] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [sessionData, setSessionData] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState("ADA");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletHealth, setWalletHealth] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug") || "");
  }, []);

  const { data: links = [], isLoading: linkLoading } = useQuery({
    queryKey: ["multi-token-checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  const paymentLink = links[0] || null;
  const acceptedTokens = paymentLink?.accepted_cnt_tokens || [];
  const multiEnabled = !!paymentLink?.enable_multi_cnt_checkout && paymentLink?.amount_mode === "fixed_ada" && acceptedTokens.length > 0;

  const { data: tokenRates, isLoading: ratesLoading } = useQuery({
    queryKey: ["multi-token-rates", acceptedTokens.map((token) => token.ticker).join("|")],
    queryFn: async () => {
      const response = await base44.functions.invoke("getTokenExchangeRates", {
        tickers: acceptedTokens.map((token) => token.ticker),
      });
      return response.data;
    },
    enabled: multiEnabled,
  });

  const paymentOptions = useMemo(() => {
    if (!paymentLink) return [];

    const adaAmount = Number(paymentLink.amount_ada || 0);
    const adaOption = {
      key: "ADA",
      type: "ada",
      label: "ADA",
      description: "Pay directly with ADA",
      amountLabel: `₳ ${formatAmount(adaAmount, 6)}`,
      secondaryLabel: "Standard checkout",
      disabled: false,
    };

    const cntOptions = acceptedTokens.map((token) => {
      const rate = getTokenRate(tokenRates?.tokens, token.ticker);
      const priceInAda = rate?.price_in_ada || null;
      const estimatedAmount = priceInAda ? adaAmount / priceInAda : null;

      return {
        key: `${token.policy_id}:${token.asset_name}`,
        type: "cnt",
        label: token.ticker,
        description: "Real-time conversion from ADA",
        amountLabel: estimatedAmount ? `${formatAmount(estimatedAmount, token.decimals ?? 6)} ${token.ticker}` : "Rate unavailable",
        secondaryLabel: priceInAda ? `1 ${token.ticker} ≈ ₳ ${formatAmount(priceInAda, 6)}` : null,
        disabled: !priceInAda,
        ticker: token.ticker,
        policy_id: token.policy_id,
        asset_name: token.asset_name,
        decimals: token.decimals ?? 0,
        price_in_ada: priceInAda,
      };
    });

    return [adaOption, ...cntOptions];
  }, [paymentLink, acceptedTokens, tokenRates]);

  useEffect(() => {
    if (!paymentOptions.length) return;
    const selectedExists = paymentOptions.some((option) => option.key === selectedOptionKey && !option.disabled);
    if (!selectedExists) {
      const fallback = paymentOptions.find((option) => !option.disabled);
      if (fallback) setSelectedOptionKey(fallback.key);
    }
  }, [paymentOptions, selectedOptionKey]);

  const selectedOption = paymentOptions.find((option) => option.key === selectedOptionKey) || paymentOptions[0] || null;

  const walletPaymentLink = useMemo(() => {
    if (!paymentLink || !sessionData || selectedOption?.type !== "cnt") return paymentLink;

    const roundedCntAmount = Number(
      (sessionData.amount_total_cnt || 0).toFixed(Math.min(selectedOption.decimals ?? 6, 8))
    );

    return {
      ...paymentLink,
      amount_mode: "fixed_cnt",
      cnt_ticker: selectedOption.ticker,
      cnt_policy_id: selectedOption.policy_id,
      cnt_asset_name: selectedOption.asset_name,
      cnt_decimals: selectedOption.decimals ?? 0,
      cnt_amount: roundedCntAmount,
    };
  }, [paymentLink, sessionData, selectedOption]);

  const handleStartCheckout = async () => {
    if (!paymentLink || !selectedOption) return;

    if (paymentLink.collect_email && !payerEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (paymentLink.collect_name && !payerName.trim()) {
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
      const response = await base44.functions.invoke("createPublicCheckoutSession", {
        paymentLinkId: paymentLink.id,
      });

      if (selectedOption.type === "cnt") {
        const amountTotalAda = Number(response.data.amount_total_ada || 0);
        const amountTotalCnt = selectedOption.price_in_ada ? amountTotalAda / selectedOption.price_in_ada : 0;

        setSessionData({
          ...response.data,
          amount_total_cnt: amountTotalCnt,
          selected_token: selectedOption,
        });
      } else {
        setSessionData(response.data);
      }

      setSessionStarted(true);
    } catch (error) {
      toast.error("Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleTxSuccess = useCallback(async (hash) => {
    setTxHash(hash);
    setPaymentStatus("detected");

    if (paymentLink) {
      const maxAttempts = 5;
      const delayMs = 15000;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await base44.functions.invoke("recordWalletPayment", {
            txHash: hash,
            paymentLinkId: paymentLink.id,
            merchantId: paymentLink.merchant_id,
            payerEmail: payerEmail || null,
            payerName: payerName || null,
            payerAddress: connectedWallet?.address || null,
            shippingStreet: shippingStreet || null,
            shippingCity: shippingCity || null,
            shippingPostalCode: shippingPostalCode || null,
            shippingCountry: shippingCountry || null,
            cntPaymentConfig: selectedOption?.type === "cnt" ? {
              ticker: selectedOption.ticker,
              policy_id: selectedOption.policy_id,
              asset_name: selectedOption.asset_name,
              decimals: selectedOption.decimals ?? 0,
              amount: sessionData?.amount_total_cnt || null,
            } : null,
          });
          break;
        } catch (error) {
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const response = await base44.functions.invoke("checkTxConfirmation", { txHash: hash });
        if (response?.data?.confirmed) {
          clearInterval(interval);
          setPaymentStatus("confirmed");
        }
      } catch {}
      if (attempts >= 30) clearInterval(interval);
    }, 10000);
  }, [paymentLink, payerEmail, payerName, connectedWallet, shippingStreet, shippingCity, shippingPostalCode, shippingCountry, selectedOption, sessionData]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Invalid checkout link</h2>
          <p className="text-slate-400 mt-2">No payment link slug provided.</p>
        </div>
      </div>
    );
  }

  if (linkLoading) {
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Payment link not found</h2>
          <p className="text-slate-400 mt-2">This link may have expired or been disabled.</p>
        </div>
      </div>
    );
  }

  if (!multiEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Multi-token checkout not enabled</h2>
          <p className="text-sm text-slate-400 mt-2">
            This payment link still uses the standard checkout only.
          </p>
          <a
            href={`/Pay?slug=${paymentLink.slug}`}
            className="inline-flex items-center gap-2 text-indigo-400 mt-4 hover:underline"
          >
            Open standard checkout <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center p-4 sm:py-8 overflow-y-auto">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white">{paymentLink.title}</h1>
            {paymentLink.description && (
              <p className="text-sm text-slate-400 mt-2">{paymentLink.description}</p>
            )}
            <div className="mt-3">
              <AdaRatePreview adaAmount={paymentLink.amount_ada} />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Choose payment method</p>
              {ratesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading CNT rates...
                </div>
              ) : (
                <MultiTokenSelector
                  options={paymentOptions}
                  selectedKey={selectedOptionKey}
                  onSelect={setSelectedOptionKey}
                />
              )}
            </div>
          </div>

          {!sessionStarted ? (
            <div className="p-6 space-y-4">
              {paymentLink.collect_email && (
                <div className="space-y-2">
                  <Label htmlFor="payer-email" className="text-slate-300 text-xs">Email <span className="text-red-400">*</span></Label>
                  <Input
                    id="payer-email"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
              {paymentLink.collect_name && (
                <div className="space-y-2">
                  <Label htmlFor="payer-name" className="text-slate-300 text-xs">Name <span className="text-red-400">*</span></Label>
                  <Input
                    id="payer-name"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
              {paymentLink.collect_shipping && (
                <div className="space-y-3 border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shipping Address <span className="text-red-400">*</span></p>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-street" className="text-slate-300 text-xs">Street Address</Label>
                      <Input id="shipping-street" value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} placeholder="123 Main St" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="shipping-city" className="text-slate-300 text-xs">City</Label>
                        <Input id="shipping-city" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} placeholder="Brussels" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping-postal" className="text-slate-300 text-xs">Postal Code</Label>
                        <Input id="shipping-postal" value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)} placeholder="1000" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-country" className="text-slate-300 text-xs">Country</Label>
                      <Input id="shipping-country" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} placeholder="Belgium" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                    </div>
                  </div>
                </div>
              )}
              <Button
                onClick={handleStartCheckout}
                disabled={checkoutLoading || !selectedOption || selectedOption.disabled}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold"
              >
                {checkoutLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Setting up checkout…</>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </div>
          ) : paymentStatus === "confirmed" ? (
            <div className="p-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">Payment Complete</p>
                <p className="text-sm text-slate-400 mt-1">Your transaction has been confirmed on the Cardano blockchain.</p>
                {txHash && (
                  <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:underline font-mono">
                    {txHash.slice(0, 16)}…{txHash.slice(-8)} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {paymentLink.success_redirect_url && (
                  <div className="mt-4">
                    <a href={paymentLink.success_redirect_url} className="inline-flex items-center gap-1 text-indigo-400 text-sm hover:underline">
                      Continue <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg">
                {paymentStatus === "pending" && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                {paymentStatus === "detected" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-white">
                    {paymentStatus === "pending" ? "Awaiting payment" : "Confirming on-chain…"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {paymentStatus === "pending" ? "Connect your Cardano wallet to pay" : "Your transaction was submitted."}
                  </p>
                </div>
              </div>

              {selectedOption?.type === "cnt" ? (
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-white font-semibold">{formatAmount(sessionData?.amount_total_cnt, selectedOption.decimals ?? 6)} {selectedOption.ticker}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ADA equivalent</span>
                    <span>₳ {formatAmount(sessionData?.amount_total_ada, 6)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                    <span>Merchant wallet</span>
                    <span className="text-emerald-400 font-semibold">{walletPaymentLink?.cnt_ticker}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-white font-semibold">₳ {sessionData?.amount_total_ada?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform fee ({sessionData?.platform_fee_percent}%)</span>
                    <span>₳ {sessionData?.platform_fee_ada?.toFixed(3)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                    <span>Merchant receives</span>
                    <span className="text-emerald-400 font-semibold">₳ {sessionData?.merchant_amount_ada?.toFixed(3)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 text-center">
                  Supported: Nami · Eternl · Lace · Typhon · GeroWallet · Yoroi · Vespr
                </p>
                <WalletConnect
                  onConnected={(wallet) => setConnectedWallet(wallet)}
                  onDisconnected={() => setConnectedWallet(null)}
                />
                {connectedWallet && (
                  <>
                    {selectedOption?.type === "cnt" && (
                      <WalletHealthCheck
                        connectedWallet={connectedWallet}
                        paymentLink={walletPaymentLink}
                        onHealthChecked={setWalletHealth}
                      />
                    )}
                    <WalletPayButton
                      connectedWallet={connectedWallet}
                      sessionData={sessionData}
                      paymentLink={walletPaymentLink}
                      payerEmail={payerEmail || null}
                      payerName={payerName || null}
                      onSuccess={handleTxSuccess}
                      walletHealth={walletHealth}
                    />
                    <p className="text-[11px] text-slate-500 text-center">
                      Your wallet will ask you to confirm and enter your password.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          {selectedOption?.type === "cnt"
            ? `Secure Cardano Native Token payment · PayADA.io`
            : `Secure Cardano ADA payment · PayADA.io`}
        </p>
      </div>
    </div>
  );
}