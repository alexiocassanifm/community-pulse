"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";
import { Calendar, Filter } from "lucide-react";
import type { SegmentFilters } from "@/components/dashboard/SegmentFilter";

interface AvailabilityCell {
  day: string;
  time: string;
  count: number;
  percentage: number;
}

interface AvailabilityData {
  data: AvailabilityCell[];
  totalSubmissions: number;
  insufficientData: boolean;
}

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

const TIME_SLOTS = [
  { key: "morning", label: "Morning (8-12)" },
  { key: "afternoon", label: "Afternoon (12-17)" },
  { key: "evening", label: "Evening (17-22)" },
] as const;

const DAY_FULL_NAMES: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const TIME_FULL_NAMES: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function getCellColor(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) return "bg-gray-50 dark:bg-gray-900";
  const ratio = count / maxCount;
  if (ratio <= 0.2) return "bg-sky-100";
  if (ratio <= 0.4) return "bg-sky-200";
  if (ratio <= 0.6) return "bg-sky-300";
  if (ratio <= 0.8) return "bg-sky-500 text-white";
  return "bg-sky-700 text-white";
}

function HeatmapSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-2">
            <div />
            {DAYS.map((d) => (
              <div
                key={d.key}
                className="h-4 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
          {TIME_SLOTS.map((t) => (
            <div key={t.key} className="grid grid-cols-8 gap-2">
              <div className="h-10 animate-pulse rounded bg-muted" />
              {DAYS.map((d) => (
                <div
                  key={d.key}
                  className="h-10 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AvailabilityHeatmapProps {
  filters?: SegmentFilters;
}

export function AvailabilityHeatmap({ filters }: AvailabilityHeatmapProps) {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    cell: AvailabilityCell;
    x: number;
    y: number;
  } | null>(null);

  const activeFilterCount = filters
    ? [filters.role, filters.experienceLevel, filters.industry].filter(Boolean)
        .length
    : 0;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters?.role) params.set("role", filters.role);
        if (filters?.experienceLevel)
          params.set("experienceLevel", filters.experienceLevel);
        if (filters?.industry) params.set("industry", filters.industry);
        const qs = params.toString();
        const url = `/api/analytics/availability${qs ? `?${qs}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch availability data");
        const json: AvailabilityData = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters?.role, filters?.experienceLevel, filters?.industry]);

  const handleMouseEnter = useCallback(
    (cell: AvailabilityCell, e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        cell,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  if (loading) return <HeatmapSkeleton />;

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalSubmissions === 0) {
    return (
      <EmptyState
        title="No Availability Data"
        description="Availability data will appear here once participants submit their preferences."
        icon={Calendar}
      />
    );
  }

  const cellMap = new Map<string, AvailabilityCell>();
  for (const cell of data.data) {
    cellMap.set(`${cell.day}|${cell.time}`, cell);
  }

  const maxCount = Math.max(...data.data.map((c) => c.count), 0);

  return (
    <div className="space-y-4">
      {data.insufficientData && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Data based on fewer than 10 submissions. Results may not be
          representative.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Day &amp; Time Preferences
            </CardTitle>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900 dark:text-sky-200">
                <Filter className="h-3 w-3" />
                Filtered ({data?.totalSubmissions ?? 0})
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Heatmap grid */}
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
              {/* Header row: empty corner + day labels */}
              <div />
              {DAYS.map((day) => (
                <div
                  key={day.key}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {day.label}
                </div>
              ))}

              {/* Data rows */}
              {TIME_SLOTS.map((slot) => (
                <React.Fragment key={slot.key}>
                  <div
                    className="flex items-center text-xs font-medium text-muted-foreground pr-1 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">{slot.label}</span>
                    <span className="sm:hidden">
                      {slot.label.split(" ")[0]}
                    </span>
                  </div>
                  {DAYS.map((day) => {
                    const cell = cellMap.get(`${day.key}|${slot.key}`);
                    const count = cell?.count ?? 0;
                    const percentage = cell?.percentage ?? 0;
                    const tooltipText = `${DAY_FULL_NAMES[day.key]}, ${TIME_FULL_NAMES[slot.key]} \u2022 ${count} participants (${percentage}%)`;

                    return (
                      <div
                        key={`${day.key}-${slot.key}`}
                        className={cn(
                          "flex items-center justify-center rounded-md aspect-[4/3] min-h-[2.5rem] text-sm font-medium transition-transform hover:scale-105 cursor-default",
                          getCellColor(count, maxCount)
                        )}
                        title={tooltipText}
                        onMouseEnter={(e) =>
                          cell && handleMouseEnter(cell, e)
                        }
                        onMouseLeave={handleMouseLeave}
                        role="gridcell"
                        aria-label={tooltipText}
                      >
                        {count}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full"
                style={{ left: tooltip.x, top: tooltip.y - 8 }}
              >
                <div className="rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md border">
                  {DAY_FULL_NAMES[tooltip.cell.day]},{" "}
                  {TIME_FULL_NAMES[tooltip.cell.time]} &bull;{" "}
                  {tooltip.cell.count} participants ({tooltip.cell.percentage}%)
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-6 rounded-sm bg-gray-50 dark:bg-gray-900 border border-border" />
              <div className="h-3 w-6 rounded-sm bg-sky-100" />
              <div className="h-3 w-6 rounded-sm bg-sky-200" />
              <div className="h-3 w-6 rounded-sm bg-sky-300" />
              <div className="h-3 w-6 rounded-sm bg-sky-500" />
              <div className="h-3 w-6 rounded-sm bg-sky-700" />
            </div>
            <span>High</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
