import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NFTGate() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "";
  const [walletAddress, setWalletAddress] = React.useState("");
  const [gate, setGate] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    base44.functions.invoke("verifyNftGateAccess", { slug }).then((response) => {
      setGate(response.data.rule || null);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [slug]);

  const handleCheck = async () => {
    setIsChecking(true);
    const response = await base44.functions.invoke("verifyNftGateAccess", { slug, wallet_address: walletAddress });
    setResult(response.data);
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Gate</p>
        <h1 className="mt-4 text-3xl font-semibold">{gate?.name || "Check NFT access"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Verify whether your wallet holds the required NFT to unlock access.</p>

        {!slug ? <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">No gate slug found.</div> : isLoading ? <div className="mt-6 text-sm text-slate-300">Loading...</div> : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Cardano wallet address</label>
              <Input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="border-white/10 bg-white/5 text-white" />
            </div>
            <Button onClick={handleCheck} disabled={!walletAddress || isChecking}>{isChecking ? "Checking..." : "Check access"}</Button>
          </div>
        )}

        {result && (
          <div className={`mt-6 rounded-2xl p-5 ${result.granted ? "bg-emerald-500/15 text-emerald-100" : "bg-amber-500/15 text-amber-100"}`}>
            <p className="font-medium">{result.granted ? (result.success_message || "Access granted") : "Access not unlocked yet"}</p>
            <p className="mt-2 text-sm">Your wallet holds {result.quantity_owned || 0} out of the required minimum of {result.required_quantity || 1}.</p>
            {result.granted && result.access_url && <a href={result.access_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">Open access</a>}
          </div>
        )}
      </div>
    </div>
  );
}