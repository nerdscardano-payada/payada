import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import StepSelectLink from "@/components/button-generator/StepSelectLink";
import StepCustomize from "@/components/button-generator/StepCustomize";
import StepGetCode from "@/components/button-generator/StepGetCode";
import ButtonTransactionView from "@/components/button-generator/ButtonTransactionView";

const STEPS = [
  { number: 1, label: "Choose Link" },
  { number: 2, label: "Customize" },
  { number: 3, label: "Get Code" },
];

const DEFAULT_CONFIG = {
  buttonText: "Pay with ADA",
  colorOption: "#6366f1",
  customColor: "#6366f1",
  rounded: "lg",
  size: "md",
  showAmount: true,
  showPoweredBy: true,
  showIcon: true,
  selectedIcon: "gift",
  hoverEffect: true,
  shadow: true,
};

export default function ButtonGenerator() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [step, setStep] = useState(1);
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [user, setUser] = useState(null);

  // Show profile warning banner if not complete
  if (!isProfileComplete && profile !== undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-blue-50 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Complete Your Profile</h2>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            To access PayADA tools, please complete your merchant profile first. You need to provide your business name and a receiving wallet address.
          </p>
          <button
            onClick={() => window.location.href = '/MerchantProfile'}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: links = [] } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email, status: "active" }, "-created_date", 100),
    enabled: !!user,
  });

  const selectedLink = links.find((l) => l.id === selectedLinkId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Button Generator
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create your payment button
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Embed ADA payments on any website in 3 easy steps
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  step > s.number
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                    : step === s.number
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-100"
                    : "bg-slate-100 text-slate-400"
                )}>
                  {step > s.number ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.number}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  step === s.number ? "text-indigo-600" : "text-slate-400"
                )}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-0.5 w-16 mx-2 mb-5 rounded-full transition-all duration-500",
                  step > s.number ? "bg-indigo-400" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StepSelectLink
                  links={links}
                  selectedLinkId={selectedLinkId}
                  onSelect={setSelectedLinkId}
                  onNext={() => setStep(2)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StepCustomize
                  config={config}
                  onChange={setConfig}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StepGetCode
                  config={config}
                  selectedLink={selectedLink}
                  onBack={() => setStep(2)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction view for selected link */}
      {selectedLink && <ButtonTransactionView selectedLink={selectedLink} />}
    </div>
  );
}