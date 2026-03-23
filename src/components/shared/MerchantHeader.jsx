import React from 'react';
import { base44 } from '@/api/base44Client';

export default function MerchantHeader({ merchantId }) {
  const [merchant, setMerchant] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    if (!merchantId) return;
    base44.entities.MerchantProfile.filter({ user_id: merchantId }, '-updated_date', 1)
      .then((rows) => { if (mounted) setMerchant(rows[0] || null); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [merchantId]);

  if (!merchant) return null;

  const websiteUrlRaw = merchant.website_url || "";
  const websiteUrl = /^https?:\/\//i.test(websiteUrlRaw)
    ? websiteUrlRaw
    : (websiteUrlRaw ? `https://${websiteUrlRaw.replace(/^\/+/, "")}` : "");

  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      {merchant.logo_url && <img src={merchant.logo_url} alt={merchant.business_name} className="h-8 w-8 rounded" />}
      <span className="text-slate-200 font-medium flex items-center gap-2">
        {merchant.nft_store_name || merchant.business_name}
        {merchant.verified_merchant && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 text-[11px] font-semibold">Verified</span>
        )}
      </span>
      {websiteUrl && (
        <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline text-xs">Website</a>
      )}
    </div>
  );
}