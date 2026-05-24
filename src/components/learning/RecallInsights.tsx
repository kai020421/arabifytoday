import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { Word } from "@/lib/memory-engine";
import { getRecallProbability, getTier, TIERS } from "@/lib/memory-engine";

const HORIZONS: { label: string; seconds: number }[] = [
  { label: "Now", seconds: 0 },
  { label: "1h", seconds: 3600 },
  { label: "6h", seconds: 6 * 3600 },
  { label: "1d", seconds: 86400 },
  { label: "3d", seconds: 3 * 86400 },
  { label: "7d", seconds: 7 * 86400 },
  { label: "14d", seconds: 14 * 86400 },
  { label: "30d", seconds: 30 * 86400 },
];

const TIER_COLORS: Record<string, string> = {
  "tier-expert": "oklch(0.7 0.21 305)",
  "tier-very-strong": "oklch(0.72 0.19 145)",
  "tier-strong": "oklch(0.78 0.2 130)",
  "tier-weak": "oklch(0.82 0.17 90)",
  "tier-very-weak": "oklch(0.72 0.19 50)",
  "tier-focus": "oklch(0.65 0.22 25)",
};

export function RecallTimeline({ vocab }: { vocab: Word[] }) {
  const data = useMemo(() => {
    const learned = vocab.filter((w) => w.learned);
    const now = Date.now() / 1000;
    return HORIZONS.map(({ label, seconds }) => {
      if (learned.length === 0) return { label, recall: 0, forget: 100 };
      let sum = 0;
      for (const w of learned) sum += getRecallProbability(w, now + seconds);
      const recall = Math.round((sum / learned.length) * 100);
      return { label, recall, forget: 100 - recall };
    });
  }, [vocab]);

  const current = data[0]?.recall ?? 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recall Timeline</h3>
          <p className="text-xs text-muted-foreground">
            Projected average recall across the next 30 days
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-primary">{current}%</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">now</div>
        </div>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 260)" />
            <XAxis dataKey="label" stroke="oklch(0.7 0.02 255)" fontSize={11} />
            <YAxis
              stroke="oklch(0.7 0.02 255)"
              fontSize={11}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.22 0.025 260)",
                border: "1px solid oklch(0.32 0.03 260)",
                borderRadius: 12,
                fontSize: 12,
                color: "oklch(0.97 0.01 250)",
              }}
              formatter={(v: any, n: any) => [`${v}%`, n === "recall" ? "Remember" : "Forget"]}
            />
            <Line
              type="monotone"
              dataKey="recall"
              stroke="oklch(0.72 0.19 145)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "oklch(0.72 0.19 145)" }}
            />
            <Line
              type="monotone"
              dataKey="forget"
              stroke="oklch(0.65 0.22 25)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.72_0.19_145)]" /> Remember
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.65_0.22_25)]" /> Forget
        </span>
      </div>
    </div>
  );
}

export function TierRecallImpact({ vocab }: { vocab: Word[] }) {
  const data = useMemo(() => {
    const now = Date.now() / 1000;
    const horizon = now + 86400;
    const buckets = TIERS.map((t) => ({
      tier: t.label,
      colorVar: t.colorVar,
      count: 0,
      sum: 0,
    }));
    for (const w of vocab) {
      if (!w.learned) continue;
      const t = getTier(w.h);
      const idx = TIERS.findIndex((x) => x.key === t.key);
      if (idx < 0) continue;
      buckets[idx].count += 1;
      buckets[idx].sum += getRecallProbability(w, horizon);
    }
    return buckets.map((b) => ({
      tier: b.tier,
      colorVar: b.colorVar,
      recall: b.count === 0 ? 0 : Math.round((b.sum / b.count) * 100),
      count: b.count,
    }));
  }, [vocab]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Per-Tier Recall Impact</h3>
        <p className="text-xs text-muted-foreground">
          Avg projected recall (24h) for words in each stability tier
        </p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 260)" />
            <XAxis dataKey="tier" stroke="oklch(0.7 0.02 255)" fontSize={10} />
            <YAxis
              stroke="oklch(0.7 0.02 255)"
              fontSize={11}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.22 0.025 260)",
                border: "1px solid oklch(0.32 0.03 260)",
                borderRadius: 12,
                fontSize: 12,
                color: "oklch(0.97 0.01 250)",
              }}
              formatter={(v: any, _n: any, p: any) => [
                `${v}% recall · ${p?.payload?.count ?? 0} words`,
                p?.payload?.tier ?? "",
              ]}
            />
            <Bar dataKey="recall" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={TIER_COLORS[d.colorVar] ?? "oklch(0.75 0.16 230)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] sm:grid-cols-6">
        {data.map((d) => (
          <div
            key={d.tier}
            className="rounded-lg border border-border/50 bg-background/30 px-2 py-1.5"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: TIER_COLORS[d.colorVar] }}
              />
              <span className="truncate">{d.tier}</span>
            </div>
            <div className="mt-0.5 font-mono tabular-nums text-foreground">
              {d.recall}% · {d.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}