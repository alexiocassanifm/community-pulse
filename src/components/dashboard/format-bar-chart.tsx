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
import { CHART_COLORS, ChartTooltip } from "./chart-primitives";

interface FormatChartEntry {
  name: string;
  key: string;
  count: number;
  percentage: number;
}

interface FormatBarChartProps {
  data: FormatChartEntry[];
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
          <Tooltip content={<ChartTooltip<FormatChartEntry> />} cursor={{ fill: "hsl(var(--muted))" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
