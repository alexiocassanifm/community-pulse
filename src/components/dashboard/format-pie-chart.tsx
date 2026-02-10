"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

interface FormatPieChartProps {
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

export function FormatPieChart({ data }: FormatPieChartProps) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No format preferences selected
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Pie chart showing format preferences: ${filtered.map((d) => `${d.name} ${d.percentage}%`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, payload }) => {
              const pct = (payload as FormatChartEntry | undefined)?.percentage ?? 0;
              return `${name} (${pct}%)`;
            }}
            labelLine
          >
            {filtered.map((entry, index) => (
              <Cell
                key={`cell-${entry.key}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
