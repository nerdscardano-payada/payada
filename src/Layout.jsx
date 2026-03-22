import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const publicPages = ["Checkout", "SubscriberPortal", "Home", "Pay", "PayTerminal", "Features", "Pricing", "Security", "Documentation", "APIReference", "Webhooks", "About", "Contact", "PrivacyPolicy", "TermsOfService", "AcceptableUsePolicy", "MerchantAgreement", "Disclaimer", "PaymentProof", "Unlock", "Store", "Access", "Roadmap", "Litepaper", "TokenSale", "EventCheckout", "EventEntry", "Demo", "MultiTokenCheckout", "Donate"];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageName]);

  useEffect(() => {
    if (publicPages.includes(currentPageName)) {
      setAuthChecked(true);
      return;
    }
    base44.auth.isAuthenticated().then((loggedIn) => {
      if (!loggedIn) {
        base44.auth.redirectToLogin(window.location.href);
      } else {
        setAuthChecked(true);
      }
    });
  }, [currentPageName]);

  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  if (!authChecked) return null;

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
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </span>
        </header>

        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}