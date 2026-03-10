import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function OnboardingPage() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: merchantProfile } = useQuery({
    queryKey: ["merchantProfile-onboarding", user?.id],
    queryFn: () => base44.entities.MerchantProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
    select: (data) => data[0] || null,
  });

  useEffect(() => {
    // Redirect to MerchantProfile page
    if (user?.id) {
      window.location.href = createPageUrl("MerchantProfile");
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl font-bold text-white">₳</span>
        </div>
        <p className="text-slate-600">Redirecting to profile setup...</p>
      </div>
    </div>
  );
}