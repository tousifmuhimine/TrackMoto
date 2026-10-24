"use client";

import { useState } from "react";
import { Calendar, Database, LogOut } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function Header() {
  const [isSeeding, setIsSeeding] = useState(false);
  const today = new Date();

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sample Data Loaded Successfully!", {
          description: "Services, expenses, and dues have been populated.",
        });
        window.location.reload();
      } else {
        toast.error("Failed to seed demo data", {
          description: data.error || "Please check connection",
        });
      }
    } catch (e: any) {
      toast.error("Seeding failed: " + e.message);
    } finally {
      setIsSeeding(false);
    }
  };

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
        {/* Load Demo Data Button */}
        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
          title="Load sample workshop data for testing"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isSeeding ? "Loading..." : "Load Demo Data"}</span>
        </button>

        {/* Currency badge */}
        <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-md text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700">
          Currency: BDT
        </div>

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
