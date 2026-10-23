"use client";

import { useState } from "react";
import { Settings, Save, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    workshopName: "TrackMoto Bike Workshop",
    address: "Plot 12, Main Road, Dhaka - 1216",
    phone: "+880 1711-223344",
    currency: "৳",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Workshop profile settings saved!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Workshop Settings & Profile</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Workshop name, physical address, support phone number, and invoice configurations.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workshop Name
            </label>
            <input
              type="text"
              value={profile.workshopName}
              onChange={(e) => setProfile({ ...profile, workshopName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workshop Address
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>System Information & Hosting</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          TrackMoto is powered by Next.js 15 App Router, TypeScript, and Tailwind CSS. The data layer uses Prisma ORM configured for Neon Serverless Postgres in production and local Docker PostgreSQL for local environments. Ready for zero-config Vercel deployment.
        </p>
      </div>
    </div>
  );
}
