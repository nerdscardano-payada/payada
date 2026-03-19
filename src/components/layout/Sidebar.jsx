import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  X,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  FlaskConical,
  Rocket,
  Calendar,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import NotificationBell from "@/components/notifications/NotificationBell";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Ontvang betalingen", icon: CreditCard, page: "PaymentLinks" },
  { name: "Verkoop", icon: ShoppingCart, page: "ShoppingPageGenerator" },
  { name: "Community", icon: Users, page: "AccessLinks", badge: "NEW" },
  { name: "Events", icon: Calendar, page: "Events", badge: "NEW" },
  { name: "Klanten", icon: Users, page: "Customers" },
];

const bottomItems = [
  { name: "Instellingen", icon: Settings, page: "Settings" },
];

export default function Sidebar({ currentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col bg-slate-950 text-white transition-sidebar",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
         <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
           <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
               <Hexagon className="w-4.5 h-4.5 text-white" />
             </div>
             {!collapsed && (
               <span className="font-bold text-base tracking-tight truncate">
                 Pay<span className="text-cyan-400">ADA</span>
               </span>
             )}
           </Link>
           <div className="flex items-center gap-1">
             <NotificationBell user={user} collapsed={collapsed} />
             <button
               onClick={() => setMobileOpen(false)}
               className="lg:hidden p-1 rounded hover:bg-white/10"
             >
               <X className="w-4 h-4" />
             </button>
           </div>
         </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                   "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                   isActive
                     ? "bg-blue-500/15 text-blue-400"
                     : "text-slate-400 hover:text-white hover:bg-white/5"
                 )}
              >
                <item.icon className={cn(
                   "w-[18px] h-[18px] flex-shrink-0",
                   isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                 )} />
                {!collapsed && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              {!collapsed && (
                <div className="px-3 pt-4 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Admin</span>
                </div>
              )}
              <Link
                to={createPageUrl("AdminDashboard")}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                  currentPage === "AdminDashboard"
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <ShieldCheck className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  currentPage === "AdminDashboard" ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!collapsed && <span className="truncate">Admin Dashboard</span>}
              </Link>
              <Link
                to={createPageUrl("AdminCNTLab")}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                  currentPage === "AdminCNTLab"
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <FlaskConical className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  currentPage === "AdminCNTLab" ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!collapsed && <span className="truncate">CNT Lab <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full ml-1">TEST</span></span>}
              </Link>
              <Link
                to={createPageUrl("AdminLaunchpad")}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                  currentPage === "AdminLaunchpad"
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Rocket className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  currentPage === "AdminLaunchpad" ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!collapsed && <span className="truncate">Launchpad Lab <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full ml-1">NEW</span></span>}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom navigation + Logout + Collapse toggle */}
         <div className="flex flex-col p-3 border-t border-white/5 gap-1">
           {bottomItems.map((item) => {
             const isActive = currentPage === item.page;
             return (
               <Link
                 key={item.page}
                 to={createPageUrl(item.page)}
                 onClick={() => setMobileOpen(false)}
                 className={cn(
                   "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                   isActive
                     ? "bg-white/10 text-white"
                     : "text-slate-400 hover:text-white hover:bg-white/5"
                 )}
               >
                 <item.icon className={cn(
                   "w-4 h-4 flex-shrink-0",
                   isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                 )} />
                 {!collapsed && <span className="truncate">{item.name}</span>}
               </Link>
             );
           })}
           <button
             onClick={() => base44.auth.logout(createPageUrl("Home"))}
             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
           >
             <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
             {!collapsed && <span>Logout</span>}
           </button>
           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden lg:flex w-full items-center justify-center py-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
           >
             {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
           </button>
         </div>
      </aside>
    </>
  );
}