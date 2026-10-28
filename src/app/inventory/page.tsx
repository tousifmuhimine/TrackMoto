"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  Trash2,
  Pencil,
  CheckCircle2,
  Ban,
  Search,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  DollarSign,
  Boxes,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [form, setForm] = useState({
    name: "",
    category: "ENGINE_OIL",
    quantity: "",
    buyPrice: "",
    sellPrice: "",
    reorderLevel: "5",
    supplierName: "",
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenCreate = () => {
    setEditingItemId(null);
    setForm({
      name: "",
      category: "ENGINE_OIL",
      quantity: "",
      buyPrice: "",
      sellPrice: "",
      reorderLevel: "5",
      supplierName: "",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItemId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "ENGINE_OIL",
      quantity: item.quantity?.toString() || "0",
      buyPrice: item.buyPrice?.toString() || "0",
      sellPrice: item.sellPrice?.toString() || "0",
      reorderLevel: item.reorderLevel?.toString() || "5",
      supplierName: item.supplierName || "",
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItemId ? `/api/inventory/${editingItemId}` : "/api/inventory";
      const method = editingItemId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save inventory item");
      }

      toast.success(editingItemId ? "Stock item updated successfully" : "Stock item added successfully");
      setIsOpen(false);
      setEditingItemId(null);
      setForm({
        name: "",
        category: "ENGINE_OIL",
        quantity: "",
        buyPrice: "",
        sellPrice: "",
        reorderLevel: "5",
        supplierName: "",
      });
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Inventory item deleted");
        fetchInventory();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete item");
      }
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  // Quick inline stock increment / decrement
  const handleQuickAdjust = async (item: any, delta: number) => {
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          quantity: newQty,
        }),
      });

      if (res.ok) {
        toast.success(`${item.name} stock adjusted: ${newQty} pcs`);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to adjust stock");
      }
    } catch (err: any) {
      toast.error("Stock adjustment failed: " + err.message);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // KPI Calculations
  const totalCatalogItems = items.length;
  const inStockCount = items.filter((i) => i.quantity > i.reorderLevel).length;
  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.reorderLevel).length;
  const outOfStockCount = items.filter((i) => i.quantity <= 0).length;
  const totalValuation = items.reduce(
    (acc, i) => acc + (Number(i.quantity || 0) * Number(i.buyPrice || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Spare Parts & Stock Inventory</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engine oils, spare parts, brake shoes, cost price per piece, selling price, and stock alerts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Catalog */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Items
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCatalogItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">In catalog</p>
        </div>

        {/* In Stock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>In Stock</span>
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {inStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Healthy inventory</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {lowStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Need reordering</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Ban className="w-3.5 h-3.5" />
            <span>Out of Stock</span>
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {outOfStockCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">0 pcs remaining</p>
        </div>

        {/* Total Stock Valuation */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Stock Value</span>
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(totalValuation)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Per-piece cost valuation</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search parts, engine oils, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: "ALL", label: "All Items" },
            { id: "ENGINE_OIL", label: "Engine Oil" },
            { id: "SPARE_PARTS", label: "Spare Parts" },
            { id: "BRAKE", label: "Brakes" },
            { id: "CHAIN", label: "Chain" },
            { id: "MISC", label: "Misc" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">In Stock (Pcs)</th>
                <th className="py-3 px-4 text-right">Cost / Pc (BDT)</th>
                <th className="py-3 px-4 text-right">Selling / Pc (BDT)</th>
                <th className="py-3 px-4 text-right">Margin / Pc</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Quick Adjust</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading stock inventory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No items found matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const qty = Number(item.quantity || 0);
                  const isOutOfStock = qty <= 0;
                  const isLow = !isOutOfStock && qty <= item.reorderLevel;
                  const buyPrice = Number(item.buyPrice || 0);
                  const sellPrice = Number(item.sellPrice || 0);
                  const margin = sellPrice - buyPrice;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isOutOfStock ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        <span
                          className={`text-sm ${
                            isOutOfStock
                              ? "text-rose-600 dark:text-rose-400 font-extrabold"
                              : isLow
                              ? "text-amber-600 dark:text-amber-400 font-bold"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {qty} pcs
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(buyPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sellPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs font-semibold">
                        <span
                          className={
                            margin >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {margin >= 0 ? "+" : ""}
                          {formatCurrency(margin)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {item.supplierName || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                            <Ban className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>In Stock</span>
                          </span>
                        )}
                      </td>
                      {/* Quick Adjust Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            disabled={qty <= 0}
                            className="p-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer"
                            title="Decrease stock by 1 piece"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 min-w-6 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                            title="Increase stock by 1 piece"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Edit inventory item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete inventory item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>{editingItemId ? "Edit Stock Item" : "Add New Stock Item"}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item / Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Motul 10W-40 1L, Front Brake Shoe, Chain Sprocket"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ENGINE_OIL">Engine Oil</option>
                    <option value="SPARE_PARTS">Spare Parts</option>
                    <option value="BRAKE">Brake Shoe / Pads</option>
                    <option value="CHAIN">Chain & Sprocket</option>
                    <option value="MISC">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock (Pieces / Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    0 pieces = "Out of Stock"
                  </span>
                </div>
              </div>

              {/* Per-Piece Pricing Highlight */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Per-Piece Pricing Configuration</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Price / Pc (BDT) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="e.g., 550"
                      value={form.buyPrice}
                      onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Purchase cost per 1 piece
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price / Pc (BDT) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="e.g., 650"
                      value={form.sellPrice}
                      onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Retail sale price per 1 piece
                    </span>
                  </div>
                </div>

                {/* Live Margin Calculation Preview */}
                {form.buyPrice && form.sellPrice && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      Expected Profit Margin:
                    </span>
                    <span
                      className={`font-bold ${
                        Number(form.sellPrice) - Number(form.buyPrice) >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(Number(form.sellPrice) - Number(form.buyPrice))} / piece
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Low Stock Threshold (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Alerts "Low Stock" at or below this count
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rahman Auto Parts"
                    value={form.supplierName}
                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  {editingItemId ? "Save Changes" : "Save Stock Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
