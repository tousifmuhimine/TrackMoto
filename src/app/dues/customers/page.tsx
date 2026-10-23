"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  History,
  Phone,
  Bike as BikeIcon,
  Search,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomerDuesPage() {
  const [dues, setDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment Modal State
  const [selectedDue, setSelectedDue] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CASH",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer-dues?status=${filterStatus}`);
      const data = await res.json();
      setDues(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error("Failed to load dues: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
  }, [filterStatus]);

  // Record Installment Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDue) return;

    try {
      const payAmount = Number(paymentForm.amount);
      if (!payAmount || payAmount <= 0) {
        toast.warning("Please enter a valid payment amount");
        return;
      }

      if (payAmount > selectedDue.remainingAmount) {
        if (!confirm(`Remaining due is ${formatCurrency(selectedDue.remainingAmount)}. You entered ${formatCurrency(payAmount)}. Continue?`)) {
          return;
        }
      }

      const res = await fetch(`/api/customer-dues/${selectedDue.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          method: paymentForm.method,
          date: paymentForm.date,
          note: paymentForm.note,
        }),
      });

      if (!res.ok) throw new Error("Failed to record installment");

      toast.success("Installment payment recorded successfully!");
      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: "",
        method: "CASH",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      fetchDues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filtered list
  const filteredDues = dues.filter((d) => {
    const name = (d.customerName || d.customer?.name || "").toLowerCase();
    const phone = (d.customer?.phone || "").toLowerCase();
    const bike = (d.bikeName || d.bike?.model || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || phone.includes(q) || bike.includes(q);
  });

  const totalOutstanding = dues
    .filter((d) => d.status !== "CLEARED")
    .reduce((acc, d) => acc + d.remainingAmount, 0);

  const totalCollected = dues.reduce((acc, d) => acc + d.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Customer Dues & Installment Ledger</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track money customers owe to the workshop, linked to their original bike service, with date-wise installment payments.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, phone, or bike..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Total Outstanding Dues
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Currently {dues.filter((d) => d.status !== "CLEARED").length} active customer accounts with dues
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Total Collected in Installments
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Total received across upfront and subsequent installment payments
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filter Status
          </div>
          <div className="flex gap-2 mt-3">
            {["ALL", "UNPAID", "PARTIAL", "CLEARED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status === "UNPAID"
                  ? "Unpaid"
                  : status === "PARTIAL"
                  ? "Partial"
                  : "Cleared"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Due List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Loading dues...
          </div>
        ) : filteredDues.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No customer dues matching the current filter.
          </div>
        ) : (
          filteredDues.map((due) => {
            const customerName = due.customerName || due.customer?.name || "Customer";
            const bikeModel = due.bikeName || due.bike?.model || "Bike";
            const isCleared = due.status === "CLEARED";
            const isOverdue =
              due.dueDate && new Date(due.dueDate) < new Date() && !isCleared;

            return (
              <div
                key={due.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
                  isCleared
                    ? "border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/20"
                    : isOverdue
                    ? "border-rose-400 dark:border-rose-900/60 bg-rose-50/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Customer & Bike details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {customerName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isCleared
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : due.status === "PARTIAL"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        {isCleared
                          ? "✓ Cleared"
                          : due.status === "PARTIAL"
                          ? "Partial Due"
                          : "Full Due"}
                      </span>

                      {isOverdue && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <BikeIcon className="w-4 h-4 text-emerald-600" />
                        {bikeModel}
                      </span>
                      {due.customer?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {due.customer.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Entry Date: {formatDate(due.date)}
                      </span>
                      {due.dueDate && (
                        <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <Clock className="w-3.5 h-3.5" />
                          Due By: {formatDate(due.dueDate)}
                        </span>
                      )}
                      {due.serviceId && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          🔗 Service Ref: #{due.serviceId.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Amount Overview */}
                  <div className="flex items-center gap-6 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800 py-3 lg:py-0 lg:px-6">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                        Total Bill
                      </span>
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(due.totalAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
                        Total Paid
                      </span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(due.paidAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400 block">
                        Remaining Due
                      </span>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(due.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div>
                    {!isCleared ? (
                      <button
                        onClick={() => {
                          setSelectedDue(due);
                          setPaymentForm({
                            amount: due.remainingAmount.toString(),
                            method: "CASH",
                            date: new Date().toISOString().split("T")[0],
                            note: "",
                          });
                          setIsPaymentModalOpen(true);
                        }}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Record Installment</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Cleared</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Installments History Log */}
                {due.installments && due.installments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                      <History className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Installment Payment Log ({due.installments.length} payments):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {due.installments.map((inst: any) => (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {formatCurrency(inst.amount)} ({inst.method})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              📅 {formatDate(inst.date)}
                            </span>
                          </div>
                          {inst.note && (
                            <span className="text-[10px] text-slate-500 max-w-[120px] truncate">
                              {inst.note}
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

      {/* Record Payment / Installment Modal */}
      {isPaymentModalOpen && selectedDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Record Customer Installment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customer: {selectedDue.customerName || selectedDue.customer?.name} (Remaining Due:{" "}
                  {formatCurrency(selectedDue.remainingAmount)})
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, method: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="BANK">Bank Transfer</option>
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
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Partial installment paid"
                  value={paymentForm.note}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, note: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
    </div>
  );
}
