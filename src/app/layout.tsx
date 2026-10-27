import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Carbon 8 — Motorcycle Workshop Management System",
  description:
    "Carbon 8 Workshop Management Platform — Daily services, spare parts sales, expenses, and customer ledger.",
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
