"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./chart-primitives";

interface TopicChartEntry {
  id: string;
  topic: string;
  count: number;
  percentage: number;
}

interface TopicCategoryChartProps {
  data: TopicChartEntry[];
  color: string;
}

export function TopicCategoryChart({ data, color }: TopicCategoryChartProps) {
  const height = Math.max(data.length * 48 + 16, 150);

  return (
    <div
      role="img"
      aria-label={`Bar chart showing topic preferences: ${data.map((d) => `${d.topic} ${d.count}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={height}>
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
            dataKey="topic"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip
            content={<ChartTooltip<TopicChartEntry> labelKey="topic" />}
            cursor={{ fill: "hsl(var(--muted))" }}
          />
          <Bar
            dataKey="count"
            fill={color}
            radius={[0, 4, 4, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
