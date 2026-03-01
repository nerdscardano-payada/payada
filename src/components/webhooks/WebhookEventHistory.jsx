import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

const eventTypeColors = {
  payment_confirmed: "bg-green-100 text-green-800",
  payment_detected: "bg-blue-100 text-blue-800",
  payment_refunded: "bg-orange-100 text-orange-800",
  subscription_payment_failed: "bg-red-100 text-red-800",
  dispute_initiated: "bg-purple-100 text-purple-800",
  webhook_failed: "bg-red-100 text-red-800",
};

const statusIcons = {
  delivered: CheckCircle,
  failed: AlertCircle,
  retrying: Clock,
  pending: Clock,
};

export default function WebhookEventHistory({ merchantId }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["webhook-logs", merchantId],
    queryFn: () =>
      base44.entities.WebhookLog.filter({
        merchant_id: merchantId,
      }),
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Webhook Delivery History</span>
            <Badge variant="outline">{logs.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading webhook history...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No webhook events yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log) => {
                    const StatusIcon = statusIcons[log.status] || Clock;
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={eventTypeColors[log.event_type] || "bg-slate-100 text-slate-800"}>
                            {log.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.resource_type}: {log.resource_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon
                              className={`w-4 h-4 ${
                                log.status === "delivered"
                                  ? "text-green-600"
                                  : log.status === "failed"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            />
                            <span className="capitalize text-sm">
                              {log.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.attempt_number} / {log.max_retries}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {log.delivered_at
                            ? format(new Date(log.delivered_at), "MMM dd, HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Webhook Event Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Event Type
                  </p>
                  <p className="text-sm">{selectedLog.event_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        selectedLog.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : selectedLog.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Resource
                  </p>
                  <p className="text-sm">
                    {selectedLog.resource_type}: {selectedLog.resource_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    Attempts
                  </p>
                  <p className="text-sm">
                    {selectedLog.attempt_number} / {selectedLog.max_retries}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  Endpoint
                </p>
                <p className="text-sm font-mono bg-slate-50 p-2 rounded break-all">
                  {selectedLog.endpoint_url}
                </p>
              </div>

              {selectedLog.http_status_code && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    HTTP Response
                  </p>
                  <p className="text-sm font-mono">
                    Status: {selectedLog.http_status_code}
                  </p>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Error
                  </p>
                  <p className="text-sm bg-red-50 text-red-700 p-2 rounded font-mono">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}

              {selectedLog.payload && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Payload
                  </p>
                  <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(selectedLog.payload, null, 2))
                    }
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copied ? "Copied!" : "Copy Payload"}
                  </Button>
                </div>
              )}

              {selectedLog.next_retry_at && (
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">
                    Next Retry
                  </p>
                  <p className="text-sm">
                    {format(
                      new Date(selectedLog.next_retry_at),
                      "MMM dd, yyyy HH:mm:ss"
                    )}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}