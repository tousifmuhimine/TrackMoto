"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Building2,
  Phone,
  Clock,
  History,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BidirectionalDuesPage() {
  const [activeTab, setActiveTab] = useState<"RECEIVABLE" | "PAYABLE" | "SUMMARY">("PAYABLE");
  const [entries, setEntries] = useState<any[]>([]);
  const [partySummary, setPartySummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // New Due Entry form
  const [entryForm, setEntryForm] = useState({
    partyName: "",
    partyPhone: "",
    partyType: "SUPPLIER",
    direction: "PAYABLE",
    reason: "",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CASH",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/due-entries");
      const data = await res.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setPartySummary(Array.isArray(data.partySummary) ? data.partySummary : []);
    } catch (err: any) {
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create Due Entry
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/due-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyName: entryForm.partyName,
          partyPhone: entryForm.partyPhone,
          partyType: entryForm.partyType,
          direction: entryForm.direction,
          reason: entryForm.reason,
          totalAmount: Number(entryForm.totalAmount),
          paidAmount: Number(entryForm.paidAmount || 0),
          dueDate: entryForm.dueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create entry");

      toast.success("নতুন বাকি/লেনদেন রেকর্ড সফলভাবে সংরক্ষিত হয়েছে!");
      setIsEntryModalOpen(false);
      setEntryForm({
        partyName: "",
        partyPhone: "",
        partyType: "SUPPLIER",
        direction: "PAYABLE",
        reason: "",
        totalAmount: "",
        paidAmount: "",
        dueDate: "",
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    try {
      const payAmount = Number(paymentForm.amount);
      if (!payAmount || payAmount <= 0) {
        toast.warning("সঠিক টাকার পরিমাণ দিন");
        return;
      }

      const res = await fetch(`/api/due-entries/${selectedEntry.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          method: paymentForm.method,
          date: paymentForm.date,
          note: paymentForm.note,
        }),
      });

      if (!res.ok) throw new Error("Failed to record payment");

      toast.success("পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে!");
      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: "",
        method: "CASH",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredEntries = entries.filter((e) => e.direction === activeTab);

  const totalReceivable = entries
    .filter((e) => e.direction === "RECEIVABLE" && e.status !== "CLEARED")
    .reduce((acc, e) => acc + e.remainingAmount, 0);

  const totalPayable = entries
    .filter((e) => e.direction === "PAYABLE" && e.status !== "CLEARED")
    .reduce((acc, e) => acc + e.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-emerald-600" />
            <span>দ্বিমুখী বাকি ও পাওনা খাতা (Bidirectional Due & Pay Ledger)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            আমার কাছে যারা টাকা পায় (সাপ্লায়ার বাকি) এবং আমরা যাদের কাছে টাকা পাই — উভয় হিসাব তারিখসহ ট্র্যাক করুন।
          </p>
        </div>

        <button
          onClick={() => {
            setEntryForm({ ...entryForm, direction: activeTab === "RECEIVABLE" ? "RECEIVABLE" : "PAYABLE" });
            setIsEntryModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন লেনদেন এন্ট্রি (+ Add Due)</span>
        </button>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              আমরা দেবো (We Owe Them / আমাদের দেনা)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalPayable)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            পার্টস সাপ্লায়ার, দোকান মালিক বা অন্যদের পাওনা
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              আমরা পাবো (They Owe Us / আমাদের পাওনা)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalReceivable)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            কাস্টমার ও সরবরাহকারীদের কাছে আমাদের পাওনা
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            নিট ব্যালেন্স অবস্থা (Overall Position)
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-extrabold ${
                totalReceivable >= totalPayable ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {totalReceivable >= totalPayable
                ? `পাওনা বেশি: +${formatCurrency(totalReceivable - totalPayable)}`
                : `দেনা বেশি: -${formatCurrency(totalPayable - totalReceivable)}`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            উভয় দিকের সমন্বিত নিট পার্থক্য
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab("PAYABLE")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "PAYABLE"
              ? "border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>১. আমাদের দেনা (আমরা দেবো / We Owe)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 font-semibold">
            {entries.filter((e) => e.direction === "PAYABLE").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("RECEIVABLE")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "RECEIVABLE"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/20"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>২. আমাদের পাওনা (আমরা পাবো / They Owe Us)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-semibold">
            {entries.filter((e) => e.direction === "RECEIVABLE").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("SUMMARY")}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SUMMARY"
              ? "border-slate-900 dark:border-white text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/40"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>৩. একই পার্টির দ্বিমুখী নিট ব্যালেন্স (Party Net Summary)</span>
        </button>
      </div>

      {/* Tab Content: Payable or Receivable List */}
      {activeTab !== "SUMMARY" ? (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              লোড হচ্ছে...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              এই বিভাগে কোনো এন্ট্রি নেই। "+ নতুন লেনদেন এন্ট্রি" এ ক্লিক করে যোগ করুন।
            </div>
          ) : (
            filteredEntries.map((item) => {
              const isCleared = item.status === "CLEARED";
              const isPayable = item.direction === "PAYABLE";

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left details */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {item.party?.name || "পার্টি"}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.party?.type}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isCleared
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : item.status === "PARTIAL"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {isCleared ? "পরিশোধিত" : item.status === "PARTIAL" ? "আংশিক" : "বাকি"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                        কারণ: {item.reason}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {item.party?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {item.party.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          তারিখ: {formatDate(item.createdAt)}
                        </span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                            <Clock className="w-3.5 h-3.5" />
                            পরিশোধের মেয়াদ: {formatDate(item.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle amount */}
                    <div className="flex items-center gap-6 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800 py-3 lg:py-0 lg:px-6">
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                          মোট হিসাব
                        </span>
                        <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
                          পরিশোধ হয়েছে
                        </span>
                        <span className="text-base font-bold text-emerald-600">
                          {formatCurrency(item.paidAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-rose-600 block">
                          অবশিষ্ট বাকি
                        </span>
                        <span className="text-xl font-extrabold text-rose-600">
                          {formatCurrency(item.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Right button */}
                    <div>
                      {!isCleared && (
                        <button
                          onClick={() => {
                            setSelectedEntry(item);
                            setPaymentForm({
                              amount: item.remainingAmount.toString(),
                              method: "CASH",
                              date: new Date().toISOString().split("T")[0],
                              note: "",
                            });
                            setIsPaymentModalOpen(true);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-xs transition-colors ${
                            isPayable
                              ? "bg-rose-600 hover:bg-rose-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isPayable ? "টাকা প্রদান করুন (Pay)" : "টাকা গ্রহণ করুন (Receive)"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment history */}
                  {item.payments && item.payments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                        <History className="w-3.5 h-3.5 text-emerald-600" />
                        <span>পেমেন্ট পরিশোধের ইতিহাস (Payment Log):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {item.payments.map((p: any) => (
                          <div
                            key={p.id}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                                {formatCurrency(p.amount)} ({p.method})
                              </span>
                              <span className="text-[11px] text-slate-400">
                                📅 {formatDate(p.date)}
                              </span>
                            </div>
                            {p.note && (
                              <span className="text-[10px] text-slate-500 max-w-[120px] truncate">
                                {p.note}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Tab 3: Summary of Bidirectional Parties */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {partySummary.map((ps) => {
            const hasReceivable = ps.totalReceivable > 0;
            const hasPayable = ps.totalPayable > 0;

            return (
              <div
                key={ps.party.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {ps.party.name}
                    </h3>
                    <p className="text-xs text-slate-400">{ps.party.type} • {ps.party.phone || "No phone"}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>আমরা পাবো (Receivable):</span>
                    <span className="font-bold">{formatCurrency(ps.totalReceivable)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span>আমরা দেবো (Payable):</span>
                    <span className="font-bold">{formatCurrency(ps.totalPayable)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-extrabold text-base">
                    <span>সমন্বিত নিট (Net Balance):</span>
                    <span
                      className={
                        ps.netBalance >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }
                    >
                      {ps.netBalance >= 0
                        ? `পাবো ${formatCurrency(ps.netBalance)}`
                        : `দেবো ${formatCurrency(Math.abs(ps.netBalance))}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Due Entry */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>নতুন বাকি লেনদেন রেকর্ড</span>
              </h3>
              <button
                onClick={() => setIsEntryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  লেনদেনের ধরন (Direction)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryForm({ ...entryForm, direction: "PAYABLE" })}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors ${
                      entryForm.direction === "PAYABLE"
                        ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        : "border-slate-300 dark:border-slate-700 text-slate-600"
                    }`}
                  >
                    আমরা দেবো (We Owe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryForm({ ...entryForm, direction: "RECEIVABLE" })}
                    className={`py-2 text-xs font-bold rounded-xl border text-center transition-colors ${
                      entryForm.direction === "RECEIVABLE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "border-slate-300 dark:border-slate-700 text-slate-600"
                    }`}
                  >
                    আমরা পাবো (They Owe)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পার্টি / কোম্পানির নাম (Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., রহমান অটো পার্টস / মেকানিক জামাল"
                  value={entryForm.partyName}
                  onChange={(e) => setEntryForm({ ...entryForm, partyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর (Phone)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 01711223344"
                  value={entryForm.partyPhone}
                  onChange={(e) => setEntryForm({ ...entryForm, partyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  কারণ / বিবরণ (Reason)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., স্পেয়ার পার্টস ক্রয় বা ইঞ্জিন সার্ভিস বাকি"
                  value={entryForm.reason}
                  onChange={(e) => setEntryForm({ ...entryForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোট টাকার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={entryForm.totalAmount}
                    onChange={(e) => setEntryForm({ ...entryForm, totalAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কত টাকা দিয়েছেন/পেয়েছেন? (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={entryForm.paidAmount}
                    onChange={(e) => setEntryForm({ ...entryForm, paidAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরিশোধের মেয়াদ তারিখ (Due Date)
                </label>
                <input
                  type="date"
                  value={entryForm.dueDate}
                  onChange={(e) => setEntryForm({ ...entryForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment on Due */}
      {isPaymentModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>পেমেন্ট প্রদান/গ্রহণ এন্ট্রি</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  পার্টি: {selectedEntry.party?.name} (অবশিষ্ট বাকি: {formatCurrency(selectedEntry.remainingAmount)})
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  টাকার পরিমাণ (Amount ৳)
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="CASH">ক্যাশ (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                  <option value="BANK">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  তারিখ (Date)
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নোট (Optional Note)
                </label>
                <input
                  type="text"
                  placeholder="e.g., নগদ ক্যাশ পরিশোধ করা হলো"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
