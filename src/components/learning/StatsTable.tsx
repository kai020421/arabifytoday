import { useMemo, useState } from "react";
import type { Word } from "@/lib/memory-engine";
import { getRecallProbability, getTier } from "@/lib/memory-engine";
import { TierBadge } from "./StatBadge";

type SortKey = "tier" | "recall" | "h" | "level";

export function StatsTable({ vocab }: { vocab: Word[] }) {
  const [filter, setFilter] = useState<"all" | "learned" | "unlearned">("all");
  const [sort, setSort] = useState<SortKey>("recall");

  const rows = useMemo(() => {
    const now = Date.now() / 1000;
    let list = vocab.map((w) => ({
      w,
      p: getRecallProbability(w, now),
      tier: getTier(w.h),
    }));
    if (filter === "learned") list = list.filter((r) => r.w.learned);
    if (filter === "unlearned") list = list.filter((r) => !r.w.learned);
    list.sort((a, b) => {
      if (sort === "recall") return a.p - b.p;
      if (sort === "h") return b.w.h - a.w.h;
      if (sort === "level") return a.w.level.localeCompare(b.w.level);
      return b.w.h - a.w.h;
    });
    return list.slice(0, 60);
  }, [vocab, filter, sort]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold">Word Stability</h3>
          <p className="text-xs text-muted-foreground">Showing top {rows.length} words</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButtons value={filter} onChange={setFilter} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="recall">Sort: Lowest recall</option>
            <option value="h">Sort: Highest half-life</option>
            <option value="level">Sort: Level</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Word</th>
              <th className="px-5 py-3 font-medium">Translation</th>
              <th className="px-5 py-3 font-medium">Level</th>
              <th className="px-5 py-3 font-medium text-right">Recall</th>
              <th className="px-5 py-3 font-medium text-right">H-Life</th>
              <th className="px-5 py-3 font-medium">Stability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ w, p, tier }) => {
              const pct = Math.round(p * 100);
              const lowRecall = pct < 50;
              return (
                <tr key={w.id} className="border-t border-border/40 transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3">
                    <span dir="rtl" lang="ar" className="text-lg font-bold text-primary text-teal-200">
                      {w.target}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground/80">{w.known}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{w.level}</td>
                  <td className={`px-5 py-3 text-right font-mono tabular-nums ${lowRecall ? "text-[oklch(0.65_0.22_25)]" : "text-[oklch(0.72_0.19_145)]"}`}>
                    {w.lastSeen === 0 ? "—" : `${pct}%`}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-foreground/70">
                    {w.h.toFixed(2)}d
                  </td>
                  <td className="px-5 py-3"><TierBadge tier={tier} compact /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterButtons({
  value,
  onChange,
}: {
  value: "all" | "learned" | "unlearned";
  onChange: (v: "all" | "learned" | "unlearned") => void;
}) {
  const opts: { v: typeof value; label: string }[] = [
    { v: "all", label: "All" },
    { v: "learned", label: "Learned" },
    { v: "unlearned", label: "New" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-border bg-background/40 p-0.5">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            value === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}