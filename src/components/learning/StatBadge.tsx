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
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm",
        "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)] transition-all hover:border-border",
        className
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-3xl font-bold tabular-nums", accentMap[accent])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

import type { Tier } from "@/lib/memory-engine";

export function TierBadge({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  const colorClass = `text-${tier.colorVar}`;
  const bgClass = `bg-${tier.colorVar}/10`;
  const borderClass = `border-${tier.colorVar}/30`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold uppercase tracking-wider",
        compact ? "text-[10px]" : "text-xs",
        colorClass,
        bgClass,
        borderClass
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", `bg-${tier.colorVar}`)} />
      {tier.label}
    </span>
  );
}