"use client";

import { useState, useEffect } from "react";
import { Users2, Plus, Phone, Bike, Search, Trash2, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    tag: "REGULAR",
    bikeModel: "",
    bikeReg: "",
    runningKm: "",
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

  const handleOpenCreate = () => {
    setEditingCustomerId(null);
    setForm({
      name: "",
      phone: "",
      address: "",
      tag: "REGULAR",
      bikeModel: "",
      bikeReg: "",
      runningKm: "",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomerId(customer.id);
    const bike = customer.bikes && customer.bikes[0];
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      tag: customer.tag || "REGULAR",
      bikeModel: bike?.model || "",
      bikeReg: bike?.registrationNo || "",
      runningKm: bike?.runningKm ? bike.runningKm.toString() : "",
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers";
      const method = editingCustomerId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save customer");
      }

      toast.success(editingCustomerId ? "Customer updated successfully" : "Customer added successfully");
      setIsOpen(false);
      setEditingCustomerId(null);
      setForm({ name: "", phone: "", address: "", tag: "REGULAR", bikeModel: "", bikeReg: "", runningKm: "" });
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Customer deleted");
        fetchCustomers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete customer");
      }
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
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
            <span>Customer Directory & CRM</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customer bike history, lifetime service spend, and outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No customers found.
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
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {c.tag}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                    title="Edit customer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {c.bikes && c.bikes.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {c.bikes.map((b: any) => `${b.model} (${b.registrationNo || "No Reg"})`).join(", ")}
                    </span>
                  </div>
                  {c.bikes[0]?.runningKm && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded shrink-0">
                      {c.bikes[0].runningKm.toLocaleString()} KM
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Lifetime Spend:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(c.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Dues:</span>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              {editingCustomerId ? "Edit Customer Profile" : "New Customer Profile"}
            </h3>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Customer Tag</label>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="REGULAR">Regular Customer</option>
                    <option value="VIP">VIP Customer</option>
                    <option value="NEW">New Customer</option>
                    <option value="BAD_DEBT">Due Risk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Bike Details: Model, Registration No, Running KM */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Motorcycle Details & Running Odometer
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Bike Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., FZS V3"
                      value={form.bikeModel}
                      onChange={(e) => setForm({ ...form, bikeModel: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Registration No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., DHAKA-55-1234"
                      value={form.bikeReg}
                      onChange={(e) => setForm({ ...form, bikeReg: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Running KM
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 18500"
                      value={form.runningKm}
                      onChange={(e) => setForm({ ...form, runningKm: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {editingCustomerId ? "Save Changes" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
