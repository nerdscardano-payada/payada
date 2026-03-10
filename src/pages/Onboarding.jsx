import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import ProfileSetupStep from "@/components/onboarding/ProfileSetupStep";
import PaymentIntegrationStep from "@/components/onboarding/PaymentIntegrationStep";

const STEPS = [
  { id: "profile", title: "Profile Setup" },
  { id: "integration", title: "Integration" },
  { id: "complete", title: "Complete" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    business_name: "",
    website_url: "",
    default_fiat_currency: "EUR",
    timezone: "UTC",
    default_receive_address: "",
  });

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const existing = await base44.entities.MerchantProfile.filter({
        user_id: user.id,
      });

      if (existing.length > 0) {
        return base44.entities.MerchantProfile.update(existing[0].id, profileData);
      } else {
        return base44.entities.MerchantProfile.create({
          user_id: user.id,
          ...profileData,
        });
      }
    },
  });



  const handleNext = async () => {
    if (currentStep === 0) {
      // Save profile
      if (!formData.business_name || !formData.default_receive_address) {
        alert("Please fill in all required fields");
        return;
      }
      await createProfileMutation.mutateAsync({
        business_name: formData.business_name,
        website_url: formData.website_url,
        default_fiat_currency: formData.default_fiat_currency,
        timezone: formData.timezone,
        default_receive_address: formData.default_receive_address,
      });
    } else if (currentStep === 1) {
      // Save webhooks if any
      if (formData.webhook_endpoints.length > 0) {
        await createWebhooksMutation.mutateAsync(formData.webhook_endpoints);
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLoadingProfile =
    createProfileMutation.isPending || createWebhooksMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">₳</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome to PayADA
            </h1>
          </div>
          <p className="text-slate-600">
            Let's get you set up to start accepting ADA payments in minutes
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8 p-6">
          <OnboardingProgress steps={STEPS} currentStep={currentStep} />
        </Card>

        {/* Content */}
        <Card className="mb-8">
          <div className="p-6 md:p-8">
            {currentStep === 0 && (
              <ProfileSetupStep data={formData} onChange={setFormData} />
            )}

            {currentStep === 1 && (
              <WebhookSetupStep data={formData} onChange={setFormData} />
            )}

            {currentStep === 2 && (
              <PaymentIntegrationStep merchantId={user?.id} />
            )}

            {currentStep === 3 && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  You're All Set!
                </h2>
                <p className="text-slate-600 mb-6">
                  Your PayADA account is ready to accept payments
                </p>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={() => window.location.href = createPageUrl("Dashboard")}
                    className="w-full gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <a
                    href="/payment-links"
                    className="block text-sm text-indigo-600 hover:underline"
                  >
                    Create your first payment link →
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        {currentStep < STEPS.length && (
          <div className="flex gap-4 justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={isLoadingProfile}
                className="gap-2"
              >
                {isLoadingProfile ? "Saving..." : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}