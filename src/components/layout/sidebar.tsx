"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  CalendarCheck2,
  BarChart3,
  CreditCard,
  Users2,
  Package,
  FileSpreadsheet,
  Settings,
  Scale,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Carbon8Logo, Carbon8BrandName } from "@/components/ui/carbon8-logo";

const navigation = [
  {
    name: "Dashboard",
    description: "Overview & Analytics",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Daily Sheet",
    description: "Daily Service & Expense",
    href: "/daily",
    icon: CalendarCheck2,
    badge: "Core",
  },
  {
    name: "Monthly Summary",
    description: "Income, Expense & Profit",
    href: "/monthly",
    icon: BarChart3,
    badge: "Core",
  },
  {
    name: "Customer Dues",
    description: "Due Tracking & Installments",
    href: "/dues/customers",
    icon: CreditCard,
    badge: "Core",
  },
  {
    name: "Due Ledger",
    description: "We Owe & They Owe",
    href: "/dues",
    icon: Scale,
    badge: "2-Way",
  },
  {
    name: "Customers",
    description: "Directory & History",
    href: "/customers",
    icon: Users2,
  },
  {
    name: "Inventory",
    description: "Spare Parts & Stock",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Invoices",
    description: "Printable Cash Memos",
    href: "/invoices",
    icon: FileSpreadsheet,
  },
  {
    name: "Settings",
    description: "Workshop Profile",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

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
    <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-100 border-r border-slate-800/80 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/60 bg-slate-950/40">
        <Carbon8Logo size="md" />
        <div>
          <div className="flex items-center gap-1.5">
            <Carbon8BrandName size="md" />
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-red-500/20 text-red-400 border border-red-500/30">
              Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Workshop Management</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              item.href !== "/dues" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {item.description}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded-full",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700/60"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Workshop Profile Card at bottom */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/30 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            🏍️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              <span className="text-white">Carbon </span><span className="text-red-500 font-bold">8</span> Workshop
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Secured & Online
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Workshop (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
