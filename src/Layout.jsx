import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const publicPages = ["Checkout", "SubscriberPortal"];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPageName}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={cn(
        "transition-sidebar min-h-screen",
        collapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
      )}>
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <span className="ml-3 font-semibold text-slate-900 text-sm">
            Pay<span className="text-indigo-500">ADA</span>
          </span>
        </header>

        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}