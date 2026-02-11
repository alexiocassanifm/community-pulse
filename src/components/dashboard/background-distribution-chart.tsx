"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS: Record<string, string> = {
  tech: "#2563eb",
  business: "#7c3aed",
  design: "#0891b2",
  other: "#6b7280",
};

const LABELS: Record<string, string> = {
  tech: "Tech / Engineering",
  business: "Business / Management",
  design: "Design / Creative",
  other: "Other",
};

interface BackgroundEntry {
  value: string;
  count: number;
  percentage: number;
}

interface BackgroundDistributionChartProps {
  data: BackgroundEntry[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BackgroundEntry & { name: string } }>;
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

export function BackgroundDistributionChart({
  data,
}: BackgroundDistributionChartProps) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      ...d,
      name: LABELS[d.value] ?? d.value,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
        No background data available
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Pie chart showing background distribution: ${chartData.map((d) => `${d.name} ${d.percentage}%`).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={85}
            label={({ name, payload }) => {
              const pct =
                (payload as (typeof chartData)[number] | undefined)
                  ?.percentage ?? 0;
              return `${name} (${pct}%)`;
            }}
            labelLine
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.value}`}
                fill={COLORS[entry.value] ?? "#6b7280"}
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
