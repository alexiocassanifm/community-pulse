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

interface SkillEntry {
  category: string; // normalized skill name (lowercase)
  count: number;
  percentage: number;
}

interface SkillsVisualizationProps {
  data: SkillEntry[];
}

function getBarColor(index: number, total: number): string {
  const colors = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"];
  const step = Math.min(
    Math.floor((index / Math.max(total - 1, 1)) * (colors.length - 1)),
    colors.length - 1
  );
  return colors[step];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SkillEntry & { displayName: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{entry.displayName}</p>
      <p className="text-muted-foreground">
        {entry.count} {entry.count === 1 ? "participant" : "participants"} (
        {entry.percentage}%)
      </p>
    </div>
  );
}

export function SkillsVisualization({ data }: SkillsVisualizationProps) {
  const height = Math.max(data.length * 40 + 16, 150);

  // Format the data for display
  const displayData = data.map((d) => ({
    ...d,
    displayName: d.category.charAt(0).toUpperCase() + d.category.slice(1),
  }));

  return (
    <div
      role="img"
      aria-label={`Bar chart showing skill distribution: ${data.map((d) => `${d.category} ${d.count}`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={displayData}
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
            dataKey="displayName"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--muted))" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36}>
            {displayData.map((_, index) => (
              <Cell key={index} fill={getBarColor(index, displayData.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-3">
        Showing top {data.length} skills. Skills are normalized
        (case-insensitive).
      </p>
    </div>
  );
}
