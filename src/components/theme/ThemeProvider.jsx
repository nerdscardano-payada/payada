import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "payada-theme";
const DARK_MODE_PAGES = ["/Pay", "/Checkout", "/PayTerminal", "/Access", "/EventCheckout", "/MultiTokenCheckout", "/Donate", "/NFTGate", "/NFTStore", "/SubscriberPortal"];

const shouldUseDarkMode = (pathname) => DARK_MODE_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    return "dark";
  });

  useEffect(() => {
    const applyTheme = () => {
      const pathname = window.location.pathname;
      const nextTheme = shouldUseDarkMode(pathname) ? "dark" : "light";
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      localStorage.setItem(STORAGE_KEY, nextTheme);
      if (theme !== nextTheme) {
        setTheme(nextTheme);
      }
    };

    applyTheme();
    window.addEventListener("popstate", applyTheme);
    return () => window.removeEventListener("popstate", applyTheme);
  }, [theme]);

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