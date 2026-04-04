import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`border-border bg-card/80 backdrop-blur-sm hover:bg-secondary ${className}`}
      aria-label={isDark ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
    >
      {isDark ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-foreground" />}
    </Button>
  );
}