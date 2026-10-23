import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  title: "TrackMoto — Bike Workshop Management System",
  description:
    "Daily service tracking, dynamic expenses, monthly profit/loss reports, and customer due management with installment tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoBengali.variable}`}>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          <MobileNav />
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
