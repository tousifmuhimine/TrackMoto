"use client";

import { useState, useEffect } from "react";
import { Package, Plus, AlertTriangle, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add inventory item");
      toast.success("মালামাল সফলভাবে স্টকে যুক্ত হয়েছে");
      setIsOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>স্পেয়ার পার্টস ও অয়েল ইনভেন্টরি (Stock & Inventory)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            মবিল, চেইন, প্লাগ, ব্রেক শু ইত্যাদি যন্ত্রাংশের মজুদ ও ক্রয়-বিক্রয় মূল্য।
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন আইটেম যুক্ত করুন</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold">
                <th className="py-3 px-4">আইটেমের নাম</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4 text-center">মজুদ (Stock)</th>
                <th className="py-3 px-4 text-right">ক্রয়মূল্য (৳)</th>
                <th className="py-3 px-4 text-right">বিক্রয়মূল্য (৳)</th>
                <th className="py-3 px-4">সাপ্লায়ার</th>
                <th className="py-3 px-4 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    কোনো আইটেম যোগ করা হয়নি।
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
                        {item.quantity} পিস
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
                          {isLow ? "স্টক শেষপ্রায়" : "মজুদ আছে"}
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

      {/* Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              নতুন মালামাল স্টক যুক্ত করুন
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">আইটেমের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Motul 10W-40 Mobil / Brake Shoe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">পরিমাণ (Qty)</label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="ENGINE_OIL">ইঞ্জিন অয়েল (Mobil)</option>
                    <option value="SPARE_PARTS">স্পেয়ার পার্টস</option>
                    <option value="BRAKE">ব্রেক শু / প্যাড</option>
                    <option value="CHAIN">চেইন স্প্রোকেট</option>
                    <option value="MISC">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={form.buyPrice}
                    onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">বিক্রয়মূল্য (৳)</label>
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
                <label className="block text-xs font-semibold mb-1">সাপ্লায়ারের নাম</label>
                <input
                  type="text"
                  placeholder="e.g., রহমান অটো পার্টস"
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
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
