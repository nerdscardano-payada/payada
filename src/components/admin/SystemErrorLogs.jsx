import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Search } from "lucide-react";
import { format } from "date-fns";

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function SystemErrorLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["system-notifications"],
    queryFn: () =>
      base44.entities.Notification.filter({
        category: "admin",
      }),
    refetchInterval: 5000,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.filter({}),
  });

  const errors = [
    ...notifications.filter((n) => n.type === "webhook_failed"),
    ...auditLogs.filter((log) => log.result === "failure"),
  ].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

  const filteredErrors = errors.filter((error) => {
    const matchesSearch =
      (error.message || error.error_message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (error.title || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || (error.severity || "info") === severityFilter;

    const matchesEventType =
      eventTypeFilter === "all" ||
      (error.type || error.event_type || "") === eventTypeFilter;

    return matchesSearch && matchesSeverity && matchesEventType;
  });

  const eventTypes = Array.from(
    new Set(
      errors
        .map((e) => e.type || e.event_type)
        .filter(Boolean)
    )
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>System-Wide Error Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search errors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading logs...</div>
        ) : filteredErrors.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchTerm || severityFilter !== "all" || eventTypeFilter !== "all"
              ? "No matching errors found"
              : "No errors logged"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredErrors.slice(0, 50).map((error, idx) => {
                  const severity = error.severity || "info";
                  const config = SEVERITY_CONFIG[severity];
                  const Icon = config.icon;

                  return (
                    <TableRow key={`${error.id}-${idx}`}>
                      <TableCell className="text-xs">
                        {format(new Date(error.updated_date), "MMM dd, HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${config.color}`}
                          >
                            {severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {error.type || error.event_type}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                        {error.message || error.error_message}
                      </TableCell>
                      <TableCell className="text-sm">
                        {error.resource_type && (
                          <Badge variant="secondary" className="text-xs">
                            {error.resource_type}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredErrors.length > 50 && (
              <div className="text-center py-4 text-sm text-slate-500">
                Showing 50 of {filteredErrors.length} errors
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}