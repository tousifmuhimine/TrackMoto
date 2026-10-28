"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  showLabel = true,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border select-none",
        isDark
          ? "bg-slate-800/90 hover:bg-slate-750 text-amber-400 border-slate-700 hover:border-amber-400/40 shadow-xs"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-250 hover:border-slate-350 shadow-xs",
        className
      )}
      title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 rotate-0" />
          {showLabel && (
            <span className="hidden sm:inline text-slate-200 font-medium">
              Dark
            </span>
          )}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 rotate-90" />
          {showLabel && (
            <span className="hidden sm:inline text-slate-700 font-medium">
              Bright
            </span>
          )}
        </>
      )}
    </button>
  );
}
