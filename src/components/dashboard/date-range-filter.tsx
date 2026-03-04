"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onDateChange: (startDate: string | null, endDate: string | null) => void;
  startDate: string | null;
  endDate: string | null;
}

type QuickPreset = {
  label: string;
  days: number | null;
};

const QUICK_PRESETS: QuickPreset[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "All Time", days: null },
];

function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getActivePreset(
  startDate: string | null,
  endDate: string | null
): string | null {
  if (!startDate && !endDate) return "All Time";
  for (const preset of QUICK_PRESETS) {
    if (preset.days === null) continue;
    if (
      startDate === getDateNDaysAgo(preset.days) &&
      endDate === getTodayString()
    ) {
      return preset.label;
    }
  }
  return null;
}

export function DateRangeFilter({
  onDateChange,
  startDate,
  endDate,
}: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const activePreset = getActivePreset(startDate, endDate);
  const hasActiveFilter = startDate !== null || endDate !== null;

  function handlePreset(preset: QuickPreset) {
    setShowCustom(false);
    if (preset.days === null) {
      onDateChange(null, null);
    } else {
      onDateChange(getDateNDaysAgo(preset.days), getTodayString());
    }
  }

  function handleClear() {
    setShowCustom(false);
    onDateChange(null, null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {QUICK_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset === preset.label ? "default" : "outline"}
            size="sm"
            onClick={() => handlePreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
        <Button
          variant={showCustom ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowCustom((prev) => !prev)}
        >
          Custom
        </Button>
        {hasActiveFilter && (
          <>
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear filter</span>
            </Button>
          </>
        )}
      </div>

      {showCustom && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="trend-start-date"
              className="text-xs font-medium text-muted-foreground"
            >
              Start Date
            </label>
            <input
              id="trend-start-date"
              type="date"
              value={startDate ?? ""}
              max={endDate ?? getTodayString()}
              onChange={(e) =>
                onDateChange(e.target.value || null, endDate)
              }
              className={cn(
                "mt-1 block rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            />
          </div>
          <div>
            <label
              htmlFor="trend-end-date"
              className="text-xs font-medium text-muted-foreground"
            >
              End Date
            </label>
            <input
              id="trend-end-date"
              type="date"
              value={endDate ?? ""}
              min={startDate ?? undefined}
              max={getTodayString()}
              onChange={(e) =>
                onDateChange(startDate, e.target.value || null)
              }
              className={cn(
                "mt-1 block rounded-md border border-input bg-background px-3 py-1.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
