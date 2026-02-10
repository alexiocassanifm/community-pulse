"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#0891b2", // cyan-600  (In Person)
  "#7c3aed", // violet-600 (Virtual)
  "#059669", // emerald-600 (Hybrid)
  "#94a3b8", // slate-400  (No Preference)
];

interface HybridChartEntry {
  name: string;
  key: string;
  count: number;
  percentage: number;
}

interface HybridPreferenceChartProps {
  data: HybridChartEntry[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: HybridChartEntry }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{entry.name}</p>
      <p className="text-muted-foreground">
        {entry.count} {entry.count === 1 ? "response" : "responses"} (
        {entry.percentage}%)
      </p>
    </div>
  );
}

export function HybridPreferenceChart({ data }: HybridPreferenceChartProps) {
  return (
    <div
      role="img"
      aria-label={`Bar chart showing delivery mode preferences: ${data.map((d) => `${d.name} ${d.count}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        >
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
