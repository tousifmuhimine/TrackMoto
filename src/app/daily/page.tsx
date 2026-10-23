"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wrench,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function DailySheetPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New service form state
  const [serviceForm, setServiceForm] = useState({
    customerName: "",
    customerPhone: "",
    bikeModel: "",
    bikeReg: "",
    serviceCharge: "",
    sparePartsCost: "",
    engineOilCost: "",
    extraCharges: "",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    amountPaid: "",
    dueDate: "",
    notes: "",
  });

  // New dynamic expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "MISC",
  });

  const formattedDateParam = format(selectedDate, "yyyy-MM-dd");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resServices, resExpenses] = await Promise.all([
        fetch(`/api/services?date=${formattedDateParam}`),
        fetch(`/api/expenses?date=${formattedDateParam}`),
      ]);

      const dataServices = await resServices.json();
      const dataExpenses = await resExpenses.json();

      setServices(Array.isArray(dataServices) ? dataServices : []);
      setExpenses(Array.isArray(dataExpenses) ? dataExpenses : []);
    } catch (err: any) {
      toast.error("Failed to load records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formattedDateParam]);

  // Calculations
  const totalServiceCharge = services.reduce((acc, s) => acc + (s.serviceCharge || 0), 0);
  const totalSpareParts = services.reduce((acc, s) => acc + (s.sparePartsCost || 0), 0);
  const totalEngineOil = services.reduce((acc, s) => acc + (s.engineOilCost || 0), 0);
  const totalExtra = services.reduce((acc, s) => acc + (s.extraCharges || 0), 0);
  const totalIncome = services.reduce((acc, s) => acc + (s.totalIncome || 0), 0);

  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netTotal = totalIncome - totalExpense;

  // Handle Create Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalCost =
        Number(serviceForm.serviceCharge || 0) +
        Number(serviceForm.sparePartsCost || 0) +
        Number(serviceForm.engineOilCost || 0) +
        Number(serviceForm.extraCharges || 0);

      const paid =
        serviceForm.paymentStatus === "PAID"
          ? totalCost
          : Number(serviceForm.amountPaid || 0);

      const payload = {
        date: selectedDate.toISOString(),
        customerName: serviceForm.customerName || "Walk-in Customer",
        customerPhone: serviceForm.customerPhone || "",
        bikeModel: serviceForm.bikeModel || "Bike",
        bikeReg: serviceForm.bikeReg,
        serviceCharge: Number(serviceForm.serviceCharge || 0),
        sparePartsCost: Number(serviceForm.sparePartsCost || 0),
        engineOilCost: Number(serviceForm.engineOilCost || 0),
        extraCharges: Number(serviceForm.extraCharges || 0),
        paymentStatus: serviceForm.paymentStatus,
        paymentMethod: serviceForm.paymentMethod,
        amountPaid: paid,
        dueDate: serviceForm.dueDate || null,
        notes: serviceForm.notes,
      };

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save service");

      toast.success("Service record added successfully!");
      setIsServiceModalOpen(false);
      setServiceForm({
        customerName: "",
        customerPhone: "",
        bikeModel: "",
        bikeReg: "",
        serviceCharge: "",
        sparePartsCost: "",
        engineOilCost: "",
        extraCharges: "",
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        amountPaid: "",
        dueDate: "",
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Create Dynamic Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!expenseForm.description || !expenseForm.amount) {
        toast.warning("Please provide description and amount");
        return;
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
          category: expenseForm.category,
        }),
      });

      if (!res.ok) throw new Error("Failed to save expense");

      toast.success("Expense added successfully!");
      setIsExpenseModalOpen(false);
      setExpenseForm({ description: "", amount: "", category: "MISC" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service record?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Service record deleted");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Expense record deleted");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>📅 Daily Service & Expense Sheet</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily services, spare parts, engine oil, and dynamic expenses in one place.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 py-1 text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>{format(selectedDate, "dd MMM yyyy")}</span>
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date())}
            className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Hero Summary Cards (Income - Expense = Net Total) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Daily Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2">
            <span>Service: {formatCurrency(totalServiceCharge)}</span> •
            <span>Parts: {formatCurrency(totalSpareParts)}</span> •
            <span>Oil: {formatCurrency(totalEngineOil)}</span> •
            <span>Extra: {formatCurrency(totalExtra)}</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Total Daily Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs text-slate-500 dark:text-slate-400">
            {expenses.length} dynamic expense entries recorded today
          </div>
        </div>

        {/* Net Daily Balance Card */}
        <div
          className={`border rounded-2xl p-5 shadow-sm ${
            netTotal > 0
              ? "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30"
              : netTotal < 0
              ? "bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/30"
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Today's Net Profit / Balance
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                netTotal > 0
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : netTotal < 0
                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                  : totalIncome > 0 || totalExpense > 0
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {netTotal > 0
                ? "PROFIT"
                : netTotal < 0
                ? "LOSS"
                : totalIncome > 0 || totalExpense > 0
                ? "BREAK-EVEN"
                : "NO ACTIVITY"}
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-3xl font-extrabold ${
                netTotal > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : netTotal < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {formatCurrency(netTotal)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Income {formatCurrency(totalIncome)} - Expenses {formatCurrency(totalExpense)}
          </div>
        </div>
      </div>

      {/* SECTION 1: Income / Service List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span>Services & Sales Entries</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                {services.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Service + Spare Parts + Engine Oil + Extra = Total Bill
            </p>
          </div>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Customer & Bike</th>
                <th className="py-3 px-4 text-right">Service</th>
                <th className="py-3 px-4 text-right">Parts</th>
                <th className="py-3 px-4 text-right">Engine Oil</th>
                <th className="py-3 px-4 text-right">Extra</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Total Income
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No services recorded for this date. Click "+ Add New Service" to record one.
                  </td>
                </tr>
              ) : (
                services.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {item.customer ? item.customer.name : "Walk-in"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span>🏍️ {item.bike ? item.bike.model : "Bike"}</span>
                        {item.customer?.phone && <span>• 📞 {item.customer.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.serviceCharge)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.sparePartsCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.engineOilCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(item.extraCharges)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.totalIncome)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.paymentStatus === "PAID"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : item.paymentStatus === "PARTIAL"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {item.paymentStatus === "PAID"
                          ? "Paid"
                          : item.paymentStatus === "PARTIAL"
                          ? "Partial Due"
                          : "Full Due"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteService(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {services.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                  <td colSpan={2} className="py-3 px-4">
                    Daily Totals:
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(totalServiceCharge)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(totalSpareParts)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(totalEngineOil)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(totalExtra)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base">
                    {formatCurrency(totalIncome)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* SECTION 2: Dynamic Expenses List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              <span>Dynamic Daily Expenses</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                {expenses.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record any workshop expense with customized description (Rent, Electricity, Supplies, Snacks, etc.)
            </p>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                  Amount
                </th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No expenses recorded for this date.
                  </td>
                </tr>
              ) : (
                expenses.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {expenses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                  <td colSpan={3} className="py-3 px-4">
                    Total Expenses:
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 text-base">
                    {formatCurrency(totalExpense)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Service */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <span>New Service & Sales Entry</span>
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="mt-4 space-y-4">
              {/* Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., John Doe"
                    value={serviceForm.customerName}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., +1 234 567 890"
                    value={serviceForm.customerPhone}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Bike Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bike Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pulsar 150 / Yamaha FZS"
                    value={serviceForm.bikeModel}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, bikeModel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., REG-1234"
                    value={serviceForm.bikeReg}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, bikeReg: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* 4 Core Income Fields */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Income Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Service Charge (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={serviceForm.serviceCharge}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, serviceCharge: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Spare Parts (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={serviceForm.sparePartsCost}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, sparePartsCost: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Engine Oil (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={serviceForm.engineOilCost}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, engineOilCost: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Extra Charge (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={serviceForm.extraCharges}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, extraCharges: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="text-right pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200">
                  Total Bill:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    {formatCurrency(
                      Number(serviceForm.serviceCharge || 0) +
                        Number(serviceForm.sparePartsCost || 0) +
                        Number(serviceForm.engineOilCost || 0) +
                        Number(serviceForm.extraCharges || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Status & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={serviceForm.paymentStatus}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, paymentStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PAID">Full Paid</option>
                    <option value="PARTIAL">Partial Due</option>
                    <option value="DUE">Full Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={serviceForm.paymentMethod}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="DUE">Due</option>
                  </select>
                </div>

                {serviceForm.paymentStatus === "PARTIAL" && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      Upfront Paid Amount (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="Amount paid"
                      value={serviceForm.amountPaid}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, amountPaid: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Notes / Work Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Engine tuning and brake shoe replacement"
                  value={serviceForm.notes}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Dynamic Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <span>Add Daily Expense</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shop Rent, Engine Oil Stock, Electricity"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (BDT)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 500"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Category
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MISC">Miscellaneous / Snacks</option>
                  <option value="PURCHASE">Parts & Stock Purchase</option>
                  <option value="RENT">Shop Rent</option>
                  <option value="UTILITIES">Electricity & Utilities</option>
                  <option value="SALARY">Mechanic Wages / Salary</option>
                  <option value="TRANSPORT">Transport & Delivery</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
