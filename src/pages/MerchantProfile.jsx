import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Edit2, Save, Upload, Link, Trash2, Coins, ShieldCheck } from "lucide-react";
import WalletDashboardGate from "@/components/wallet/WalletDashboardGate";
import { KNOWN_CNTS } from "@/components/payment-links/wizard/knownCNTs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const timezones = [
  "UTC", "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore",
  "Australia/Sydney", "Australia/Melbourne"
];


export default function MerchantProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoMode, setLogoMode] = useState("url"); // "url" or "upload"
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => await base44.auth.me(),
  });

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ['merchantProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email });
      if (profiles.length > 0) return profiles[0];
      return null;
    },
    enabled: !!user?.email,
  });

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
      setIsEditing(false);
    } else if (user?.email && !profileLoading) {
      // No profile yet, start in edit mode
      setIsEditing(true);
    }
  }, [profile, user?.email, profileLoading]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (!profile?.id) {
        return await base44.entities.MerchantProfile.create({
          user_id: user.email,
          ...data,
        });
      }
      return await base44.entities.MerchantProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] });
      setIsEditing(false);
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) {
        throw new Error("Save your merchant profile first");
      }
      return await base44.entities.MerchantProfile.update(profile.id, {
        verification_requested: true,
        verification_requested_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantProfile'] });
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.default_receive_address || formData.default_receive_address.trim() === "") {
      alert("Default Cardano Receive Address is required. Please enter a valid Cardano wallet address.");
      return;
    }
    
    let data = { ...formData };
    if (logoMode === "upload" && logoFile) {
      setLogoUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: logoFile });
      data.logo_url = file_url;
      setLogoUploading(false);
    }
    updateMutation.mutate(data);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await base44.functions.invoke('deleteMerchantAccount', {});
    await base44.auth.logout('/');
  };

  const handleWalletLinked = async () => {
    const savedAddress = localStorage.getItem("payada_connected_wallet_address") || localStorage.getItem("payada_manual_wallet_address");
    if (savedAddress && user?.email) {
      if (profile?.id) {
        await base44.entities.MerchantProfile.update(profile.id, {
          connected_wallet_address: savedAddress,
          default_receive_address: savedAddress,
        });
      } else {
        await base44.entities.MerchantProfile.create({
          user_id: user.email,
          business_name: formData.business_name || user.email,
          connected_wallet_address: savedAddress,
          default_receive_address: savedAddress,
          timezone: formData.timezone || "UTC",
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['merchantProfile'] });
  };

  if (userLoading || profileLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Merchant Profile" subtitle="Manage your business details" />
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader title="Merchant Profile" subtitle="Manage your business details and wallet address" />
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="gap-2 shrink-0"
        >
          {isEditing ? null : <Edit2 className="w-4 h-4" />}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm text-red-800">Failed to load profile. Please try again.</div>
        </Card>
      )}

      {updateMutation.isPending && (
        <Card className="border-blue-200 bg-blue-50 p-4 flex gap-3">
          <div className="animate-spin w-5 h-5 text-blue-600" />
          <div className="text-sm text-blue-800">Saving changes...</div>
        </Card>
      )}

      {updateMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="text-sm text-green-800">Profile updated successfully!</div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <WalletDashboardGate profile={profile || formData} onLinked={handleWalletLinked} />

        <Card className="p-8 border-sky-200 bg-sky-50/60">
          <div className="flex h-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                Merchant Verification
              </h3>
              <p className="mt-1 text-sm text-slate-600">Ask an admin to review your merchant profile and enable the verified badge on your storefront.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={formData.verified_merchant ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700" : "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"}>
                  {formData.verified_merchant ? "Verified merchant" : "Not verified yet"}
                </span>
                <span className={formData.verification_requested ? "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700" : "inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"}>
                  {formData.verification_requested ? "Request pending" : "No request sent"}
                </span>
              </div>
            </div>
            <Button
              onClick={() => requestVerificationMutation.mutate()}
              disabled={!profile?.id || formData.verified_merchant || formData.verification_requested || requestVerificationMutation.isPending}
              className="gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {formData.verified_merchant ? "Already verified" : formData.verification_requested ? "Verification requested" : requestVerificationMutation.isPending ? "Sending request..." : "Request Verification"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Email Address</Label>
                <Input disabled value={user?.email || ""} className="mt-1 text-slate-500" />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Connected Wallet</Label>
                <Input disabled value={formData.connected_wallet_address || "Not connected yet"} className="mt-1 text-slate-500 font-mono text-xs" />
              </div>

              <div>
                <Label htmlFor="business_name" className="text-sm font-medium text-slate-700">Business Name *</Label>
                <Input
                  id="business_name"
                  placeholder="Your company name"
                  value={formData.business_name || ""}
                  onChange={(e) => handleInputChange("business_name", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website_url" className="text-sm font-medium text-slate-700">Website URL</Label>
                <Input
                  id="website_url"
                  placeholder="https://example.com"
                  value={formData.website_url || ""}
                  onChange={(e) => handleInputChange("website_url", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Logo</Label>
                {isEditing ? (
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLogoMode("url")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${logoMode === "url" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                      >
                        <Link className="w-3 h-3" /> URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoMode("upload")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${logoMode === "upload" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                      >
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                    </div>
                    {logoMode === "url" ? (
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={formData.logo_url || ""}
                        onChange={(e) => handleInputChange("logo_url", e.target.value)}
                      />
                    ) : (
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files[0])}
                      />
                    )}
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-3">
                    {formData.logo_url && <img src={formData.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded border border-slate-200" />}
                    <Input disabled value={formData.logo_url || ""} className="text-xs" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Settings */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Settings</h3>
            <div className="max-w-sm">
              <Label htmlFor="timezone" className="text-sm font-medium text-slate-700">Timezone</Label>
              {isEditing ? (
                <Select value={formData.timezone || "UTC"} onValueChange={(value) => handleInputChange("timezone", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  disabled
                  value={formData.timezone || "UTC"}
                  className="mt-1"
                />
              )}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* Payment Settings */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h3>
            <div>
              <Label htmlFor="default_receive_address" className="text-sm font-medium text-slate-700">Default Cardano Receive Address</Label>
              <Textarea
                id="default_receive_address"
                placeholder="Your Cardano wallet address"
                value={formData.default_receive_address || ""}
                onChange={(e) => handleInputChange("default_receive_address", e.target.value)}
                disabled={!isEditing}
                className="mt-1 font-mono text-xs"
                rows={3}
              />
              <p className="text-xs text-slate-600 mt-3 font-medium">⚠️ This is your default Cardano receive address. This field is required and must contain a valid Cardano wallet address (e.g., <code className="text-slate-700 font-mono">addr1qy2mekz0g2e8pc0w5xnq7ndzyngyz8zexj8czewj69pjxnc8pfckz2djxv2dxupzqsusl3SPAu3zexjk2fpr3sdcy9qw8gqd</code>). Without this address, you cannot receive payments.</p>
            </div>
          </div>

          {isEditing && (
            <>
              <div className="border-t border-slate-200" />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile || {});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  disabled={updateMutation.isPending || logoUploading}
                >
                  <Save className="w-4 h-4" />
                  {logoUploading ? "Uploading logo..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* CNT Token Access */}
      <Card className="p-8" id="cnt">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-500" />
            Supported CNT Tokens
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">All merchants can accept these platform-approved Cardano Native Tokens in their payment links.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {KNOWN_CNTS.map((token) => (
            <div
              key={token.policy_id}
              className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3"
            >
              <span className="text-sm font-semibold text-purple-900">{token.ticker}</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-8 border-red-200">
        <h3 className="text-lg font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-sm text-slate-500 mb-4">Permanently delete your merchant account and all associated data. This action cannot be undone.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your merchant account and all associated data — including payment links, transactions, terminals, and settings — will be permanently removed from our systems.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}