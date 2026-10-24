"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Wrench,
  Bike,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rpm, setRpm] = useState(0);

  // Tachometer rev animation during intro
  useEffect(() => {
    if (!showIntro) return;

    // Simulate RPM revving up to redline (0 -> 12,000 RPM)
    const interval = setInterval(() => {
      setRpm((prev) => {
        if (prev >= 12000) {
          clearInterval(interval);
          return 12000;
        }
        return prev + 600;
      });
    }, 90);

    // Auto-transition to login form after 3.2 seconds
    const timeout = setTimeout(() => {
      setShowIntro(false);
    }, 3200);

    // Keyboard ESC to skip intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowIntro(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showIntro]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      toast.warning("Please enter your Workshop Password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome back!", {
          description: "Access granted to TrackMotors Workshop.",
        });
        router.push("/");
        router.refresh();
      } else {
        toast.error("Access Denied", {
          description: data.error || "Incorrect Passcode.",
        });
      }
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden flex items-center justify-center font-sans select-none">
      {/* Background Cyberpunk Ambient Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ========================================================= */}
      {/* 🚀 CRAZY INTRO ANIMATION OVERLAY                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6"
          >
            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowIntro(false)}
              className="absolute top-8 right-8 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-400 hover:text-white hover:border-emerald-500 transition-colors shadow-lg cursor-pointer"
            >
              Skip Intro [ESC]
            </motion.button>

            {/* Central Animated Blast */}
            <div className="flex flex-col items-center justify-center text-center max-w-lg space-y-6">
              {/* Tachometer / Revving Gauge */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative flex items-center justify-center"
              >
                {/* Glowing Outer Ring */}
                <div className="w-36 h-36 rounded-full border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative">
                  <div className="absolute inset-1 rounded-full border border-teal-400/20 animate-spin" style={{ animationDuration: "6s" }} />

                  {/* Bike Icon in center */}
                  <motion.div
                    animate={{
                      y: [0, -3, 0],
                      rotate: [0, 1, -1, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                  >
                    <Bike className="w-9 h-9 text-white" />
                  </motion.div>
                </div>

                {/* RPM Counter Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-3 px-3 py-1 bg-slate-900 border border-emerald-500/50 rounded-full text-xs font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1.5 shadow-md"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{rpm.toLocaleString()} RPM</span>
                </motion.div>
              </motion.div>

              {/* Title Reveal */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-2"
              >
                <div className="relative inline-block">
                  <h1 className="text-5xl sm:text-6xl font-black tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]">
                    TrackMotors
                  </h1>
                  <span className="absolute -top-3 -right-6 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500 text-slate-950 tracking-widest shadow-lg shadow-emerald-500/40">
                    Pro
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-emerald-400/90 flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Workshop & Financial Intelligence</span>
                </p>
              </motion.div>

              {/* Progress bar firing up */}
              <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                />
              </div>

              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-[11px] text-slate-500 tracking-wider font-mono uppercase"
              >
                Initializing Engine & Cloud Systems...
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 🔐 WORKSHOP SAFETY LOGIN CARD                             */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_#10b981]" />

          {/* Workshop Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/10 mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>TrackMotors</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Secured
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Workshop Safety Lock. Enter your workshop master password to access financial ledger & services.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Workshop Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  required
                  placeholder="Enter workshop password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 tracking-wider focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action helpers */}
              <div className="mt-3 flex items-center justify-end text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowIntro(true)}
                  className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Replay Intro</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Workshop</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Safety Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Protected internal workshop management system
          </div>
        </div>
      </motion.div>
    </div>
  );
}
