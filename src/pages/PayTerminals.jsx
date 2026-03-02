import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, ExternalLink, Pencil, Trash2, Monitor } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import TerminalForm from "@/components/terminals/TerminalForm";

export default function PayTerminals() {
  const [showForm, setShowForm] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: terminals = [], isLoading } = useQuery({
    queryKey: ["pay-terminals", user?.email],
    queryFn: () => base44.entities.PayTerminal.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PayTerminal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-terminals"] });
      toast.success("Terminal verwijderd");
    },
  });

  const getTerminalUrl = (terminal) =>
    `${window.location.origin}${createPageUrl("PayTerminal")}?id=${terminal.id}`;

  const copyUrl = (terminal) => {
    navigator.clipboard.writeText(getTerminalUrl(terminal));
    toast.success("Link gekopieerd!");
  };

  const copyEmbed = (terminal) => {
    const url = getTerminalUrl(terminal);
    const code = `<iframe src="${url}" width="480" height="700" frameborder="0" style="border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);"></iframe>`;
    navigator.clipboard.writeText(code);
    toast.success("Embed code gekopieerd!");
  };

  const openEdit = (terminal) => {
    setEditingTerminal(terminal);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingTerminal(null);
  };

  if (showForm) {
    return (
      <div>
        <TerminalForm terminal={editingTerminal} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pay Terminals"
        subtitle="Configureerbare betaalterminals voor je website (iframe/modal)"
        action={() => setShowForm(true)}
        actionLabel="Nieuwe terminal"
        actionIcon={Plus}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : terminals.length === 0 ? (
        <EmptyState
          icon={Monitor}
          title="Geen terminals"
          description="Maak je eerste betaalterminal aan en embed deze op je website."
          actionLabel="Nieuwe terminal"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {terminals.map((terminal) => (
            <div key={terminal.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: terminal.accent_color + "22" }}
              >
                <Monitor className="w-5 h-5" style={{ color: terminal.accent_color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 truncate">{terminal.name}</p>
                  <Badge variant={terminal.status === "active" ? "default" : "secondary"} className="text-[11px]">
                    {terminal.status === "active" ? "Actief" : "Inactief"}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {terminal.mode === "one_time" ? "Eenmalig" : "Abonnement"}
                  </Badge>
                </div>
                {terminal.description && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{terminal.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => copyEmbed(terminal)} className="gap-1.5 text-xs">
                  <Copy className="w-3.5 h-3.5" /> Embed
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyUrl(terminal)} className="gap-1.5 text-xs">
                  <Copy className="w-3.5 h-3.5" /> Link
                </Button>
                <a href={getTerminalUrl(terminal)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="w-8 h-8">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
                <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => openEdit(terminal)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600"
                  onClick={() => deleteMutation.mutate(terminal.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}