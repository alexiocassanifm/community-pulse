"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvailabilityProps {
  form: UseFormReturn<AnonymousFormData>;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMES: Array<{
  value: "morning" | "afternoon" | "evening" | "flexible";
  label: string;
}> = [
  { value: "morning", label: "Morning (9am - 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm - 5pm)" },
  { value: "evening", label: "Evening (5pm - 9pm)" },
  { value: "flexible", label: "Flexible / No Preference" },
];

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export function Availability({ form }: AvailabilityProps) {
  const { setValue, watch } = form;
  const preferredDays = watch("availability.preferred_days") || [];
  const preferredTimes = watch("availability.preferred_times") || [];
  const frequency = watch("availability.frequency");

  const toggleDay = (day: string) => {
    const current = [...preferredDays];
    const index = current.indexOf(day);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    setValue("availability.preferred_days", current, { shouldDirty: true });
  };

  const toggleTime = (time: "morning" | "afternoon" | "evening" | "flexible") => {
    const current = [...preferredTimes];
    const index = current.indexOf(time);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(time);
    }
    setValue("availability.preferred_times", current, {
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Availability</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let us know when you&apos;re available for events. All fields are optional.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Preferred Days</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => toggleDay(day)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDay(day);
                  }
                }}
                role="checkbox"
                aria-checked={preferredDays.includes(day)}
                aria-labelledby={`day-label-${day}`}
                tabIndex={0}
              >
                <Checkbox
                  checked={preferredDays.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <span id={`day-label-${day}`} className="text-sm">{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Preferred Times</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIMES.map((time) => (
              <div
                key={time.value}
                className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => toggleTime(time.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTime(time.value);
                  }
                }}
                role="checkbox"
                aria-checked={preferredTimes.includes(time.value)}
                aria-labelledby={`time-label-${time.value}`}
                tabIndex={0}
              >
                <Checkbox
                  checked={preferredTimes.includes(time.value)}
                  onCheckedChange={() => toggleTime(time.value)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <span id={`time-label-${time.value}`} className="text-sm">{time.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Preferred Frequency</Label>
          <Select
            value={frequency || ""}
            onValueChange={(value) =>
              setValue(
                "availability.frequency",
                value as "weekly" | "biweekly" | "monthly" | "quarterly",
                { shouldDirty: true }
              )
            }
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="How often would you attend?" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
