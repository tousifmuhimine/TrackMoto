"use client";

import { useState, useEffect } from "react";
import { Users2, Plus, Phone, MapPin, Bike, Search, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    tag: "REGULAR",
    bikeModel: "",
    bikeReg: "",
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      setCustomers(Array.isArray(json) ? json : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create customer");

      toast.success("গ্রাহক সফলভাবে যোগ হয়েছে");
      setIsOpen(false);
      setForm({ name: "", phone: "", address: "", tag: "REGULAR", bikeModel: "", bikeReg: "" });
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users2 className="w-6 h-6 text-emerald-600" />
            <span>গ্রাহক ডেটাবেজ ও সিআরএম (Customer Directory)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            গ্রাহকের বাইক হিস্টোরি, মোট কেনাকাটা ও বর্তমান বাকি তথ্য।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম বা মোবাইল..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন গ্রাহক</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            কোনো গ্রাহক পাওয়া যায়নি।
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {c.name}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {c.tag}
                </span>
              </div>

              {c.bikes && c.bikes.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <Bike className="w-4 h-4 text-emerald-600" />
                  <span>
                    {c.bikes.map((b: any) => `${b.model} (${b.registrationNo || "No Reg"})`).join(", ")}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">মোট সার্ভিস ব্যয়:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(c.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">বর্তমান বাকি:</span>
                  <span
                    className={`font-bold text-sm ${
                      c.pendingDues > 0 ? "text-rose-600" : "text-slate-600"
                    }`}
                  >
                    {formatCurrency(c.pendingDues)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              নতুন গ্রাহক প্রোফাইল
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">নাম</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">মোবাইল</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">বাইকের মডেল</label>
                  <input
                    type="text"
                    placeholder="Pulsar / FZS"
                    value={form.bikeModel}
                    onChange={(e) => setForm({ ...form, bikeModel: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">রেজিস্ট্রেশন নম্বর</label>
                  <input
                    type="text"
                    placeholder="ঢাকা মেট্রো..."
                    value={form.bikeReg}
                    onChange={(e) => setForm({ ...form, bikeReg: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
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
