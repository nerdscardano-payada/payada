import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "payada-theme";
const PUBLIC_PAGES = ["/", "/Home", "/Pay", "/Access", "/About", "/Contact", "/Features", "/Pricing", "/Security", "/Documentation", "/Webhooks", "/PrivacyPolicy", "/TermsOfService", "/AcceptableUsePolicy", "/MerchantAgreement", "/Disclaimer", "/PaymentProof", "/Unlock", "/Store", "/Roadmap", "/Litepaper", "/TokenSale", "/EventCheckout", "/EventEntry", "/Demo", "/MultiTokenCheckout", "/Donate", "/NFTGate", "/NFTStore", "/NFTMarketplaceFAQ", "/NFTMarketplaceTerms", "/Marketplace", "/SubscriberPortal", "/Checkout", "/PayTerminal"];

const isPublicPath = (pathname) => {
  if (pathname === "/") return true;
  return PUBLIC_PAGES.filter((page) => page !== "/").some((page) => pathname === page || pathname.startsWith(`${page}/`));
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const pathname = window.location.pathname;
    if (!isPublicPath(pathname)) return "light";
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const applyTheme = () => {
      const pathname = window.location.pathname;
      const nextTheme = isPublicPath(pathname) ? theme : "light";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      if (isPublicPath(pathname)) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    };

    applyTheme();
    window.addEventListener("popstate", applyTheme);
    return () => window.removeEventListener("popstate", applyTheme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => {
      if (!isPublicPath(window.location.pathname)) return;
      setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
    }
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}