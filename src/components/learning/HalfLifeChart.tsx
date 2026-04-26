import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { TIERS, getTier, type Word } from "@/lib/memory-engine";
import { getTierStyle } from "./StatBadge";

interface Props {
  vocab: Word[];
}

// Resolve the tier oklch color into a concrete CSS color string Recharts can read.
function tierFill(colorVar: string): string {
  const map: Record<string, string> = {
    "tier-expert": "oklch(0.7 0.21 305)",
    "tier-very-strong": "oklch(0.72 0.19 145)",
    "tier-strong": "oklch(0.78 0.2 130)",
    "tier-weak": "oklch(0.82 0.17 90)",
    "tier-very-weak": "oklch(0.72 0.19 50)",
    "tier-focus": "oklch(0.65 0.22 25)",
  };
  return map[colorVar] ?? map["tier-focus"];
}

export function HalfLifeChart({ vocab }: Props) {
  const learned = vocab.filter((w) => w.learned);

  // Count words per tier (memory stability buckets)
  const counts: Record<string, number> = {};
  for (const t of TIERS) counts[t.key] = 0;
  for (const w of learned) {
    const t = getTier(w.h);
    counts[t.key] += 1;
  }

  // Order from weakest to strongest so the visualization reads as a "growth ladder"
  const ordered = [
    TIERS.find((t) => t.key === "FOCUS")!,
    TIERS.find((t) => t.key === "VERY WEAK")!,
    TIERS.find((t) => t.key === "WEAK")!,
    TIERS.find((t) => t.key === "STRONG")!,
    TIERS.find((t) => t.key === "VERY STRONG")!,
    TIERS.find((t) => t.key === "EXPERT")!,
  ];

  const data = ordered.map((t) => ({
    tier: t.label,
    count: counts[t.key],
    fill: tierFill(t.colorVar),
  }));

  const total = learned.length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Half-Life Distribution</h3>
          <p className="text-xs text-muted-foreground">
            How your learned words are spread across stability tiers
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-primary">{total}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">learned</div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 260)" />
            <XAxis
              dataKey="tier"
              stroke="oklch(0.7 0.02 255)"
              fontSize={10}
              interval={0}
            />
            <YAxis
              stroke="oklch(0.7 0.02 255)"
              fontSize={11}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
              contentStyle={{
                background: "oklch(0.22 0.025 260)",
                border: "1px solid oklch(0.32 0.03 260)",
                borderRadius: 12,
                fontSize: 12,
                color: "oklch(0.97 0.01 250)",
              }}
              formatter={(v: number) => [`${v} words`, "Count"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}