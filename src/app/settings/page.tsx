"use client";

import { useState } from "react";
import { Settings, Save, Palette, Sun, Moon, Check } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme, isDark } = useTheme();
  const [profile, setProfile] = useState({
    workshopName: "Carbon 8 Workshop",
    address: "Plot 12, Main Road, Dhaka - 1216",
    phone: "+880 1711-223344",
    currency: "BDT",
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
          Workshop name, physical address, support phone number, theme appearance, and configurations.
        </p>
      </div>

      {/* Theme & Appearance Setting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Display Appearance (Dark / Bright Mode)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Choose your preferred interface theme. You can also quickly toggle this at any time using the Sun/Moon button in the top navigation bar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <div
            onClick={() => {
              setTheme("dark");
              toast.success("Switched to Dark Mode");
            }}
            className={`cursor-pointer relative rounded-2xl p-4.5 border-2 transition-all select-none ${
              isDark
                ? "bg-slate-950 border-red-500 shadow-md shadow-red-500/10"
                : "bg-slate-900/60 border-slate-300 dark:border-slate-800 hover:border-slate-400"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Dark Mode</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      Carbon 8
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    High-contrast dark slate & carbon finish
                  </p>
                </div>
              </div>
              {isDark && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Reduced glare for garage bays</span>
              {isDark && <span className="text-red-400 font-bold">Active</span>}
            </div>
          </div>

          {/* Bright Mode Card */}
          <div
            onClick={() => {
              setTheme("light");
              toast.success("Switched to Bright Mode");
            }}
            className={`cursor-pointer relative rounded-2xl p-4.5 border-2 transition-all select-none ${
              !isDark
                ? "bg-slate-50 border-emerald-500 shadow-md shadow-emerald-500/10"
                : "bg-slate-800/40 border-slate-300 dark:border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-slate-700">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Bright Mode</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Daylight
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Crisp white daylight surfaces & high readability
                  </p>
                </div>
              </div>
              {!isDark && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Optimized for outdoor sunlight</span>
              {!isDark && <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Profile Form */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
