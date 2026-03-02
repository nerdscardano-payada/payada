import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Link2,
  CreditCard,
  RefreshCw,
  ListOrdered,
  Users,
  Webhook,
  Key,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  X,
  Building2,
  Code2,
  ShoppingCart,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Merchant Profile", icon: Building2, page: "MerchantProfile" },
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Payment Links", icon: Link2, page: "PaymentLinks" },
  { name: "Payments", icon: CreditCard, page: "Payments" },
  { name: "Subscriptions", icon: RefreshCw, page: "SubscriptionPlans" },
  { name: "Subscribers", icon: ListOrdered, page: "Subscriptions" },
  { name: "Customers", icon: Users, page: "Customers" },
  { name: "Webhooks", icon: Webhook, page: "Webhooks" },
  { name: "API Keys", icon: Key, page: "ApiKeys" },
  { name: "Pay Terminals", icon: Monitor, page: "PayTerminals" },
  { name: "Button Generator", icon: Code2, page: "ButtonGenerator" },
  { name: "Shop Generator", icon: ShoppingCart, page: "ShoppingPageGenerator" },
  { name: "Billing", icon: Receipt, page: "Billing" },
];

export default function Sidebar({ currentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Hexagon className="w-4.5 h-4.5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-base tracking-tight truncate">
                Pay<span className="text-cyan-400">ADA</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
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
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex p-3 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}