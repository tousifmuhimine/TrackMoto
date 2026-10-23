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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    nameBn: "ড্যাশবোর্ড",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Daily Sheet",
    nameBn: "দৈনিক হিসাব",
    href: "/daily",
    icon: CalendarCheck2,
    badge: "Core",
  },
  {
    name: "Monthly Summary",
    nameBn: "মাসিক হিসাব",
    href: "/monthly",
    icon: BarChart3,
    badge: "Core",
  },
  {
    name: "Customer Dues",
    nameBn: "কাস্টমার বাকি",
    href: "/dues/customers",
    icon: CreditCard,
    badge: "Core",
  },
  {
    name: "All Dues (বাকি-পাওনা)",
    nameBn: "লেনদেন হিসাব",
    href: "/dues",
    icon: Scale,
    badge: "2-Way",
  },
  {
    name: "Customers",
    nameBn: "গ্রাহক তালিকা",
    href: "/customers",
    icon: Users2,
  },
  {
    name: "Inventory",
    nameBn: "স্পেয়ার পার্টস স্টক",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Invoices",
    nameBn: "রসিদ ও বিল",
    href: "/invoices",
    icon: FileSpreadsheet,
  },
  {
    name: "Settings",
    nameBn: "সেটিংস",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-100 border-r border-slate-800/80 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              TrackMoto
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">বাইক ওয়ার্কশপ ম্যানেজার</p>
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
            (item.href !== "/" && pathname.startsWith(item.href));
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
                    {item.nameBn}
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
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/30">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            🏍️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              মেসার্স বাইক সার্ভিস সেন্টার
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online / Neon Connected
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
