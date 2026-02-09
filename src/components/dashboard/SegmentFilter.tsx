"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface SegmentFilters {
  role: string;
  experienceLevel: string;
  industry: string;
}

interface FilterOptions {
  roles: string[];
  levels: string[];
  industries: string[];
}

const EMPTY_FILTERS: SegmentFilters = {
  role: "",
  experienceLevel: "",
  industry: "",
};

interface SegmentFilterProps {
  filters: SegmentFilters;
  onFilterChange: (filters: SegmentFilters) => void;
}

export function SegmentFilter({ filters, onFilterChange }: SegmentFilterProps) {
  const [options, setOptions] = useState<FilterOptions | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch("/api/analytics/filter-options");
        if (!res.ok) return;
        const json: FilterOptions = await res.json();
        setOptions(json);
      } catch {
        // silently fail — filters just won't show options
      }
    }
    fetchOptions();
  }, []);

  const activeCount = [filters.role, filters.experienceLevel, filters.industry].filter(Boolean).length;

  function update(key: keyof SegmentFilters, value: string) {
    onFilterChange({ ...filters, [key]: value });
  }

  if (!options) return null;

  const hasOptions =
    options.roles.length > 0 ||
    options.levels.length > 0 ||
    options.industries.length > 0;

  if (!hasOptions) return null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {options.roles.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Role
          </label>
          <Select
            value={filters.role || undefined}
            onValueChange={(v) => update("role", v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              {options.roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {options.levels.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Experience
          </label>
          <Select
            value={filters.experienceLevel || undefined}
            onValueChange={(v) => update("experienceLevel", v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              {options.levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {options.industries.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Industry
          </label>
          <Select
            value={filters.industry || undefined}
            onValueChange={(v) => update("industry", v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              {options.industries.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(EMPTY_FILTERS)}
          className="h-10 gap-1 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

export { EMPTY_FILTERS };
