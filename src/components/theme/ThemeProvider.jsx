import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "payada-theme";
const PUBLIC_THEME_PAGES = ["/", "/Pay", "/Checkout", "/PayTerminal", "/Access", "/EventCheckout", "/MultiTokenCheckout", "/Donate", "/NFTGate", "/NFTStore", "/SubscriberPortal"];

const canUseThemeToggle = (pathname) => PUBLIC_THEME_PAGES.some((page) => {
  if (page === "/") return pathname === "/";
  return pathname === page || pathname.startsWith(`${page}/`);
});

const getStoredTheme = () => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "dark";
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    const applyTheme = () => {
      const pathname = window.location.pathname;
      const nextTheme = canUseThemeToggle(pathname) ? getStoredTheme() : "light";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
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

  const updateTheme = (nextTheme) => {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  };

  const toggleTheme = () => {
    if (!canUseThemeToggle(window.location.pathname)) return;
    updateTheme(theme === "dark" ? "light" : "dark");
  };

  const value = useMemo(() => ({
    theme,
    setTheme: updateTheme,
    toggleTheme
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