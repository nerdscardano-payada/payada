import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pagesConfig } from "@/pages.config";

const statusOptions = ["submitted", "in_review", "ready_for_feedback", "completed"];
const availablePages = Object.keys(pagesConfig.Pages)
  .filter((page) => !["Home", "AdminToolBuilderInbox", "AdminAIPaymentBuilder"].includes(page))
  .sort((a, b) => a.localeCompare(b));

function RequestCard({ request }) {
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");
  const [assignedToolName, setAssignedToolName] = useState(request.assigned_tool_name || "");
  const [assignedToolPage, setAssignedToolPage] = useState(request.assigned_tool_page || "");

  const updateMutation = useMutation({
    mutationFn: (payload) => base44.entities.AIBuilderRequest.update(request.id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tool-builder-requests"] }),
  });

  const handleStatus = (status) => {
    updateMutation.mutate({ status });
  };

  const handleSaveAssignment = () => {
    updateMutation.mutate({
      admin_notes: adminNotes,
      assigned_tool_name: assignedToolName,
      assigned_tool_page: assignedToolPage ? `/${assignedToolPage.replace(/^\//, "")}` : "",
      assigned_to_merchant: Boolean(assignedToolName || assignedToolPage),
      status: request.status === "submitted" ? "in_review" : request.status,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-base">{request.request_title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.business_name || request.merchant_name || request.contact_email}
            </p>
          </div>
          <Badge variant="secondary">{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Merchant</p>
            <p className="mt-1 text-sm">{request.contact_email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <p className="mt-1 text-sm">{request.tool_type}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Use case</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{request.use_case}</p>
        </div>

        {request.special_requirements && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Extra wensen</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{request.special_requirements}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tool naam</Label>
            <Input value={assignedToolName} onChange={(e) => setAssignedToolName(e.target.value)} placeholder="Bijv. VIP Checkout Flow" />
          </div>
          <div className="space-y-2">
            <Label>Pagina / route</Label>
            <Select value={assignedToolPage} onValueChange={setAssignedToolPage}>
              <SelectTrigger>
                <SelectValue placeholder="Kies een bestaande pagina" />
              </SelectTrigger>
              <SelectContent>
                {availablePages.map((page) => (
                  <SelectItem key={page} value={page}>{`/${page}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Admin notities</Label>
          <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="min-h-[100px]" placeholder="Interne notities of instructies voor de merchant" />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button key={status} type="button" variant={request.status === status ? "default" : "outline"} onClick={() => handleStatus(status)}>
              {status}
            </Button>
          ))}
          <Button type="button" onClick={handleSaveAssignment}>
            Opslaan en koppelen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminRequestInbox() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-tool-builder-requests"],
    queryFn: () => base44.entities.AIBuilderRequest.list("-created_date"),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">Tool builder inbox</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hier zie je alle aanvragen, admin notities en de koppeling naar de juiste merchant.
        </p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Aanvragen laden...</CardContent></Card>
      ) : requests.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Er zijn nog geen aanvragen binnengekomen.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}