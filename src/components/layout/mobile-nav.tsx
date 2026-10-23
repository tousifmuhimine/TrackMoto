"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  BarChart3,
  CreditCard,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily", label: "Daily Sheet", icon: CalendarCheck2 },
  { href: "/monthly", label: "Monthly", icon: BarChart3 },
  { href: "/dues/customers", label: "Customer Dues", icon: CreditCard },
  { href: "/dues", label: "Due Ledger", icon: Scale },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-40 px-2 shadow-lg">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors",
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
