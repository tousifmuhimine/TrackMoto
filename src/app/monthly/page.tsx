"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function MonthlySummaryPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/monthly?year=${year}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error("মাসিক রিপোর্ট লোড করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport();
  }, [year]);

  // Export to Excel
  const exportToExcel = () => {
    if (!data || !data.months) return;

    const rows = data.months.map((m: any) => ({
      Month: m.monthName,
      Year: m.year,
      "Total Services": m.serviceCount,
      "Service Charges (৳)": m.serviceChargeTotal,
      "Spare Parts (৳)": m.sparePartsTotal,
      "Engine Oil (৳)": m.engineOilTotal,
      "Extra Charges (৳)": m.extraTotal,
      "Total Income (৳)": m.totalIncome,
      "Total Expense (৳)": m.totalExpense,
      "Net Profit/Loss (৳)": m.netTotal,
      Status: m.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Monthly_Report_${year}`);
    XLSX.writeFile(workbook, `TrackMoto_Monthly_Report_${year}.xlsx`);
    toast.success("Excel ফাইল সফলভাবে ডাউনলোড হয়েছে!");
  };

  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>মাসিক হিসাব ও প্রফিট রিপোর্ট (Monthly Summary)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            প্রতি মাসের মোট আয়, মোট ব্যয় এবং অবশিষ্ট নিট লাভ/ক্ষতির পূর্ণাঙ্গ চিত্র।
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">
            <span>বছর:</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold focus:outline-hidden"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>এক্সেল এক্সপোর্ট (Excel)</span>
          </button>
        </div>
      </div>

      {/* Year Total Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {year} সালের মোট আয় (Gross Income)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(data?.yearlyIncome || 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            ১২ মাসের মোট সার্ভিস ও সেলস যোগফল
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {year} সালের মোট খরচ (Total Expenses)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(data?.yearlyExpense || 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            ১২ মাসের দোকান ভাড়া, মালামাল ও সাধারণ খরচ
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent border border-teal-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              বাৎসরিক নিট লাভ/অবশিষ্ট (Yearly Net)
            </span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300">
              {data?.yearlyNet >= 0 ? "লাভ (Profit)" : "ঘাটতি (Loss)"}
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-3xl font-extrabold ${
                data?.yearlyNet >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600"
              }`}
            >
              {formatCurrency(data?.yearlyNet || 0)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            বাৎসরিক মোট লাভ = মোট আয় - মোট খরচ
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>প্রতি মাসের বিস্তারিত হিসাব তালিকা ({year})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              মাস অনুযায়ী কত ইনকাম ও এক্সপেন্স হয়েছে এবং ইন টোটালে কত অবশিষ্ট থাকে
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">মাস (Month)</th>
                <th className="py-3 px-4 text-center">সার্ভিস সংখ্যা</th>
                <th className="py-3 px-4 text-right">সার্ভিস বিল (৳)</th>
                <th className="py-3 px-4 text-right">পার্টস (৳)</th>
                <th className="py-3 px-4 text-right">অয়েল (৳)</th>
                <th className="py-3 px-4 text-right">এক্সট্রা (৳)</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  মোট আয় (Income)
                </th>
                <th className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                  মোট খরচ (Expense)
                </th>
                <th className="py-3 px-4 text-right font-bold">নিট অবশিষ্ট (Net)</th>
                <th className="py-3 px-4 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : !data || !data.months ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    কোনো ডাটা পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                data.months.map((m: any, idx: number) => {
                  const isCurrent = idx === currentMonthIdx && year === new Date().getFullYear();

                  return (
                    <tr
                      key={m.monthIndex}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-medium" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{m.monthName}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded-full font-semibold">
                              চলতি মাস
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {m.serviceCount} টি
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(m.serviceChargeTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(m.sparePartsTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(m.engineOilTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(m.extraTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(m.totalIncome)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(m.totalExpense)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold ${
                          m.netTotal >= 0
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(m.netTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            m.netTotal >= 0
                              ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {m.netTotal >= 0 ? "লাভ" : "ঘাটতি"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
