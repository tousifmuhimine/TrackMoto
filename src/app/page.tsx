"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  CalendarCheck2,
  BarChart3,
  Scale,
  Plus,
  ArrowRight,
  Clock,
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
  Legend,
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
      toast.error("ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে");
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
            <span>TrackMoto ওয়ার্কশপ ম্যানেজমেন্ট সিস্টেম</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            স্বাগতম! আজকের ওয়ার্কশপ কার্যক্রমের সারসংক্ষেপ
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            দৈনিক সার্ভিস ও বিক্রয় রেকর্ড করুন, ডায়নামিক খরচ সমন্বয় করুন, মাসিক প্রফিট মনিটর করুন এবং কাস্টমার ও সাপ্লায়ারের বাকি কিস্তি হিসাব রাখুন।
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>দৈনিক হিসাব শিট (Daily Sheet)</span>
            </Link>

            <Link
              href="/dues/customers"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs border border-slate-700 transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>কাস্টমার বাকি ও কিস্তি খাতা</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Income */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              আজকের মোট আয়
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(data?.today?.income || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            সার্ভিস + পার্টস + অয়েল + এক্সট্রা
          </div>
        </div>

        {/* Today's Expense */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              আজকের মোট খরচ
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(data?.today?.expense || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            দোকান ও মালামালের বিভিন্ন খরচ
          </div>
        </div>

        {/* Today's Net Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              আজকের নিট অবশিষ্ট
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                (data?.today?.net || 0) >= 0
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {(data?.today?.net || 0) >= 0 ? "লাভ" : "ঘাটতি"}
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold mt-2 ${
              (data?.today?.net || 0) >= 0
                ? "text-teal-600 dark:text-teal-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(data?.today?.net || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            আয় হতে খরচ বাদ দিয়ে
          </div>
        </div>

        {/* Customer Pending Dues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              কাস্টমার বাকি পাওনা
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(data?.dues?.total || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মোট {data?.dues?.count || 0} টি বাকি বাকি একাউন্ট
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>বিগত ৭ দিনের আয় বনাম ব্যয় ট্রেন্ড (Last 7 Days Trend)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              দৈনিক ইনকাম ও খরচের গ্রাফিক্যাল তুলনা
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
              <span>আয় (Income)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500"></span>
              <span>খরচ (Expense)</span>
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
                <Bar dataKey="income" name="আয় (Income)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="খরচ (Expense)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              ডাটা লোড হচ্ছে...
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
              <span>সাম্প্রতিক সার্ভিসসমূহ (Recent Services)</span>
            </h3>
            <Link
              href="/daily"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {!data?.recentServices || data.recentServices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                কোনো সার্ভিস রেকর্ড নেই।
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
              <span>সাম্প্রতিক খরচসমূহ (Recent Expenses)</span>
            </h3>
            <Link
              href="/daily"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {!data?.recentExpenses || data.recentExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                কোনো খরচ রেকর্ড নেই।
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
