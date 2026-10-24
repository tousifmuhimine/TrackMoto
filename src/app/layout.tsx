import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TrackMotors — Bike Workshop Management System",
  description:
    "Daily service tracking, dynamic expenses, monthly profit/loss reports, and customer due management with installment tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100">
        <AppShell>{children}</AppShell>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
