"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { ChartTooltip } from "./chart-primitives";

interface RoleEntry {
  category: string;
  count: number;
  percentage: number;
}

interface RoleBreakdownChartProps {
  data: RoleEntry[];
}

export function RoleBreakdownChart({ data }: RoleBreakdownChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const height = Math.max(sorted.length * 48 + 16, 150);
  const top3 = sorted.slice(0, 3);

  return (
    <div className="space-y-6">
      <div
        role="img"
        aria-label={`Bar chart showing role breakdown: ${sorted.map((d) => `${d.category} ${d.count}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={sorted}
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
              dataKey="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <Tooltip
              content={
                <ChartTooltip<RoleEntry>
                  labelKey="category"
                  formatter={(entry) => (
                    <>
                      <p className="font-medium">{entry.category}</p>
                      <p className="text-muted-foreground">
                        {entry.count} {entry.count === 1 ? "participant" : "participants"} (
                        {entry.percentage}%)
                      </p>
                    </>
                  )}
                />
              }
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((role, index) => (
            <div
              key={role.category}
              className="rounded-lg border bg-muted/50 p-3"
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    index === 0 && "bg-yellow-500 text-yellow-950",
                    index === 1 && "bg-gray-400 text-gray-950",
                    index === 2 && "bg-amber-700 text-amber-50"
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {role.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {role.count} ({role.percentage}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
