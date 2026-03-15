import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export function useProfileCheck() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['merchantProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email });
      return profiles.length > 0 ? profiles[0] : null;
    },
    enabled: !!user?.email,
  });

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.business_name?.trim() &&
      profile.default_receive_address?.trim() &&
      user?.email
    );
  };

  useEffect(() => {
    if (user && !isLoading && !isProfileComplete()) {
      toast.warning("Please complete your Merchant Profile to continue");
      navigate('/MerchantProfile');
    }
  }, [user, profile, isLoading, navigate]);

  return { profile, user, isProfileComplete: isProfileComplete() };
}