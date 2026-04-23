import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { Word } from "@/lib/memory-engine";
import { buildRetentionForecast } from "@/lib/memory-engine";

interface Props {
  vocab: Word[];
  days?: number;
}

export function RetentionGraph({ vocab, days = 30 }: Props) {
  const data = buildRetentionForecast(vocab, days, 40);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Retention Forecast</h3>
          <p className="text-xs text-muted-foreground">
            Predicted average recall probability over the next {days} days
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-primary">
            {data[0]?.retention ?? 0}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">today</div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.16 230)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.75 0.16 230)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 260)" />
            <XAxis
              dataKey="day"
              stroke="oklch(0.7 0.02 255)"
              fontSize={11}
              tickFormatter={(v) => `${Math.round(v)}d`}
            />
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
              labelFormatter={(v) => `Day ${Number(v).toFixed(1)}`}
              formatter={(v: number) => [`${v}%`, "Avg recall"]}
            />
            <ReferenceLine y={50} stroke="oklch(0.65 0.22 25)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area
              type="monotone"
              dataKey="retention"
              stroke="oklch(0.75 0.16 230)"
              strokeWidth={2.5}
              fill="url(#retentionFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}