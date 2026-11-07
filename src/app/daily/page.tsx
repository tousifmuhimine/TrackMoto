"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Pencil,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Wrench,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  Wallet,
  Edit3,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function DailySheetPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [duePayments, setDuePayments] = useState<any[]>([]);
  const [allDues, setAllDues] = useState<any[]>([]);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [isOpeningCashModalOpen, setIsOpeningCashModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  // Modals & Editing
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // New service form state
  const [serviceForm, setServiceForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    saleType: "SERVICE", // "SERVICE" or "PARTS_SALE"
    customerName: "",
    customerPhone: "",
    bikeModel: "",
    bikeReg: "",
    runningKm: "",
    serviceCharge: "",
    sparePartsCost: "",
    engineOilCost: "",
    extraCharges: "",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    transactionId: "",
    amountPaid: "",
    dueDate: "",
    notes: "",
    selectedEngineOilId: "",
    selectedPartId: "",
    partsQuantity: "1",
    engineOilQuantity: "1",
  });

  // New dynamic expense form state
  const [expenseForm, setExpenseForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    category: "MISC",
  });

  const formattedDateParam = format(selectedDate, "yyyy-MM-dd");

  // Load opening cash from localStorage by date
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`carbon8_opening_cash_${formattedDateParam}`);
      if (stored !== null) {
        setOpeningCash(Number(stored));
        setOpeningCashInput(stored);
      } else {
        setOpeningCash(0);
        setOpeningCashInput("0");
      }
    } catch {
      setOpeningCash(0);
      setOpeningCashInput("0");
    }
  }, [formattedDateParam]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resServices, resExpenses, resInventory, resDuePayments, resAllDues] = await Promise.all([
        fetch(`/api/services?date=${formattedDateParam}`),
        fetch(`/api/expenses?date=${formattedDateParam}`),
        fetch("/api/inventory"),
        fetch(`/api/customer-dues/payments?date=${formattedDateParam}`),
        fetch("/api/customer-dues"),
      ]);

      const dataServices = await resServices.json();
      const dataExpenses = await resExpenses.json();
      const dataInventory = await resInventory.json();
      const dataDuePayments = await resDuePayments.json();
      const dataAllDues = await resAllDues.json();

      setServices(Array.isArray(dataServices) ? dataServices : []);
      setExpenses(Array.isArray(dataExpenses) ? dataExpenses : []);
      setInventoryItems(Array.isArray(dataInventory) ? dataInventory : []);
      setDuePayments(Array.isArray(dataDuePayments) ? dataDuePayments : []);
      setAllDues(Array.isArray(dataAllDues) ? dataAllDues : []);
    } catch (err: any) {
      toast.error("Failed to load records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formattedDateParam]);

  // 1. Separate upfront payments on today's services from old due collections
  const todayServiceIds = new Set(services.map((s) => s.id));
  const oldDuesCollectedToday = duePayments.filter((inst) => {
    const isUpfrontSameDay =
      inst.note?.includes("Upfront payment") &&
      inst.customerDue?.serviceId &&
      todayServiceIds.has(inst.customerDue.serviceId);
    return !isUpfrontSameDay;
  });

  // 2. Inflows by Payment Method
  const serviceCashInflow = services
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const serviceBkashInflow = services
    .filter((s) => s.paymentMethod === "BKASH")
    .reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const serviceNagadInflow = services
    .filter((s) => s.paymentMethod === "NAGAD")
    .reduce((acc, s) => acc + (s.amountPaid || 0), 0);
  const serviceBankInflow = services
    .filter((s) => s.paymentMethod === "BANK")
    .reduce((acc, s) => acc + (s.amountPaid || 0), 0);

  const dueCashInflow = oldDuesCollectedToday
    .filter((i) => i.method === "CASH")
    .reduce((acc, i) => acc + (i.amount || 0), 0);
  const dueBkashInflow = oldDuesCollectedToday
    .filter((i) => i.method === "BKASH")
    .reduce((acc, i) => acc + (i.amount || 0), 0);
  const dueNagadInflow = oldDuesCollectedToday
    .filter((i) => i.method === "NAGAD")
    .reduce((acc, i) => acc + (i.amount || 0), 0);
  const dueBankInflow = oldDuesCollectedToday
    .filter((i) => i.method === "BANK")
    .reduce((acc, i) => acc + (i.amount || 0), 0);

  // 3. Totals
  const totalPhysicalCashInflow = serviceCashInflow + dueCashInflow;
  const totalBkashInflow = serviceBkashInflow + dueBkashInflow;
  const totalNagadInflow = serviceNagadInflow + dueNagadInflow;
  const totalBankInflow = serviceBankInflow + dueBankInflow;
  const totalDigitalInflow = totalBkashInflow + totalNagadInflow + totalBankInflow;
  const totalCashReceivedAll = totalPhysicalCashInflow + totalDigitalInflow;

  // 4. Outflows
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // 5. Drawer Closing Balance (Physical Cash in Hand)
  // Closing Cash = Opening Cash + Cash Inflows (Physical Cash) - Cash Outflows
  const closingCashDrawer = openingCash + totalPhysicalCashInflow - totalExpense;

  // 6. Work Billed (Revenue Today) - Old due collections NOT included in revenue
  const totalServiceCharge = services.reduce((acc, s) => acc + (s.serviceCharge || 0), 0);
  const totalSpareParts = services.reduce((acc, s) => acc + (s.sparePartsCost || 0), 0);
  const totalEngineOil = services.reduce((acc, s) => acc + (s.engineOilCost || 0), 0);
  const totalExtra = services.reduce((acc, s) => acc + (s.extraCharges || 0), 0);
  const totalBilledRevenue = services.reduce((acc, s) => acc + (s.totalIncome || 0), 0);
  const netOperatingProfit = totalBilledRevenue - totalExpense;

  // Open New Service Modal
  const handleOpenNewService = () => {
    setEditingServiceId(null);
    setServiceForm({
      date: format(selectedDate, "yyyy-MM-dd"),
      saleType: "SERVICE",
      customerName: "",
      customerPhone: "",
      bikeModel: "",
      bikeReg: "",
      runningKm: "",
      serviceCharge: "",
      sparePartsCost: "",
      engineOilCost: "",
      extraCharges: "",
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      transactionId: "",
      amountPaid: "",
      dueDate: "",
      notes: "",
      selectedEngineOilId: "",
      selectedPartId: "",
      partsQuantity: "1",
      engineOilQuantity: "1",
    });
    setIsServiceModalOpen(true);
  };

  // Open Edit Service Modal
  const handleOpenEditService = (item: any) => {
    setEditingServiceId(item.id);
    const itemDate = item.date ? new Date(item.date) : selectedDate;
    setServiceForm({
      date: format(itemDate, "yyyy-MM-dd"),
      saleType: item.saleType || "SERVICE",
      customerName: item.customer?.name || "",
      customerPhone: item.customer?.phone || "",
      bikeModel: item.bike?.model || "",
      bikeReg: item.bike?.registrationNo || "",
      runningKm: item.runningKm ? item.runningKm.toString() : (item.bike?.runningKm ? item.bike.runningKm.toString() : ""),
      serviceCharge: (item.serviceCharge ?? 0).toString(),
      sparePartsCost: (item.sparePartsCost ?? 0).toString(),
      engineOilCost: (item.engineOilCost ?? 0).toString(),
      extraCharges: (item.extraCharges ?? 0).toString(),
      paymentStatus: item.paymentStatus || "PAID",
      paymentMethod: item.paymentMethod || "CASH",
      transactionId: item.transactionId || "",
      amountPaid: (item.amountPaid ?? 0).toString(),
      dueDate: item.dueDate || "",
      notes: item.notes || "",
      selectedEngineOilId: "",
      selectedPartId: "",
      partsQuantity: "1",
      engineOilQuantity: "1",
    });
    setIsServiceModalOpen(true);
  };

  // Open New Expense Modal
  const handleOpenNewExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      date: format(selectedDate, "yyyy-MM-dd"),
      description: "",
      amount: "",
      category: "MISC",
    });
    setIsExpenseModalOpen(true);
  };

  // Open Edit Expense Modal
  const handleOpenEditExpense = (exp: any) => {
    setEditingExpenseId(exp.id);
    const expDate = exp.date ? new Date(exp.date) : selectedDate;
    setExpenseForm({
      date: format(expDate, "yyyy-MM-dd"),
      description: exp.description,
      amount: exp.amount.toString(),
      category: exp.category,
    });
    setIsExpenseModalOpen(true);
  };

  // Handle Save (Create or Update) Service
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

      const targetDate = serviceForm.date || format(selectedDate, "yyyy-MM-dd");

      // Build inventory deduction items
      const inventoryItemsToDeduct: any[] = [];
      if (serviceForm.selectedEngineOilId) {
        const oil = inventoryItems.find((i) => i.id === serviceForm.selectedEngineOilId);
        if (oil) {
          inventoryItemsToDeduct.push({
            inventoryItemId: oil.id,
            quantity: Math.max(1, parseInt(serviceForm.engineOilQuantity || "1", 10)),
            unitPrice: Number(oil.sellPrice || 0),
            description: oil.name,
          });
        }
      }

      if (serviceForm.selectedPartId) {
        const part = inventoryItems.find((i) => i.id === serviceForm.selectedPartId);
        if (part) {
          inventoryItemsToDeduct.push({
            inventoryItemId: part.id,
            quantity: Math.max(1, parseInt(serviceForm.partsQuantity || "1", 10)),
            unitPrice: Number(part.sellPrice || 0),
            description: part.name,
          });
        }
      }

      const payload = {
        date: targetDate,
        saleType: serviceForm.saleType,
        customerName: serviceForm.customerName || "Walk-in Customer",
        customerPhone: serviceForm.customerPhone || "",
        bikeModel: serviceForm.bikeModel || "Bike",
        bikeReg: serviceForm.bikeReg,
        runningKm: serviceForm.runningKm,
        serviceCharge: Number(serviceForm.serviceCharge || 0),
        sparePartsCost: Number(serviceForm.sparePartsCost || 0),
        engineOilCost: Number(serviceForm.engineOilCost || 0),
        extraCharges: Number(serviceForm.extraCharges || 0),
        paymentStatus: serviceForm.paymentStatus,
        paymentMethod: serviceForm.paymentMethod,
        transactionId: serviceForm.transactionId || null,
        amountPaid: paid,
        dueDate: serviceForm.dueDate || null,
        notes: serviceForm.notes,
        inventoryItems: inventoryItemsToDeduct,
      };

      const url = editingServiceId ? `/api/services/${editingServiceId}` : "/api/services";
      const method = editingServiceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || (editingServiceId ? "Failed to update record" : "Failed to save service"));
      }

      toast.success(editingServiceId ? "Service record updated successfully!" : "Service record added successfully!");
      setIsServiceModalOpen(false);
      setEditingServiceId(null);
      setServiceForm({
        date: format(selectedDate, "yyyy-MM-dd"),
        saleType: "SERVICE",
        customerName: "",
        customerPhone: "",
        bikeModel: "",
        bikeReg: "",
        runningKm: "",
        serviceCharge: "",
        sparePartsCost: "",
        engineOilCost: "",
        extraCharges: "",
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        transactionId: "",
        amountPaid: "",
        dueDate: "",
        notes: "",
        selectedEngineOilId: "",
        selectedPartId: "",
        partsQuantity: "1",
        engineOilQuantity: "1",
      });

      // Navigate to targetDate if entered date differs from currently viewed date
      if (targetDate !== formattedDateParam) {
        const [y, m, d] = targetDate.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      } else {
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handle Save (Create or Update) Dynamic Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!expenseForm.description || !expenseForm.amount) {
        toast.warning("Please provide description and amount");
        return;
      }

      const targetDate = expenseForm.date || format(selectedDate, "yyyy-MM-dd");

      const url = editingExpenseId ? `/api/expenses/${editingExpenseId}` : "/api/expenses";
      const method = editingExpenseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: targetDate,
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
          category: expenseForm.category,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.details || (editingExpenseId ? "Failed to update expense" : "Failed to save expense"));
      }

      toast.success(editingExpenseId ? "Expense updated successfully!" : "Expense added successfully!");
      setIsExpenseModalOpen(false);
      setEditingExpenseId(null);
      setExpenseForm({ date: format(selectedDate, "yyyy-MM-dd"), description: "", amount: "", category: "MISC" });

      // Navigate to targetDate if entered date differs from currently viewed date
      if (targetDate !== formattedDateParam) {
        const [y, m, d] = targetDate.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      } else {
        fetchData();
      }
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

          <div className="relative flex items-center gap-2 px-2 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-2xs border border-slate-200 dark:border-slate-600">
            <CalendarIcon className="w-4 h-4 text-emerald-600 pointer-events-none" />
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  setSelectedDate(new Date(y, m - 1, d));
                }
              }}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 outline-hidden cursor-pointer"
            />
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
            className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Hero Summary Cards (Closing Drawer, Inflows, Expenses, Profit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Closing Cash in Hand (Physical Drawer) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cash Drawer (In Hand)
            </span>
            <button
              onClick={() => {
                setOpeningCashInput(openingCash.toString());
                setIsOpeningCashModalOpen(true);
              }}
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Set Opening Cash for this date"
            >
              <Edit3 className="w-3 h-3 text-emerald-600" />
              <span>Opening: ৳{openingCash}</span>
            </button>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(closingCashDrawer)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Opening (৳{openingCash}) + In (৳{totalPhysicalCashInflow}) - Exp (৳{totalExpense})</span>
          </div>
        </div>

        {/* Card 2: Total Cash Inflows (Physical Cash + Digital) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Cash Inflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCashReceivedAll)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">💵 Cash: ৳{totalPhysicalCashInflow}</span>
            <span>•</span>
            <span>📱 bKash: ৳{totalBkashInflow}</span>
            <span>•</span>
            <span>🔴 Nagad: ৳{totalNagadInflow}</span>
            <span>•</span>
            <span>🏦 Bank: ৳{totalBankInflow}</span>
          </div>
        </div>

        {/* Card 3: Total Daily Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {expenses.length} dynamic expense entries recorded today
          </div>
        </div>

        {/* Card 4: Work Billed & Net Operating Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Work Billed & Profit
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                netOperatingProfit >= 0
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
              }`}
            >
              {netOperatingProfit >= 0 ? "PROFIT" : "LOSS"}
            </span>
          </div>
          <div className="mt-2.5">
            <span
              className={`text-3xl font-black ${
                netOperatingProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatCurrency(netOperatingProfit)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Billed ৳{totalBilledRevenue} - Expenses ৳{totalExpense}
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
            onClick={handleOpenNewService}
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
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span>{item.customer ? item.customer.name : "Walk-in Customer"}</span>
                        {item.saleType === "PARTS_SALE" && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Parts Sale
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>🏍️ {item.bike ? item.bike.model : "Motorcycle"}</span>
                        {item.bike?.registrationNo && (
                          <span className="font-mono text-slate-600 dark:text-slate-300">
                            • {item.bike.registrationNo}
                          </span>
                        )}
                        {(item.runningKm || item.bike?.runningKm) && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded font-mono font-semibold">
                            {(item.runningKm || item.bike?.runningKm).toLocaleString()} KM
                          </span>
                        )}
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
                      {item.paymentMethod && item.paymentMethod !== "CASH" && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">
                          {item.paymentMethod}
                          {item.transactionId && ` • ${item.transactionId}`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditService(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Edit record"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                    {formatCurrency(totalBilledRevenue)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* SECTION 2: Old Dues Collected Today (Debt Recovery) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <span>Old Dues Collected Today (Debt Recovery)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {oldDuesCollectedToday.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Payments received from past customer debts. Added to today's Cash in Hand without double-counting as new service revenue.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold uppercase">
              Total Due Collected
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(oldDuesCollectedToday.reduce((a: number, b: any) => a + (b.amount || 0), 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Bike / Vehicle</th>
                <th className="py-3 px-4 text-center">Payment Method</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Cash Collected
                </th>
                <th className="py-3 px-4 text-right">Remaining Due</th>
                <th className="py-3 px-4">Payment Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {oldDuesCollectedToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-7 text-center text-slate-400 text-xs">
                    No old customer dues collected on this date.
                  </td>
                </tr>
              ) : (
                oldDuesCollectedToday.map((inst: any) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                        {inst.customerDue?.customerName ||
                          inst.customerDue?.customer?.name ||
                          "Customer"}
                      </span>
                      {inst.customerDue?.customer?.phone && (
                        <span className="text-xs text-slate-400">
                          📞 {inst.customerDue.customer.phone}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      🏍️ {inst.customerDue?.bikeName ||
                        inst.customerDue?.bike?.model ||
                        "Motorcycle"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          inst.method === "CASH"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {inst.method}
                      </span>
                      {inst.transactionId && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Trx: {inst.transactionId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                      +{formatCurrency(inst.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(inst.customerDue?.remainingAmount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {inst.note || "Due installment payment"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Dynamic Expenses List */}
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
            onClick={handleOpenNewExpense}
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
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditExpense(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Edit expense"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                <span>{editingServiceId ? "Edit Service / Sale Record" : "New Service & Sales Entry"}</span>
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="mt-4 space-y-4">
              {/* Transaction Type: Service vs Over-The-Counter Parts Sale */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setServiceForm({ ...serviceForm, saleType: "SERVICE" })}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    serviceForm.saleType === "SERVICE"
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Servicing & Repair</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setServiceForm({
                      ...serviceForm,
                      saleType: "PARTS_SALE",
                      serviceCharge: "0",
                    })
                  }
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    serviceForm.saleType === "PARTS_SALE"
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Direct Parts / Oil Sale</span>
                </button>
              </div>

              {/* Service / Record Date */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>Service / Record Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={serviceForm.date}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
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
                    placeholder="e.g., +880 1711 223344"
                    value={serviceForm.customerPhone}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Recognized Customer Active Due Notice */}
              {(() => {
                const phoneClean = serviceForm.customerPhone?.replace(/\s+/g, "");
                if (!phoneClean || phoneClean.length < 5) return null;
                const activeDue = allDues.find(
                  (d) =>
                    d.status !== "CLEARED" &&
                    d.customer?.phone?.replace(/\s+/g, "") === phoneClean
                );
                if (!activeDue) return null;
                return (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <span>⚠️ Recognized Customer: Previous unpaid due</span>
                      <strong className="font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(activeDue.remainingAmount)}
                      </strong>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">
                      Will accumulate on save
                    </span>
                  </div>
                );
              })()}

              {/* Bike Info + Running KM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bike Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pulsar 150 / FZS"
                    value={serviceForm.bikeModel}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, bikeModel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration No
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Running KM</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Odometer</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 14500"
                    value={serviceForm.runningKm}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, runningKm: e.target.value })
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
                        setServiceForm({
                          ...serviceForm,
                          sparePartsCost: e.target.value,
                          selectedPartId: "",
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    {inventoryItems.length > 0 && (
                      <select
                        value={serviceForm.selectedPartId}
                        onChange={(e) => {
                          const partId = e.target.value;
                          const part = inventoryItems.find((i) => i.id === partId);
                          if (part) {
                            const qty = Math.max(1, parseInt(serviceForm.partsQuantity || "1", 10));
                            setServiceForm({
                              ...serviceForm,
                              selectedPartId: partId,
                              sparePartsCost: (Number(part.sellPrice) * qty).toString(),
                            });
                          } else {
                            setServiceForm({
                              ...serviceForm,
                              selectedPartId: "",
                            });
                          }
                        }}
                        className="w-full mt-1 text-[11px] px-1.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate"
                      >
                        <option value="">Choose part from stock...</option>
                        {inventoryItems
                          .filter((i) => i.category !== "ENGINE_OIL")
                          .map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                              disabled={item.quantity <= 0}
                            >
                              {item.name} (৳{item.sellPrice}/pc — {item.quantity <= 0 ? "Out of Stock" : `${item.quantity} in stock`})
                            </option>
                          ))}
                      </select>
                    )}
                    {serviceForm.selectedPartId && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                        📦 Auto-drops stock on save
                      </span>
                    )}
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
                        setServiceForm({
                          ...serviceForm,
                          engineOilCost: e.target.value,
                          selectedEngineOilId: "",
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    {inventoryItems.length > 0 && (
                      <select
                        value={serviceForm.selectedEngineOilId}
                        onChange={(e) => {
                          const oilId = e.target.value;
                          const oil = inventoryItems.find((i) => i.id === oilId);
                          if (oil) {
                            const qty = Math.max(1, parseInt(serviceForm.engineOilQuantity || "1", 10));
                            setServiceForm({
                              ...serviceForm,
                              selectedEngineOilId: oilId,
                              engineOilCost: (Number(oil.sellPrice) * qty).toString(),
                            });
                          } else {
                            setServiceForm({
                              ...serviceForm,
                              selectedEngineOilId: "",
                            });
                          }
                        }}
                        className="w-full mt-1 text-[11px] px-1.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate"
                      >
                        <option value="">Choose oil from stock...</option>
                        {inventoryItems
                          .filter((i) => i.category === "ENGINE_OIL" || i.category === "MISC")
                          .map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                              disabled={item.quantity <= 0}
                            >
                              {item.name} (৳{item.sellPrice}/pc — {item.quantity <= 0 ? "Out of Stock" : `${item.quantity} in stock`})
                            </option>
                          ))}
                      </select>
                    )}
                    {serviceForm.selectedEngineOilId && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                        📦 Auto-drops stock on save
                      </span>
                    )}
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
                    <option value="BANK">Bank Transfer / Card</option>
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

                {serviceForm.paymentMethod !== "CASH" && serviceForm.paymentMethod !== "DUE" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {serviceForm.paymentMethod === "BANK"
                        ? "Bank Reference / Cheque No"
                        : `${serviceForm.paymentMethod} TrxID (Transaction ID)`}{" "}
                      <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        serviceForm.paymentMethod === "BANK"
                          ? "e.g., BRAC-994821 or Cheque #1234"
                          : "e.g., 9K82JD01P"
                      }
                      value={serviceForm.transactionId}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, transactionId: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
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
                  {editingServiceId ? "Save Changes" : "Save Service Record"}
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
                <span>{editingExpenseId ? "Edit Daily Expense" : "Add Daily Expense"}</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              {/* Expense Date */}
              <div className="bg-rose-50/70 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <label className="block text-xs font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-rose-600" />
                  <span>Expense Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

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
                  {editingExpenseId ? "Save Changes" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 3: Set Opening Cash */}
      {isOpeningCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>Opening Cash Drawer Balance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Set the physical cash in the drawer at the start of {format(selectedDate, "dd MMMM yyyy")}.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(openingCashInput) || 0;
                setOpeningCash(val);
                try {
                  localStorage.setItem(`carbon8_opening_cash_${formattedDateParam}`, val.toString());
                  toast.success(`Opening Cash set to ${formatCurrency(val)}`);
                } catch {}
                setIsOpeningCashModalOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Cash Amount (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  required
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g., 2000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpeningCashModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Opening Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
