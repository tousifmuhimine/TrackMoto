"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Phone,
  Clock,
  History,
  Trash2,
  Pencil,
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

  // Edit Due Entry State
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    reason: "",
    totalAmount: "",
    dueDate: "",
    direction: "PAYABLE",
  });

  const handleOpenEditEntry = (item: any) => {
    setEditingEntry(item);
    setEditForm({
      reason: item.reason || "",
      totalAmount: item.totalAmount?.toString() || "0",
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : "",
      direction: item.direction || "PAYABLE",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const res = await fetch(`/api/due-entries/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: editForm.reason,
          totalAmount: Number(editForm.totalAmount),
          dueDate: editForm.dueDate || null,
          direction: editForm.direction,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update due entry");
      }

      toast.success("Due entry updated successfully!");
      setIsEditModalOpen(false);
      setEditingEntry(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/due-entries");
      const data = await res.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setPartySummary(Array.isArray(data.partySummary) ? data.partySummary : []);
    } catch (err: any) {
      toast.error("Failed to load records: " + err.message);
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

      toast.success("Due entry added successfully!");
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

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this due ledger entry?")) return;
    try {
      const res = await fetch(`/api/due-entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Due entry deleted");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete entry");
      }
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    try {
      const payAmount = Number(paymentForm.amount);
      if (!payAmount || payAmount <= 0) {
        toast.warning("Please provide a valid amount");
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

      toast.success("Payment recorded successfully!");
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
            <span>Bidirectional Due & Pay Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track money owed by the workshop to suppliers and money owed to the workshop by other parties with date-stamped logs.
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
          <span>Add Due Entry</span>
        </button>
      </div>

      {/* Hero Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              We Owe Them (Payable)
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
            Total unpaid liabilities to parts suppliers, landlords, and vendors
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              They Owe Us (Receivable)
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
            Total money to collect from external parties
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Net Ledger Position
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-extrabold ${
                totalReceivable >= totalPayable ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {totalReceivable >= totalPayable
                ? `Net Receivable: +${formatCurrency(totalReceivable - totalPayable)}`
                : `Net Payable: -${formatCurrency(totalPayable - totalReceivable)}`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Receivables minus Payables balance
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
          <span>1. We Owe (Payable / Suppliers)</span>
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
          <span>2. They Owe Us (Receivable)</span>
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
          <span>3. Party Net Summary (Both Sides)</span>
        </button>
      </div>

      {/* Tab Content: Payable or Receivable List */}
      {activeTab !== "SUMMARY" ? (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Loading entries...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No entries in this ledger. Click "+ Add Due Entry" to add one.
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
                          {item.party?.name || "Party"}
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
                          {isCleared ? "Cleared" : item.status === "PARTIAL" ? "Partial" : "Unpaid"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
                        Reason: {item.reason}
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
                          Date: {formatDate(item.createdAt)}
                        </span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                            <Clock className="w-3.5 h-3.5" />
                            Due By: {formatDate(item.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle amount */}
                    <div className="flex items-center gap-6 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800 py-3 lg:py-0 lg:px-6">
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                          Total Amount
                        </span>
                        <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
                          Paid
                        </span>
                        <span className="text-base font-bold text-emerald-600">
                          {formatCurrency(item.paidAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-rose-600 block">
                          Remaining Due
                        </span>
                        <span className="text-xl font-extrabold text-rose-600">
                          {formatCurrency(item.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Right action buttons */}
                    <div className="flex items-center gap-2">
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
                          <span>{isPayable ? "Record Payment Made" : "Record Payment Received"}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditEntry(item)}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        title="Edit due entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete due entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Payment history */}
                  {item.payments && item.payments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                        <History className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Payment History:</span>
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
                    <span>They Owe Us (Receivable):</span>
                    <span className="font-bold">{formatCurrency(ps.totalReceivable)}</span>
                  </div>

                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span>We Owe Them (Payable):</span>
                    <span className="font-bold">{formatCurrency(ps.totalPayable)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-extrabold text-base">
                    <span>Net Balance Position:</span>
                    <span
                      className={
                        ps.netBalance >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }
                    >
                      {ps.netBalance >= 0
                        ? `Receivable ${formatCurrency(ps.netBalance)}`
                        : `Payable ${formatCurrency(Math.abs(ps.netBalance))}`}
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
                <span>Add Due Record</span>
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
                  Direction
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
                    We Owe (Payable)
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
                    They Owe Us (Receivable)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Party Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rahman Auto Parts, Mechanic Jamal"
                  value={entryForm.partyName}
                  onChange={(e) => setEntryForm({ ...entryForm, partyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., +1 234 567 890"
                  value={entryForm.partyPhone}
                  onChange={(e) => setEntryForm({ ...entryForm, partyPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Spare parts purchase, workshop rent, service due"
                  value={entryForm.reason}
                  onChange={(e) => setEntryForm({ ...entryForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (BDT)
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
                    Paid / Received (BDT)
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
                  Due Date
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Entry
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
                  <span>Record Payment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Party: {selectedEntry.party?.name} (Remaining Due: {formatCurrency(selectedEntry.remainingAmount)})
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
                  Amount (BDT)
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
                  Payment Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Date
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
                  Remarks / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paid in cash"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Due Entry Modal */}
      {isEditModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-emerald-600" />
                  <span>Edit Due Entry</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Party: {editingEntry.party?.name} ({editingEntry.party?.type})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEntry} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Purpose
                </label>
                <input
                  type="text"
                  required
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Amount (BDT)
                </label>
                <input
                  type="number"
                  required
                  value={editForm.totalAmount}
                  onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Paid Amount: {formatCurrency(editingEntry.paidAmount)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Promise Date
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
