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
  Trash2,
  Pencil,
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
    transactionId: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  // Edit Due Modal State
  const [editingDue, setEditingDue] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    totalAmount: "",
    adjustment: "",
    adjustmentReason: "",
    dueDate: "",
    notes: "",
  });

  // Add Due Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    customerName: "",
    customerPhone: "",
    bikeModel: "",
    totalAmount: "",
    paidAmount: "",
    extraCharges: "",
    paymentMethod: "CASH",
    transactionId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  const handleOpenEditDue = (due: any) => {
    setEditingDue(due);
    setEditForm({
      totalAmount: due.totalAmount?.toString() || "0",
      adjustment: "",
      adjustmentReason: "",
      dueDate: due.dueDate ? new Date(due.dueDate).toISOString().split("T")[0] : "",
      notes: due.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDue) return;

    try {
      const res = await fetch(`/api/customer-dues/${editingDue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: Number(editForm.totalAmount),
          adjustment: editForm.adjustment ? Number(editForm.adjustment) : 0,
          adjustmentReason: editForm.adjustmentReason || null,
          dueDate: editForm.dueDate || null,
          notes: editForm.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update due record");
      }

      toast.success("Customer due updated successfully!");
      setIsEditModalOpen(false);
      setEditingDue(null);
      fetchDues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.customerName || !addForm.totalAmount) {
      toast.warning("Customer Name and Total Bill Amount are required");
      return;
    }

    try {
      const res = await fetch("/api/customer-dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: addForm.customerName,
          customerPhone: addForm.customerPhone || null,
          bikeModel: addForm.bikeModel || "Standard Bike",
          totalAmount: Number(addForm.totalAmount),
          paidAmount: Number(addForm.paidAmount || 0),
          extraCharges: Number(addForm.extraCharges || 0),
          paymentMethod: addForm.paymentMethod,
          transactionId: addForm.transactionId || null,
          date: addForm.date,
          dueDate: addForm.dueDate || null,
          notes: addForm.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create due record");
      }

      toast.success("Customer due record created!");
      setIsAddModalOpen(false);
      setAddForm({
        customerName: "",
        customerPhone: "",
        bikeModel: "",
        totalAmount: "",
        paidAmount: "",
        extraCharges: "",
        paymentMethod: "CASH",
        transactionId: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
        notes: "",
      });
      fetchDues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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
          transactionId: paymentForm.transactionId || null,
          date: paymentForm.date,
          note: paymentForm.note,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || "Failed to record installment");
      }

      toast.success("Installment payment recorded successfully!");
      setIsPaymentModalOpen(false);
      setPaymentForm({
        amount: "",
        method: "CASH",
        transactionId: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      fetchDues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteDue = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer due record?")) return;
    try {
      const res = await fetch(`/api/customer-dues/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Customer due record deleted");
        fetchDues();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete record");
      }
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
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

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, phone, or bike..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Due Entry</span>
          </button>
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

                  {/* Middle: Amount Overview (Total, Advance, Extra, and Je Tk Pai / Remaining) */}
                  {(() => {
                    const extraCharge = due.service?.extraCharges || 0;
                    const advancePaid =
                      due.installments?.find(
                        (i: any) =>
                          i.note?.toLowerCase().includes("upfront") ||
                          i.note?.toLowerCase().includes("advance") ||
                          i.note?.toLowerCase().includes("initial")
                      )?.amount ?? (due.service ? due.service.amountPaid : (due.installments?.[due.installments.length - 1]?.amount || 0));
                    const subsequentPaid = Math.max(0, due.paidAmount - advancePaid);

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800 py-3 lg:py-0 lg:px-6">
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
                            Advance Paid
                          </span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(advancePaid)}
                          </span>
                          {subsequentPaid > 0 && (
                            <span className="text-[10px] text-emerald-500 block">
                              +{formatCurrency(subsequentPaid)} inst.
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400 block">
                            Extra Charges
                          </span>
                          <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(extraCharge)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold uppercase text-rose-600 dark:text-rose-400 block">
                            Due (যে টাকা পাই)
                          </span>
                          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(due.remainingAmount)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!isCleared ? (
                      <button
                        onClick={() => {
                          setSelectedDue(due);
                          setPaymentForm({
                            amount: due.remainingAmount.toString(),
                            method: "CASH",
                            transactionId: "",
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
                    <button
                      onClick={() => handleOpenEditDue(due)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Edit due record"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDue(due.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete due record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {formatCurrency(inst.amount)}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  inst.method === "CASH"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : inst.method === "BKASH"
                                    ? "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300"
                                    : inst.method === "NAGAD"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                }`}
                              >
                                {inst.method}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              📅 {formatDate(inst.date)}
                            </span>
                            {inst.transactionId && (
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold block">
                                Trx: {inst.transactionId}
                              </span>
                            )}
                          </div>
                          {inst.note && (
                            <span className="text-[10px] text-slate-500 max-w-[120px] truncate text-right">
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
                  Payment Amount (BDT)
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

              {paymentForm.method !== "CASH" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {paymentForm.method === "BANK"
                      ? "Bank Reference / Cheque No"
                      : `${paymentForm.method} TrxID (Transaction ID)`}{" "}
                    <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      paymentForm.method === "BANK"
                        ? "e.g., BRAC-994821 or Cheque #1234"
                        : "e.g., 9K82JD01P"
                    }
                    value={paymentForm.transactionId}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, transactionId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              )}

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
      {/* Edit Customer Due Modal */}
      {isEditModalOpen && editingDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-emerald-600" />
                  <span>Edit Customer Due</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customer: {editingDue.customerName || editingDue.customer?.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDue} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Bill / Due Amount (BDT)
                </label>
                <input
                  type="number"
                  required
                  value={editForm.totalAmount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, totalAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Paid Amount: {formatCurrency(editingDue.paidAmount)} • Remaining:{" "}
                  {formatCurrency(Math.max(0, Number(editForm.totalAmount || 0) + Number(editForm.adjustment || 0) - editingDue.paidAmount))}
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-800 dark:text-amber-300">
                  ⚡ Add Extra Charge / Adjustment (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500 for extra parts, or -200 discount"
                  value={editForm.adjustment}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adjustment: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Reason for adjustment (e.g. Additional carburetor work)"
                  value={editForm.adjustmentReason}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adjustmentReason: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Promise Date
                </label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Additional notes about this due..."
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

      {/* New Customer Due Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Create New Customer Due Record</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Record an outstanding debt ledger entry with advance and extra charges.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDue} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahim Ahmed"
                    value={addForm.customerName}
                    onChange={(e) =>
                      setAddForm({ ...addForm, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (for auto-tracking)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 017xxxxxxxx"
                    value={addForm.customerPhone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bike Model / Plate
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yamaha FZS V3 (Dhaka Metro-Ha-11-2233)"
                  value={addForm.bikeModel}
                  onChange={(e) =>
                    setAddForm({ ...addForm, bikeModel: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Bill (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={addForm.totalAmount}
                    onChange={(e) =>
                      setAddForm({ ...addForm, totalAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Advance Paid (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={addForm.paidAmount}
                    onChange={(e) =>
                      setAddForm({ ...addForm, paidAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Extra Charges (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={addForm.extraCharges}
                    onChange={(e) =>
                      setAddForm({ ...addForm, extraCharges: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {Number(addForm.paidAmount || 0) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={addForm.paymentMethod}
                      onChange={(e) =>
                        setAddForm({ ...addForm, paymentMethod: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9K82JD01P"
                      value={addForm.transactionId}
                      onChange={(e) =>
                        setAddForm({ ...addForm, transactionId: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Entry Date
                  </label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) =>
                      setAddForm({ ...addForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Promise / Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={addForm.dueDate}
                    onChange={(e) =>
                      setAddForm({ ...addForm, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) =>
                    setAddForm({ ...addForm, notes: e.target.value })
                  }
                  placeholder="Details of services, parts, or terms agreed..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Due Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
