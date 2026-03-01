import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const severityColors = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-amber-50 border-amber-200',
  critical: 'bg-red-50 border-red-200'
};

const severityIcons = {
  info: <Info className="w-4 h-4 text-blue-600" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-600" />,
  critical: <AlertCircle className="w-4 h-4 text-red-600" />
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    const fetchMerchant = async () => {
      const user = await base44.auth.me();
      if (user) {
        const profiles = await base44.entities.MerchantProfile.filter({
          user_id: user.id
        });
        if (profiles.length > 0) {
          setMerchant(profiles[0]);
        }
      }
    };
    fetchMerchant();
  }, []);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications', merchant?.id],
    queryFn: () =>
      merchant?.id
        ? base44.entities.Notification.filter(
            { merchant_id: merchant.id },
            '-created_date',
            50
          )
        : Promise.resolve([]),
    enabled: !!merchant?.id,
    refetchInterval: 30000
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, {
      is_read: true,
      read_at: new Date().toISOString()
    });
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    for (const notif of notifications.filter(n => !n.is_read)) {
      await base44.entities.Notification.update(notif.id, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    }
    refetch();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors',
                    !notif.is_read && 'bg-blue-50'
                  )}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {severityIcons[notif.severity] ||
                        severityIcons.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-slate-900 text-sm">
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {notif.message}
                      </p>
                      {notif.action_url && (
                        <a
                          href={notif.action_url}
                          className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                        >
                          View details →
                        </a>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(notif.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}