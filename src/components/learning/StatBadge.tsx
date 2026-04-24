import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "expert" | "strong" | "focus";
  className?: string;
}

export function StatCard({ label, value, hint, accent = "primary", className }: StatCardProps) {
  const accentMap = {
    primary: "text-primary",
    expert: "text-tier-expert",
    strong: "text-tier-very-strong",
    focus: "text-tier-focus",
  } as const;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 p-5",
        "bg-[linear-gradient(135deg,oklch(1_0_0/0.06),oklch(1_0_0/0.02))]",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_8px_32px_-12px_oklch(0.1_0.02_260/0.6),inset_0_1px_0_0_oklch(1_0_0/0.08)]",
        "transition-all hover:border-white/20 hover:shadow-[0_12px_40px_-12px_oklch(0.75_0.16_230/0.25),inset_0_1px_0_0_oklch(1_0_0/0.12)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at 30% 0%, oklch(0.75 0.16 230 / 0.12), transparent 60%)" }}
      />
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-3xl font-bold tabular-nums", accentMap[accent])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

import type { Tier } from "@/lib/memory-engine";

const TIER_STYLES: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  "tier-expert": {
    text: "text-[oklch(0.7_0.21_305)]",
    bg: "bg-[oklch(0.7_0.21_305/0.12)]",
    border: "border-[oklch(0.7_0.21_305/0.35)]",
    dot: "bg-[oklch(0.7_0.21_305)]",
  },
  "tier-very-strong": {
    text: "text-[oklch(0.72_0.19_145)]",
    bg: "bg-[oklch(0.72_0.19_145/0.12)]",
    border: "border-[oklch(0.72_0.19_145/0.35)]",
    dot: "bg-[oklch(0.72_0.19_145)]",
  },
  "tier-strong": {
    text: "text-[oklch(0.78_0.2_130)]",
    bg: "bg-[oklch(0.78_0.2_130/0.12)]",
    border: "border-[oklch(0.78_0.2_130/0.35)]",
    dot: "bg-[oklch(0.78_0.2_130)]",
  },
  "tier-weak": {
    text: "text-[oklch(0.82_0.17_90)]",
    bg: "bg-[oklch(0.82_0.17_90/0.12)]",
    border: "border-[oklch(0.82_0.17_90/0.35)]",
    dot: "bg-[oklch(0.82_0.17_90)]",
  },
  "tier-very-weak": {
    text: "text-[oklch(0.72_0.19_50)]",
    bg: "bg-[oklch(0.72_0.19_50/0.12)]",
    border: "border-[oklch(0.72_0.19_50/0.35)]",
    dot: "bg-[oklch(0.72_0.19_50)]",
  },
  "tier-focus": {
    text: "text-[oklch(0.65_0.22_25)]",
    bg: "bg-[oklch(0.65_0.22_25/0.12)]",
    border: "border-[oklch(0.65_0.22_25/0.35)]",
    dot: "bg-[oklch(0.65_0.22_25)]",
  },
};

export function getTierStyle(colorVar: string) {
  return TIER_STYLES[colorVar] ?? TIER_STYLES["tier-focus"];
}

export function TierBadge({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  const s = getTierStyle(tier.colorVar);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold uppercase tracking-wider",
        compact ? "text-[10px]" : "text-xs",
        s.text,
        s.bg,
        s.border
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {tier.label}
    </span>
  );
}