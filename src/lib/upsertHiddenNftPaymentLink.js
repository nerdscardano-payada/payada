import { base44 } from "@/api/base44Client";

const createSlug = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function upsertHiddenNftPaymentLink({ existingLink, merchantId, title, amountAda, receiveAddress, slugBase }) {
  const payload = {
    merchant_id: merchantId,
    title,
    description: title,
    slug: existingLink?.is_hidden ? existingLink.slug : `${createSlug(slugBase || title || "nft-link")}-${Date.now()}`,
    amount_mode: "fixed_ada",
    amount_ada: Number(amountAda) || 0,
    receive_address: receiveAddress,
    status: "active",
    confirmations_required: 2,
    is_hidden: true,
    collect_email: true,
    collect_name: true,
  };

  if (existingLink?.is_hidden) {
    return base44.entities.PaymentLink.update(existingLink.id, payload);
  }

  return base44.entities.PaymentLink.create(payload);
}