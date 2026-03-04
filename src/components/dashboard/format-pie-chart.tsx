"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS, ChartTooltip } from "./chart-primitives";

interface FormatChartEntry {
  name: string;
  key: string;
  count: number;
  percentage: number;
}

interface FormatPieChartProps {
  data: FormatChartEntry[];
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
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip<FormatChartEntry> />} />
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
