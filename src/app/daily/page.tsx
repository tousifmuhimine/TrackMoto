"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wrench,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
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
      toast.error("ডাটা লোড করতে সমস্যা হয়েছে: " + err.message);
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

      toast.success("নতুন সার্ভিস এন্ট্রি সফল হয়েছে!");
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
        toast.warning("বিবরণ ও টাকার পরিমাণ দিন");
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

      toast.success("খরচ সফলভাবে যোগ হয়েছে!");
      setIsExpenseModalOpen(false);
      setExpenseForm({ description: "", amount: "", category: "MISC" });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Delete Service
  const handleDeleteService = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই সার্ভিস রেকর্ডটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("সার্ভিস মুছে ফেলা হয়েছে");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই খরচ রেকর্ডটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("খরচ মুছে ফেলা হয়েছে");
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
            <span>📅 দৈনিক হিসাব শিট (Daily Service Sheet)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            প্রতিদিনের সার্ভিস, স্পেয়ার পার্টস, ইঞ্জিন অয়েল ও ডায়নামিক খরচের হিসাব।
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="আগের দিন"
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
            title="পরের দিন"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date())}
            className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            আজ (Today)
          </button>
        </div>
      </div>

      {/* Hero Summary Cards (Income - Expense = Net Total) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              মোট দৈনিক আয় (Total Income)
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
            <span>সার্ভিস: {formatCurrency(totalServiceCharge)}</span> •
            <span>পার্টস: {formatCurrency(totalSpareParts)}</span> •
            <span>অয়েল: {formatCurrency(totalEngineOil)}</span> •
            <span>এক্সট্রা: {formatCurrency(totalExtra)}</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              মোট দৈনিক খরচ (Total Expense)
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
            {expenses.length} টি আলাদা খরচ এন্ট্রি রেকর্ড করা হয়েছে
          </div>
        </div>

        {/* Net Daily Balance Card */}
        <div
          className={`border rounded-2xl p-5 shadow-sm ${
            netTotal >= 0
              ? "bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent border-teal-500/30"
              : "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              আজকের নিট অবশিষ্ট (Net Total)
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                netTotal >= 0
                  ? "bg-teal-500/20 text-teal-700 dark:text-teal-300"
                  : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
              }`}
            >
              {netTotal >= 0 ? "লাভ (PROFIT)" : "ঘাটতি (LOSS)"}
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`text-3xl font-extrabold ${
                netTotal >= 0
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatCurrency(netTotal)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            মোট আয় {formatCurrency(totalIncome)} - খরচ {formatCurrency(totalExpense)}
          </div>
        </div>
      </div>

      {/* SECTION 1: Income / Service List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span>সার্ভিস ও বিক্রয় হিসাব (Services & Sales)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                {services.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Service + Spare Parts + Engine Oil + Extra যোগ হয়ে মোট বিল হয়
            </p>
          </div>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সার্ভিস যোগ করুন (+ New Service)</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">গ্রাহক ও বাইক</th>
                <th className="py-3 px-4 text-right">সার্ভিস (Service)</th>
                <th className="py-3 px-4 text-right">পার্টস (Parts)</th>
                <th className="py-3 px-4 text-right">ইঞ্জিন অয়েল (Oil)</th>
                <th className="py-3 px-4 text-right">এক্সট্রা (Extra)</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  মোট আয় (Total)
                </th>
                <th className="py-3 px-4 text-center">অবস্থা</th>
                <th className="py-3 px-4 text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    আজকের জন্য কোনো সার্ভিস রেকর্ড যোগ করা হয়নি। "+ নতুন সার্ভিস যোগ করুন" এ ক্লিক করুন।
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
                          ? "পরিশোধিত"
                          : item.paymentStatus === "PARTIAL"
                          ? "আংশিক বাকি"
                          : "বাকি (Due)"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteService(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete"
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
                    মোট যোগফল (Daily Totals):
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
              <span>দৈনিক খরচ তালিকা (Daily Dynamic Expenses)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                {expenses.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              যেকোনো খরচ বিবরণসহ যোগ করুন (দোকান ভাড়া, পার্টস ক্রয়, বিদ্যুৎ বিল, নাস্তা ইত্যাদি)
            </p>
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন খরচ যোগ করুন (+ Add Expense)</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">খরচের বিবরণ (Description)</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                  টাকার পরিমাণ (Amount)
                </th>
                <th className="py-3 px-4 text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    আজকের জন্য কোনো খরচ রেকর্ড করা হয়নি।
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
                        title="Delete"
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
                    মোট খরচ (Total Expenses):
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
                <span>নতুন সার্ভিস ও সেলস এন্ট্রি</span>
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
                    গ্রাহকের নাম (Customer Name)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rahim Mia"
                    value={serviceForm.customerName}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর (Phone)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 01711223344"
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
                    বাইকের মডেল (Bike Model)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pulsar 150 / FZS V3"
                    value={serviceForm.bikeModel}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, bikeModel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    রেজিস্ট্রেশন নম্বর (Reg No. Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dhaka Metro-Ha-11-2233"
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
                  হিসাবের খাতসমূহ (Income Breakdown)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      সার্ভিস বিল (৳)
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
                      স্পেয়ার পার্টস (৳)
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
                      ইঞ্জিন অয়েল (৳)
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
                      এক্সট্রা খরচ (৳)
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
                  সর্বমোট বিল (Total):{" "}
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
                    পেমেন্ট স্ট্যাটাস
                  </label>
                  <select
                    value={serviceForm.paymentStatus}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, paymentStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PAID">সম্পূর্ণ পেইড (Paid)</option>
                    <option value="PARTIAL">আংশিক বাকি (Partial)</option>
                    <option value="DUE">সম্পূর্ণ বাকি (Full Due)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={serviceForm.paymentMethod}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CASH">ক্যাশ (Cash)</option>
                    <option value="BKASH">বিকাশ (bKash)</option>
                    <option value="NAGAD">নগদ (Nagad)</option>
                    <option value="DUE">বাকি (Due)</option>
                  </select>
                </div>

                {serviceForm.paymentStatus === "PARTIAL" && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      কত টাকা পেইড করেছে? (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="কত দিলো"
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
                  নোট / কাজের বিবরণ (Notes)
                </label>
                <input
                  type="text"
                  placeholder="e.g., ইঞ্জিন টিউনিং ও অয়েল ফিল্টার চেঞ্জ"
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
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  সংরক্ষণ করুন (Save Entry)
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
                <span>নতুন দৈনিক খরচ এন্ট্রি (Add Expense)</span>
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
                  খরচের বিবরণ (Description)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., দোকান ভাড়া, মোবিলে খরচ, বিদ্যুৎ বিল"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  টাকার পরিমাণ (Amount ৳)
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
                  খরচের ক্যাটাগরি (Category)
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MISC">অন্যান্য / চা-নাস্তা (Misc / Snacks)</option>
                  <option value="PURCHASE">পার্টস বা মালামাল ক্রয় (Purchase)</option>
                  <option value="RENT">দোকান ভাড়া (Rent)</option>
                  <option value="UTILITIES">বিদ্যুৎ / পানি বিল (Utilities)</option>
                  <option value="SALARY">মেকানিক বেতন / মজুরি (Salary)</option>
                  <option value="TRANSPORT">যাতায়াত খরচ (Transport)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
