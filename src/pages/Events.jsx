import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Ticket, Users, MoreVertical, Eye, Edit, Trash2, QrCode, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import EventForm from "@/components/events/EventForm";
import EventCheckinPanel from "@/components/events/EventCheckinPanel";

const STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-red-100 text-red-600",
};

export default function Events() {
  const [view, setView] = useState("list"); // list | form | checkin
  const [editing, setEditing] = useState(null);
  const [checkinEvent, setCheckinEvent] = useState(null);
  const [user, setUser] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["events"] }); toast.success("Event deleted"); },
  });

  if (view === "form") {
    return <EventForm event={editing} user={user} onBack={() => { setView("list"); setEditing(null); }} />;
  }

  if (view === "checkin" && checkinEvent) {
    return <EventCheckinPanel event={checkinEvent} onBack={() => { setView("list"); setCheckinEvent(null); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sell tickets and accept ADA payments for your events</p>
        </div>
        <Button onClick={() => { setEditing(null); setView("form"); }} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No events yet</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first event and start selling tickets</p>
          <Button onClick={() => setView("form")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
                    <Badge className={STATUS_COLORS[event.status]}>{event.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                    {event.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(event.event_date), "d MMM yyyy, HH:mm")}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.is_online ? "Online" : event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      {event.total_tickets_sold || 0} tickets sold
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      ₳ {(event.total_received_ada || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => { setCheckinEvent(event); setView("checkin"); }}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Check-in
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => window.open(`/EventCheckout?slug=${event.slug}`, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditing(event); setView("form"); }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:border-red-200"
                    onClick={() => { if (confirm("Delete this event?")) deleteMutation.mutate(event.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}