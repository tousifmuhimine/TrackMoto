import React from "react";

interface Carbon8LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withGlow?: boolean;
}

export function Carbon8Logo({
  size = "md",
  className = "",
  withGlow = true,
}: Carbon8LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-2xl",
    xl: "w-20 h-20 text-3xl",
  }[size];

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br from-neutral-900 via-slate-950 to-black flex items-center justify-center font-black tracking-tighter border border-red-500/40 ${
        withGlow ? "shadow-lg shadow-red-950/60" : ""
      } overflow-hidden shrink-0 select-none ${sizeClasses} ${className}`}
    >
      {/* Carbon fiber weave pattern */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)",
          backgroundSize: "6px 6px",
          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
        }}
      />

      {/* Top red speed laser line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      {/* Monogram: White C, Bold Red 8 */}
      <span className="relative z-10 flex items-center">
        <span className="text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          C
        </span>
        <span className="text-red-500 font-black drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]">
          8
        </span>
      </span>
    </div>
  );
}

export function Carbon8BrandName({
  size = "lg",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
    hero: "text-5xl sm:text-6xl",
  }[size];

  return (
    <span className={`font-black tracking-tight uppercase ${sizeClasses} ${className}`}>
      <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">Carbon</span>
      <span className="text-red-500 ml-1.5 font-black drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">8</span>
    </span>
  );
}
