import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "payada-theme";
const PUBLIC_DARK_MODE_PAGES = ["/", "/Pay", "/Checkout", "/PayTerminal", "/Access", "/EventCheckout", "/MultiTokenCheckout", "/Donate", "/NFTGate", "/NFTStore", "/SubscriberPortal"];

const shouldUseDarkMode = (pathname) => PUBLIC_DARK_MODE_PAGES.some((page) => {
  if (page === "/") return pathname === "/";
  return pathname === page || pathname.startsWith(`${page}/`);
});

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const applyTheme = () => {
      const pathname = window.location.pathname;
      const nextTheme = shouldUseDarkMode(pathname) ? "dark" : "light";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      localStorage.setItem(STORAGE_KEY, nextTheme);
      setTheme(nextTheme);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    const notifyRouteChange = () => window.dispatchEvent(new Event("locationchange"));

    window.history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      notifyRouteChange();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      notifyRouteChange();
      return result;
    };

    window.addEventListener("popstate", notifyRouteChange);
    window.addEventListener("locationchange", applyTheme);

    applyTheme();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", notifyRouteChange);
      window.removeEventListener("locationchange", applyTheme);
    };
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme: () => {},
    toggleTheme: () => {}
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