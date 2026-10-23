"use client";

import { useState, useEffect } from "react";
import { FileSpreadsheet, Printer, Download, Eye, Calendar, Bike, Phone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      setServices(Array.isArray(json) ? json : []);
      if (Array.isArray(json) && json.length > 0) {
        setSelectedService(json[0]);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>সার্ভিস মেমো ও ইনভয়েস রসিদ (Invoice / Receipts)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            গ্রাহকের জন্য প্রিন্ট-রেডি রসিদ প্রস্তুত ও ডাউনলোড।
          </p>
        </div>

        {selectedService && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>রসিদ প্রিন্ট করুন (Print Receipt)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service selector list (hidden when printing) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm print:hidden space-y-2 h-[680px] overflow-y-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
            সার্ভিস তালিকা নির্বাচন করুন
          </span>
          {loading ? (
            <p className="text-xs text-slate-400 p-4 text-center">লোড হচ্ছে...</p>
          ) : services.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">কোনো সার্ভিস নেই।</p>
          ) : (
            services.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedService?.id === s.id
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {s.customer ? s.customer.name : "Walk-in"}
                  </span>
                  <span className="font-bold text-xs text-emerald-600">
                    {formatCurrency(s.totalIncome)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between items-center mt-1">
                  <span>🏍️ {s.bike ? s.bike.model : "Bike"}</span>
                  <span>{formatDate(s.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Printable Invoice Card */}
        <div className="lg:col-span-2">
          {!selectedService ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              অনুগ্রহ করে বাম পাশের তালিকা থেকে একটি সার্ভিস সিলেক্ট করুন।
            </div>
          ) : (
            <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 p-8 shadow-md print:border-none print:shadow-none print:p-0">
              {/* Invoice Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-emerald-600">
                      TrackMoto
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Workshop
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    মেসার্স বাইক সার্ভিস ও স্পেয়ার পার্টস সেন্টার
                  </p>
                  <p className="text-xs text-slate-500">মিরপুর ১০, ঢাকা | হেল্পলাইন: +৮৮০ ১৭১১-২২৩৩৪৪</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold uppercase tracking-wider text-slate-800 block">
                    ক্যাশ মেমো / ইনভয়েস
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    মেমো নং: #{selectedService.id.slice(-8).toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    তারিখ: {formatDate(selectedService.date)}
                  </p>
                </div>
              </div>

              {/* Customer & Bike Info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block">
                    গ্রাহকের বিবরণ:
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {selectedService.customer ? selectedService.customer.name : "নগদ ক্রেতা (Walk-in)"}
                  </span>
                  {selectedService.customer?.phone && (
                    <span className="text-xs text-slate-600 block">
                      ফোন: {selectedService.customer.phone}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase block">
                    বাইকের বিবরণ:
                  </span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {selectedService.bike ? selectedService.bike.model : "মোটরসাইকেল"}
                  </span>
                  {selectedService.bike?.registrationNo && (
                    <span className="text-xs text-slate-600 block">
                      রেজি: {selectedService.bike.registrationNo}
                    </span>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <table className="w-full text-left border-collapse my-6 text-sm">
                <thead>
                  <tr className="border-b border-slate-300 text-xs font-bold uppercase text-slate-600">
                    <th className="py-2.5">বিবরণ (Service / Item Details)</th>
                    <th className="py-2.5 text-right">টাকার পরিমাণ (Amount ৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedService.serviceCharge > 0 && (
                    <tr>
                      <td className="py-2.5 text-slate-700">সার্ভিসিং ও মেকানিক মজুরি (Labour Charge)</td>
                      <td className="py-2.5 text-right font-medium">
                        {formatCurrency(selectedService.serviceCharge)}
                      </td>
                    </tr>
                  )}
                  {selectedService.sparePartsCost > 0 && (
                    <tr>
                      <td className="py-2.5 text-slate-700">নতুন স্পেয়ার পার্টস মূল্য (Spare Parts)</td>
                      <td className="py-2.5 text-right font-medium">
                        {formatCurrency(selectedService.sparePartsCost)}
                      </td>
                    </tr>
                  )}
                  {selectedService.engineOilCost > 0 && (
                    <tr>
                      <td className="py-2.5 text-slate-700">ইঞ্জিন অয়েল / মবিল (Engine Oil)</td>
                      <td className="py-2.5 text-right font-medium">
                        {formatCurrency(selectedService.engineOilCost)}
                      </td>
                    </tr>
                  )}
                  {selectedService.extraCharges > 0 && (
                    <tr>
                      <td className="py-2.5 text-slate-700">অতিরিক্ত অন্যান্য খরচ (Extra Charges)</td>
                      <td className="py-2.5 text-right font-medium">
                        {formatCurrency(selectedService.extraCharges)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="border-t border-slate-300 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>সর্বমোট বিল (Total Bill):</span>
                  <span className="font-bold text-slate-900 text-base">
                    {formatCurrency(selectedService.totalIncome)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>পরিশোধিত (Paid Amount):</span>
                  <span>{formatCurrency(selectedService.amountPaid || selectedService.totalIncome)}</span>
                </div>

                {selectedService.totalIncome - selectedService.amountPaid > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold text-base pt-1 border-t border-dashed border-slate-200">
                    <span>অবশিষ্ট বাকি (Remaining Due):</span>
                    <span>
                      {formatCurrency(selectedService.totalIncome - selectedService.amountPaid)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                ধন্যবাদ আবার আসবেন! আমাদের সেবায় আপনার আস্থা আমাদের প্রেরণা।
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
