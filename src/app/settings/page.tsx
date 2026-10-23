"use client";

import { useState } from "react";
import { Settings, Save, ShieldCheck, Database, Laptop, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    workshopName: "TrackMoto Bike Workshop",
    address: "প্লট ১২, মেইন রোড, মিরপুর ১০, ঢাকা - ১২১৬",
    phone: "+৮৮০ ১৭১১-২২৩৩৪৪",
    currency: "৳",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("ওয়ার্কশপ সেটিংস সংরক্ষিত হয়েছে!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>ওয়ার্কশপ সেটিংস ও প্রোফাইল (Settings)</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          দোকানের নাম, ঠিকানা, মেমোর মোবাইল নম্বর ও অন্যান্য কনফিগারেশন।
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ওয়ার্কশপের নাম (Workshop Name)
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
              দোকানের ঠিকানা (Address)
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
                যোগাযোগের ফোন নম্বর (Phone)
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
                মুদ্রা প্রতীক (Currency)
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
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>সিস্টেম ইনফরমেশন ও ডেপ্লয়মেন্ট</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          এই অ্যাপ্লিকেশনটি Next.js 15 App Router এবং Tailwind CSS দিয়ে তৈরি। ডেটাবেজ হিসেবে Neon Lakebase Postgres এবং লোকাল ডেভেলপমেন্টে Docker Postgres সমর্থন করে। এটি সম্পূর্ণভাবে Vercel এ ডেপ্লয় করার উপযোগী।
        </p>
      </div>
    </div>
  );
}
