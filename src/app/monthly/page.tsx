"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
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
      toast.error("Failed to load monthly summary: " + err.message);
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
      "Service Charges (BDT)": m.serviceChargeTotal,
      "Spare Parts (BDT)": m.sparePartsTotal,
      "Engine Oil (BDT)": m.engineOilTotal,
      "Extra Charges (BDT)": m.extraTotal,
      "Total Income (BDT)": m.totalIncome,
      "Total Expense (BDT)": m.totalExpense,
      "Net Profit/Loss (BDT)": m.netTotal,
      Status: m.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Monthly_Report_${year}`);
    XLSX.writeFile(workbook, `TrackMoto_Monthly_Report_${year}.xlsx`);
    toast.success("Excel report exported successfully!");
  };

  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Monthly Summary & Profit Report</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of monthly gross income, total expenses, and resulting net profit or loss.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">
            <span>Year:</span>
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
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Year Total Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {year} Total Gross Income
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
            Total sales and service income across 12 months
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              {year} Total Expenses
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
            Total rent, stock, utility, and miscellaneous expenses
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent border border-teal-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Annual Net Profit / Balance
            </span>
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-300">
              {data?.yearlyNet >= 0 ? "PROFIT" : "LOSS"}
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
            Gross Income minus Total Expenses
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Month by Month Breakdown ({year})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed tracking of how much income was earned, expenses incurred, and in total remaining net value.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-center">Services</th>
                <th className="py-3 px-4 text-right">Service Fee (BDT)</th>
                <th className="py-3 px-4 text-right">Parts (BDT)</th>
                <th className="py-3 px-4 text-right">Oil (BDT)</th>
                <th className="py-3 px-4 text-right">Extra (BDT)</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Total Income
                </th>
                <th className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                  Total Expense
                </th>
                <th className="py-3 px-4 text-right font-bold">Net Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading data...
                  </td>
                </tr>
              ) : !data || !data.months ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No records found for this year.
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
                              Current Month
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {m.serviceCount}
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
                          m.netTotal > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : m.netTotal < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {formatCurrency(m.netTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            m.status === "PROFIT"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : m.status === "LOSS"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                              : m.status === "BREAK-EVEN"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {m.status}
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
