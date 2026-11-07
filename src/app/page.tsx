"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  CalendarCheck2,
  BarChart3,
  ArrowRight,
  Wrench,
  Receipt,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span><strong className="text-white">Carbon</strong> <strong className="text-red-500 font-extrabold">8</strong> Workshop Management Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome! Today's Workshop Overview
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Record daily services and sales, deduct dynamic expenses, monitor monthly profit/loss, and track customer and supplier dues.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Open Daily Sheet</span>
            </Link>

            <Link
              href="/dues/customers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs border border-slate-700 transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Customer Due Ledger</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Cash in Hand (Physical Drawer) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cash in Hand
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              💵
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 truncate">
            {formatCurrency(data?.today?.cashInHand ?? ((data?.today?.income || 0) - (data?.today?.expense || 0)))}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Physical Drawer Balance
          </div>
        </div>

        {/* 2. Today's Total Cash Received */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Cash Inflows
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 truncate">
            {formatCurrency(data?.today?.totalCashReceived ?? data?.today?.income ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Cash ৳{data?.today?.physicalCashIn ?? 0} • Dig ৳{data?.today?.digitalIn ?? 0}
          </div>
        </div>

        {/* 3. Today's Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Today's Expenses
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 truncate">
            {formatCurrency(data?.today?.expense || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Daily cash outflows
          </div>
        </div>

        {/* 4. Customer Outstanding Dues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Outstanding Dues
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5 truncate">
            {formatCurrency(data?.dues?.total || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {data?.dues?.count || 0} customer accounts
          </div>
        </div>

        {/* 5. Today's Billed Work (Revenue) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Work Billed
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 truncate">
            {formatCurrency(data?.today?.revenue ?? data?.today?.income ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {data?.today?.serviceCount || 0} services / sales
          </div>
        </div>

        {/* 6. Today's Net Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Profit
            </span>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${
                (data?.today?.profit ?? data?.today?.net ?? 0) >= 0
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {(data?.today?.profit ?? data?.today?.net ?? 0) >= 0 ? "PROFIT" : "LOSS"}
            </span>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black mt-1.5 truncate ${
              (data?.today?.profit ?? data?.today?.net ?? 0) >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(data?.today?.profit ?? data?.today?.net ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Billed Work - Expenses
          </div>
        </div>
      </div>

      {/* Recovered Old Dues Notification Banner (if any collected today) */}
      {data?.todayOldDueCollections && data.todayOldDueCollections.length > 0 && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                Today's Recovered Dues: {formatCurrency(data.todayOldDueCollections.reduce((a: number, b: any) => a + b.amount, 0))}
              </span>
              <span className="text-slate-600 dark:text-slate-400 ml-2">
                (Collected across {data.todayOldDueCollections.length} customer debts. Added to Cash in Hand, separated from new service revenue).
              </span>
            </div>
          </div>
          <Link
            href="/daily"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View in Daily Sheet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 7-Day Revenue Trend Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Income vs Expenses Trend (Last 7 Days)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily income and expenses bar comparison
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              <span>Expense</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {data?.trend && data.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Loading trend data...
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Recent Services & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Services */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>Recent Services</span>
            </h3>
            <Link
              href="/daily"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {!data?.recentServices || data.recentServices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent services recorded.
              </p>
            ) : (
              data.recentServices.map((s: any) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                      {s.customer ? s.customer.name : "Walk-in"}
                    </span>
                    <span className="text-xs text-slate-400">
                      🏍️ {s.bike ? s.bike.model : "Bike"} • {formatDate(s.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(s.totalIncome)}
                    </span>
                    <span className="text-[11px] text-slate-400">{s.paymentStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Recent Expenses</span>
            </h3>
            <Link
              href="/daily"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {!data?.recentExpenses || data.recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent expenses recorded.
              </p>
            ) : (
              data.recentExpenses.map((e: any) => (
                <div key={e.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                      {e.description}
                    </span>
                    <span className="text-xs text-slate-400">
                      🏷️ {e.category} • {formatDate(e.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
