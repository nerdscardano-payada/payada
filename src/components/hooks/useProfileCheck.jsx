import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export function useProfileCheck(enabled = true) {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => await base44.auth.me(),
    enabled,
    retry: false,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['merchantProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email });
      return profiles.length > 0 ? profiles[0] : null;
    },
    enabled: enabled && !!user?.email,
    retry: false,
  });

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.business_name?.trim() &&
      profile.default_receive_address?.trim() &&
      user?.email
    );
  };

  return { profile, user, isLoading: userLoading || profileLoading, isProfileComplete: isProfileComplete() };
}