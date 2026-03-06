import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotificationBell({ user, collapsed }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    // Subscribe to payment updates
    const unsubscribe = base44.entities.Payment.subscribe((event) => {
      // Only listen for confirmed payments
      if (event.type === "update" && event.data?.status === "confirmed") {
        const newNotif = {
          id: event.data.id,
          type: "payment_confirmed",
          payer: event.data.payer_name || event.data.payer_email || "Unknown",
          amount: event.data.received_amount_ada || event.data.expected_amount_ada,
          timestamp: new Date(),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
        setUnreadCount((prev) => prev + 1);

        // Play subtle ping sound
        playPingSound();
      }
    });

    return () => unsubscribe();
  }, [user?.email]);

  const playPingSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowDropdown(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest("[data-notification-bell]")) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      data-notification-bell
      className="relative"
    >
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
          "text-slate-400 hover:text-white hover:bg-white/10"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
            unreadCount > 99 ? "bg-red-600 text-white" : "bg-red-500 text-white"
          )}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">
              Payments {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="px-4 py-3 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          Payment confirmed
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {notif.payer}
                        </p>
                        <p className="text-sm font-semibold text-cyan-400 mt-1">
                          ₳ {notif.amount?.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(notif.timestamp, "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-700 px-4 py-2 bg-slate-800/50 text-center">
              <a
                href="/payments"
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View all payments →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}