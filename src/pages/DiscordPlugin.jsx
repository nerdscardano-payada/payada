import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Bot, Shield, Hash, Key, Zap, CheckCircle2,
  ExternalLink, Info, ChevronRight, Loader2, Settings, Plus, Copy, Check
} from "lucide-react";
import DiscordSetupWizard from "@/components/discord/DiscordSetupWizard";

export default function DiscordPlugin() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
  const [showWizard, setShowWizard] = React.useState(false);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ["discord-plugin", user?.email],
    queryFn: () => base44.entities.MerchantPlugin.filter({
      merchant_id: user.email,
      plugin_type: "discord_gate"
    }),
    enabled: !!user?.email
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email, status: "active" }),
    enabled: !!user?.email
  });

  const plugin = plugins[0] || null;

  const [form, setForm] = useState({
    guild_id: "",
    role_id: "",
    bot_token: "",
    invite_channel_id: "",
    welcome_message: "",
    payment_link_ids: [],
    enabled: false
  });

  React.useEffect(() => {
    if (plugin) {
      setForm({
        guild_id: plugin.guild_id || "",
        role_id: plugin.role_id || "",
        bot_token: plugin.bot_token || "",
        invite_channel_id: plugin.invite_channel_id || "",
        welcome_message: plugin.welcome_message || "",
        payment_link_ids: plugin.payment_link_ids || [],
        enabled: plugin.enabled || false
      });
    }
  }, [plugin]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (plugin) {
        return base44.entities.MerchantPlugin.update(plugin.id, data);
      } else {
        return base44.entities.MerchantPlugin.create({
          ...data,
          merchant_id: user.email,
          plugin_type: "discord_gate"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discord-plugin"] });
      toast.success("Discord plugin saved!");
    },
    onError: (e) => toast.error(e.message)
  });

  const toggleLink = (id) => {
    setForm(f => ({
      ...f,
      payment_link_ids: f.payment_link_ids.includes(id)
        ? f.payment_link_ids.filter(x => x !== id)
        : [...f.payment_link_ids, id]
    }));
  };

  const handleSave = () => {
    if (!form.guild_id || !form.role_id || !form.bot_token) {
      toast.error("Guild ID, Role ID and Bot Token are required.");
      return;
    }
    saveMutation.mutate(form);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
    </div>
  );

  // Show wizard for new setup or when triggered
  if (showWizard || (!plugin && !isLoading)) {
    return (
      <div className="max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discord Gate</h1>
          <p className="text-slate-500 text-sm mt-1">Automatically grant Discord roles after confirmed ADA payments.</p>
        </div>
        <DiscordSetupWizard
          initialForm={plugin ? {
            guild_id: plugin.guild_id || "", role_id: plugin.role_id || "",
            bot_token: plugin.bot_token || "", invite_channel_id: plugin.invite_channel_id || "",
            welcome_message: plugin.welcome_message || "", payment_link_ids: plugin.payment_link_ids || [],
            enabled: plugin.enabled || false
          } : undefined}
          plugin={plugin}
          userId={user?.email}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ["discord-plugin"] }); setShowWizard(false); }}
          onCancel={plugin ? () => setShowWizard(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discord Gate</h1>
          <p className="text-slate-500 text-sm mt-1">
            Automatically grant Discord roles to customers after a confirmed ADA payment.
          </p>
        </div>
        <Badge className={plugin?.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
          {plugin?.enabled ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

        {/* Enable toggle */}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="font-medium text-slate-900">Enable Discord Gate</p>
            <p className="text-xs text-slate-500 mt-0.5">Grant roles automatically after confirmed payments</p>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => setForm(f => ({ ...f, enabled: v }))}
          />
        </div>

        {/* Guild ID */}
        <div className="p-5 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Hash className="w-4 h-4 text-slate-400" /> Guild ID (Server ID)
          </Label>
          <Input
            value={form.guild_id}
            onChange={(e) => setForm(f => ({ ...f, guild_id: e.target.value }))}
            placeholder="e.g. 1234567890123456789"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-400">Right-click your server icon → Copy Server ID (enable Developer Mode first)</p>
        </div>

        {/* Role ID */}
        <div className="p-5 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Shield className="w-4 h-4 text-slate-400" /> Role ID
          </Label>
          <Input
            value={form.role_id}
            onChange={(e) => setForm(f => ({ ...f, role_id: e.target.value }))}
            placeholder="e.g. 9876543210987654321"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-400">Server Settings → Roles → right-click role → Copy Role ID</p>
        </div>

        {/* Bot Token */}
        <div className="p-5 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Key className="w-4 h-4 text-slate-400" /> Bot Token
          </Label>
          <Input
            type="password"
            value={form.bot_token}
            onChange={(e) => setForm(f => ({ ...f, bot_token: e.target.value }))}
            placeholder="Bot token from Discord Developer Portal"
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-400">Developer Portal → Your App → Bot → Reset Token</p>
        </div>

        {/* Welcome message */}
        <div className="p-5 space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Bot className="w-4 h-4 text-slate-400" /> Welcome DM (optional)
          </Label>
          <Input
            value={form.welcome_message}
            onChange={(e) => setForm(f => ({ ...f, welcome_message: e.target.value }))}
            placeholder="e.g. Welcome to our community! Your access has been activated. 🎉"
          />
          <p className="text-xs text-slate-400">The bot will DM this message to the user after granting access.</p>
        </div>

        {/* Payment links */}
        {paymentLinks.length > 0 && (
          <div className="p-5 space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-slate-400" /> Trigger on payment links
            </Label>
            <p className="text-xs text-slate-400">Leave all unselected to trigger on ALL your payment links.</p>
            <div className="space-y-2">
              {paymentLinks.map(link => (
                <label key={link.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.payment_link_ids.includes(link.id)}
                    onChange={() => toggleLink(link.id)}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{link.title}</p>
                    <p className="text-xs text-slate-400">₳ {link.amount_ada?.toFixed(2)} · /{link.slug}</p>
                  </div>
                  {form.payment_link_ids.includes(link.id) && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowWizard(true)}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <Settings className="w-4 h-4 mr-2" /> Reconfigure
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 h-11"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save changes
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Share links section */}
      {plugin && (() => {
        const selectedLinks = form.payment_link_ids.length > 0
          ? paymentLinks.filter(l => form.payment_link_ids.includes(l.id))
          : paymentLinks;
        if (selectedLinks.length === 0) return null;
        return (
          <ShareLinksInfo links={selectedLinks} />
        );
      })()}
    </div>
  );
}

function ShareLinksInfo({ links }) {
  const [copiedId, setCopiedId] = React.useState(null);
  const baseUrl = window.location.origin;

  const copyUrl = (slug, id) => {
    navigator.clipboard.writeText(`${baseUrl}/Pay?slug=${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-indigo-600" />
        <p className="text-sm font-semibold text-indigo-900">Share these links in your Discord server</p>
      </div>
      <p className="text-xs text-indigo-700 leading-relaxed">
        Post the link(s) below in a Discord channel (e.g. <code className="bg-indigo-100 px-1 rounded">#get-access</code>). 
        After a successful payment, the bot will automatically assign the Discord role to the buyer.
      </p>
      <div className="space-y-2">
        {links.map(link => {
            const url = `${baseUrl}/Pay?slug=${link.slug}`;
          return (
            <div key={link.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-indigo-100">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{link.title}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{url}</p>
              </div>
              <button
                onClick={() => copyUrl(link.slug, link.id)}
                className="ml-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors flex-shrink-0"
              >
                {copiedId === link.id
                  ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-indigo-600 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        Tip: create a dedicated <strong>#get-access</strong> channel in Discord and paste the link(s) there.
      </p>
    </div>
  );
}