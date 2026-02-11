"use client";

import { useState } from "react";
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Granularity = "day" | "week" | "month";
type ChartType = "line" | "area";

interface TrendDataPoint {
  date: string;
  count: number;
}

interface TrendsChartProps {
  data: TrendDataPoint[];
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
  totalSubmissions: number;
}

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

function formatDateLabel(dateStr: string, granularity: Granularity): string {
  const date = new Date(dateStr + "T00:00:00");
  if (granularity === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function computeTrend(data: TrendDataPoint[]): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);
  const avgFirst =
    firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  const threshold = Math.max(avgFirst * 0.1, 0.5);
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "stable";
}

function TrendIndicator({ data }: { data: TrendDataPoint[] }) {
  const trend = computeTrend(data);
  const config = {
    up: { icon: TrendingUp, label: "Trending up", color: "text-emerald-600" },
    down: { icon: TrendingDown, label: "Trending down", color: "text-red-500" },
    stable: { icon: Minus, label: "Stable", color: "text-muted-foreground" },
  }[trend];

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", config.color)}>
      <config.icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function CustomTooltip({
  active,
  payload,
  granularity,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrendDataPoint }>;
  granularity: Granularity;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{formatDateLabel(entry.date, granularity)}</p>
      <p className="text-muted-foreground">
        {entry.count} {entry.count === 1 ? "submission" : "submissions"}
      </p>
    </div>
  );
}

export function TrendsChart({
  data,
  granularity,
  onGranularityChange,
  totalSubmissions,
}: TrendsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  const chartData = data.map((d) => ({
    ...d,
    label: formatDateLabel(d.date, granularity),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            {GRANULARITY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={granularity === opt.value ? "default" : "ghost"}
                size="sm"
                className="rounded-none first:rounded-l-md last:rounded-r-md"
                onClick={() => onGranularityChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center rounded-md border">
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              className="rounded-none rounded-l-md"
              onClick={() => setChartType("line")}
            >
              Line
            </Button>
            <Button
              variant={chartType === "area" ? "default" : "ghost"}
              size="sm"
              className="rounded-none rounded-r-md"
              onClick={() => setChartType("area")}
            >
              Area
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendIndicator data={data} />
          <span className="text-sm text-muted-foreground">
            {totalSubmissions} total
          </span>
        </div>
      </div>

      <div
        role="img"
        aria-label={`${chartType === "area" ? "Area" : "Line"} chart showing submission trends over time with ${data.length} data points`}
      >
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
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
              <Tooltip
                content={<CustomTooltip granularity={granularity} />}
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
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
              <Tooltip
                content={<CustomTooltip granularity={granularity} />}
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", r: 3 }}
                activeDot={{ r: 5, fill: "#2563eb" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
