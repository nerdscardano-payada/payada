import React, { useState } from "react";
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
  ExternalLink, Info, ChevronRight, Loader2
} from "lucide-react";

export default function DiscordPlugin() {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState(null);
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

      {/* Setup guide */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2 text-sm text-indigo-800">
        <p className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Setup checklist</p>
        <ol className="list-decimal list-inside space-y-1 text-indigo-700">
          <li>Create a bot in <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="underline">Discord Developer Portal</a></li>
          <li>Add the bot to your server with <strong>Manage Roles</strong> permission</li>
          <li>Create a role for paying members and copy its ID</li>
          <li>Make sure the bot's role is <strong>above</strong> the member role in server settings</li>
          <li>Customers must already be in your Discord server before paying</li>
        </ol>
        <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 font-medium mt-1 hover:underline">
          Open Discord Developer Portal <ExternalLink className="w-3 h-3" />
        </a>
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

      <Button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-11"
      >
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {plugin ? "Save changes" : "Activate Discord Gate"}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}