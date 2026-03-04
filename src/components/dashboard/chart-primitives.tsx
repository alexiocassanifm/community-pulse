"use client";

import type { ReactNode } from "react";

export const CHART_COLORS = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#dc2626", // red-600
];

interface ChartTooltipProps<T = Record<string, any>> {
  active?: boolean;
  payload?: Array<{ payload: T }>;
  labelKey?: string;
  countKey?: string;
  percentageKey?: string;
  formatter?: (entry: T) => ReactNode;
}

export function ChartTooltip<T extends Record<string, any>>({
  active,
  payload,
  labelKey = "name",
  countKey = "count",
  percentageKey = "percentage",
  formatter,
}: ChartTooltipProps<T>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;

  if (formatter) {
    return (
      <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
        {formatter(entry)}
      </div>
    );
  }

  const label = entry[labelKey];
  const count = entry[countKey];
  const percentage = entry[percentageKey];

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} {count === 1 ? "response" : "responses"} (
        {percentage}%)
      </p>
    </div>
  );
}
