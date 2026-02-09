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
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#dc2626", // red-600
];

interface FormatChartEntry {
  name: string;
  key: string;
  count: number;
  percentage: number;
}

interface FormatBarChartProps {
  data: FormatChartEntry[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FormatChartEntry }>;
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

export function FormatBarChart({ data }: FormatBarChartProps) {
  return (
    <div
      role="img"
      aria-label={`Bar chart showing format preferences: ${data.map((d) => `${d.name} ${d.count}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
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
