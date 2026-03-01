import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApiKeys() {
  const [showDialog, setShowDialog] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState(null);
  const [generatedKeyValue, setGeneratedKeyValue] = useState("");
  const [merchantId, setMerchantId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setMerchantId(user.email);
      } catch (error) {
        console.error("Failed to get user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: () => base44.entities.ApiKey.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ApiKey.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      setNewKey({ key_value: generatedKeyValue, key_prefix: data.key_prefix, name: data.name });
      toast.success("API key created!");
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ApiKey.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast.success("API key deleted");
    },
  });

  const generateKey = () => {
    if (!keyName.trim()) return;
    const key = "pk_live_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const prefix = key.slice(0, 12);
    setGeneratedKeyValue(key);
    createMutation.mutate({ name: keyName, key_prefix: prefix, key_value_hashed: key });
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied!");
  };

  return (
    <div>
      <PageHeader
        title="API Keys"
        subtitle="Manage API keys for programmatic access"
        action={() => { setShowDialog(true); setNewKey(null); }}
        actionLabel="Create Key"
        actionIcon={Plus}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h3 className="text-base font-bold text-blue-900 mb-4">API Keys - Volledige Gids</h3>
        
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📌 Wat zijn API Keys?</h4>
            <p className="text-sm text-blue-800">
              API Keys zijn veilige authenticatietokens waarmee je externe applicaties verbinding kunt laten maken met PayADA. Met je API Key kun je betalingen verwerken, abonnementen beheren en webhooks activeren - allemaal via code.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🎯 Wat kun je ermee doen?</h4>
            <ul className="text-sm text-blue-800 space-y-2 ml-4">
              <li className="list-disc"><strong>Betalingen accepteren:</strong> Maak betaalsessies aan en verwerk Cardano-betalingen programmatisch</li>
              <li className="list-disc"><strong>Betalingen opvragen:</strong> Check de status van betalingen en ontvang real-time updates</li>
              <li className="list-disc"><strong>Abonnementen beheren:</strong> Maak abonnementsplannen aan en beheer klanten automatisch</li>
              <li className="list-disc"><strong>Webhooks configureren:</strong> Ontvang real-time notificaties wanneer betalingen binnenkomen</li>
              <li className="list-disc"><strong>Rapportages opvragen:</strong> Haal gedetailleerde transactie- en klantgegevens op voor je administratie</li>
              <li className="list-disc"><strong>Integreren:</strong> Verbind PayADA met je website, mobiele app, of besturingssysteem</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">⚡ Hoe werkt het?</h4>
            <p className="text-sm text-blue-800 mb-2">
              Je API Key voeg je toe aan de Authorization header van je API requests:
            </p>
            <code className="bg-blue-100 border border-blue-300 rounded px-3 py-2 text-xs text-blue-900 font-mono block overflow-auto">
              Authorization: Bearer pk_live_xxxxxxxxxxxxx
            </code>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 Best Practices</h4>
            <ul className="text-sm text-blue-800 space-y-1.5 ml-4">
              <li className="list-disc">Maak aparte keys voor elk project (test, staging, production)</li>
              <li className="list-disc">Zet je API Key NOOIT in publieke code repositories of client-side code</li>
              <li className="list-disc">Verwijder ongebruikte keys om veiligheid te maximaliseren</li>
              <li className="list-disc">Monitor "Last Used" data om ongebruikte keys op te sporen</li>
              <li className="list-disc">Gebruik environment variables om je keys veilig op te slaan</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📚 Volgende stappen</h4>
            <ul className="text-sm text-blue-800 space-y-1.5 ml-4">
              <li className="list-disc">Klik "Create Key" om je eerste API Key aan te maken</li>
              <li className="list-disc">Kopieer de key direct - je ziet hem daarna niet meer</li>
              <li className="list-disc">Bezoek onze <Link to={createPageUrl("APIReference")} className="text-blue-700 font-semibold hover:underline">API Documentation</Link> voor codevoorbeelden</li>
              <li className="list-disc">Test je integratie in een test-omgeving voordat je live gaat</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No API keys"
            description="Create API keys to integrate PayADA programmatically."
            actionLabel="Create API Key"
            onAction={() => setShowDialog(true)}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-900">{k.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{k.key_prefix}•••••••••</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created {format(new Date(k.created_date), "MMM d, yyyy")}
                    {k.last_used_at && ` · Last used ${format(new Date(k.last_used_at), "MMM d")}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteMutation.mutate(k.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setNewKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4 mt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">Copy your API key now. You won't be able to see it again.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white border px-3 py-2 rounded font-mono break-all">{newKey.key_value}</code>
                  <Button size="icon" variant="outline" onClick={() => copyKey(newKey.key_value)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setShowDialog(false); setNewKey(null); }}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Key Name *</Label>
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Production API Key" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={generateKey} disabled={!keyName || createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Generate Key
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}