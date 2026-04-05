import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MerchantAssignedToolsPanel() {
  const { data: user } = useQuery({
    queryKey: ["merchant-assigned-tools-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["merchant-assigned-tools", user?.email],
    queryFn: () => base44.entities.AIBuilderRequest.filter({ merchant_id: user?.email }),
    enabled: !!user?.email,
  });

  const assignedRequests = requests.filter((request) => request.assigned_to_merchant);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Jouw gekoppelde tools</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Er zijn nog geen tools aan jouw account gekoppeld.</p>
        ) : (
          <div className="space-y-3">
            {assignedRequests.map((request) => (
              <div key={request.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{request.assigned_tool_name || request.request_title}</p>
                    <p className="text-sm text-muted-foreground">{request.assigned_tool_page || "Nog geen route ingevuld"}</p>
                  </div>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
                {request.admin_notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{request.admin_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}