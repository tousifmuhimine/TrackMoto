"use client";

import { useState, useEffect } from "react";
import { Package, Plus, AlertTriangle, Trash2, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Spare Parts & Stock Inventory</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engine oils, chains, brake shoes, filters, cost prices, sell prices, and stock reorder alerts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Stock Quantity</th>
                <th className="py-3 px-4 text-right">Cost Price (BDT)</th>
                <th className="py-3 px-4 text-right">Selling Price (BDT)</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading stock...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No items in inventory.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {item.quantity} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.buyPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.sellPrice)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {item.supplierName || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isLow
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center gap-1"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {isLow ? <AlertTriangle className="w-3 h-3" /> : null}
                          {isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title="Edit inventory item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              {editingItemId ? "Edit Stock Item" : "Add New Stock Item"}
            </h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Motul 10W-40 Mobil, Chain Sprocket"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity (pcs)</label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="ENGINE_OIL">Engine Oil</option>
                    <option value="SPARE_PARTS">Spare Parts</option>
                    <option value="BRAKE">Brake Shoe / Pads</option>
                    <option value="CHAIN">Chain & Sprocket</option>
                    <option value="MISC">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Cost Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={form.buyPrice}
                    onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Selling Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={form.sellPrice}
                    onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g., Rahman Auto Parts"
                  value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white"
                >
                  {editingItemId ? "Save Changes" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
