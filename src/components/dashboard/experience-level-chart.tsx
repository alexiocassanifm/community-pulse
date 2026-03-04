"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { cn } from "@/lib/utils";
import { ChartTooltip } from "./chart-primitives";

interface ExperienceEntry {
  category: string;
  count: number;
  percentage: number;
}

interface ExperienceLevelChartProps {
  data: ExperienceEntry[];
}

const EXPERIENCE_COLORS: Record<string, string> = {
  junior: "#10b981",    // green-500
  mid: "#3b82f6",       // blue-500
  senior: "#f59e0b",    // amber-500
  lead: "#ef4444",      // red-500
  executive: "#8b5cf6", // purple-500
};

const LEVEL_ORDER = ["junior", "mid", "senior", "lead", "executive"];

export function ExperienceLevelChart({ data }: ExperienceLevelChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Sort data by career progression order
  const sorted = LEVEL_ORDER
    .map(level => data.find(d => d.category === level))
    .filter((d): d is ExperienceEntry => d !== undefined);

  // Calculate summary statistics
  const totalResponses = sorted.reduce((sum, entry) => sum + entry.count, 0);
  const mostCommon = sorted.reduce((max, entry) =>
    entry.count > max.count ? entry : max
  , sorted[0] || { category: "N/A", count: 0, percentage: 0 });

  const seniorPlus = sorted
    .filter(entry => ["senior", "lead", "executive"].includes(entry.category))
    .reduce((sum, entry) => sum + entry.count, 0);
  const seniorPlusPercentage = totalResponses > 0
    ? Math.round((seniorPlus / totalResponses) * 100)
    : 0;

  const earlyCareer = sorted
    .filter(entry => ["junior", "mid"].includes(entry.category))
    .reduce((sum, entry) => sum + entry.count, 0);
  const earlyCareerPercentage = totalResponses > 0
    ? Math.round((earlyCareer / totalResponses) * 100)
    : 0;

  return (
    <div>
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setChartType("bar")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            chartType === "bar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType("pie")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            chartType === "pie" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Pie Chart
        </button>
      </div>

      <div
        role="img"
        aria-label={`${chartType === "bar" ? "Bar" : "Pie"} chart showing experience level distribution: ${sorted.map((d) => `${d.category} ${d.count}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "bar" ? (
            <BarChart
              data={sorted}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={
                  <ChartTooltip<ExperienceEntry>
                    labelKey="category"
                    formatter={(entry) => (
                      <>
                        <p className="font-medium capitalize">{entry.category}</p>
                        <p className="text-muted-foreground">
                          {entry.count} {entry.count === 1 ? "participant" : "participants"} ({entry.percentage}%)
                        </p>
                      </>
                    )}
                  />
                }
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {sorted.map((entry) => (
                  <Cell key={entry.category} fill={EXPERIENCE_COLORS[entry.category] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={sorted}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => `${entry.category} ${entry.percentage}%`}
              >
                {sorted.map((entry) => (
                  <Cell key={entry.category} fill={EXPERIENCE_COLORS[entry.category] ?? "#6b7280"} />
                ))}
              </Pie>
              <Tooltip
                content={
                  <ChartTooltip<ExperienceEntry>
                    labelKey="category"
                    formatter={(entry) => (
                      <>
                        <p className="font-medium capitalize">{entry.category}</p>
                        <p className="text-muted-foreground">
                          {entry.count} {entry.count === 1 ? "participant" : "participants"} ({entry.percentage}%)
                        </p>
                      </>
                    )}
                  />
                }
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div>
          <p className="text-xs text-muted-foreground">Most Common</p>
          <p className="font-bold capitalize">{mostCommon.category}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Senior+ %</p>
          <p className="font-bold">{seniorPlusPercentage}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Early Career %</p>
          <p className="font-bold">{earlyCareerPercentage}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Responses</p>
          <p className="font-bold">{totalResponses}</p>
        </div>
      </div>
    </div>
  );
}
