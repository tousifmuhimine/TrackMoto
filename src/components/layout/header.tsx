"use client";

import { Calendar, LogOut } from "lucide-react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const today = new Date();

  const handleLogout = async () => {
    if (!confirm("Lock workshop and log out?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{format(today, "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Currency badge */}
        <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700">
          Currency: BDT
        </div>

        {/* Theme Toggle (Dark & Bright Mode) */}
        <ThemeToggle />

        {/* Lock / Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-250 dark:border-slate-700 transition-colors"
          title="Lock Workshop"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
}
