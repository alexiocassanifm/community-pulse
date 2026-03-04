"use client";

import { useEffect, useState, useCallback } from "react";
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
  background: string;
}

interface FilterOptions {
  roles: string[];
  levels: string[];
  industries: string[];
  backgrounds: string[];
}

const BACKGROUND_LABELS: Record<string, string> = {
  tech: "Tech / Engineering",
  business: "Business / Management",
  design: "Design / Creative",
  other: "Other",
};

const EMPTY_FILTERS: SegmentFilters = {
  role: "",
  experienceLevel: "",
  industry: "",
  background: "",
};

interface SegmentFilterProps {
  filters: SegmentFilters;
  onFilterChange: (filters: SegmentFilters) => void;
}

interface FilterSelectProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  formatOption?: (value: string) => string;
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  formatOption,
}: FilterSelectProps) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatOption ? formatOption(option) : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SegmentFilter({ filters, onFilterChange }: SegmentFilterProps) {
  const [options, setOptions] = useState<FilterOptions | null>(null);

  const fetchOptions = useCallback(async (background: string) => {
    try {
      const params = new URLSearchParams();
      if (background) params.set("background", background);
      const url = `/api/analytics/filter-options${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json: FilterOptions = await res.json();
      setOptions(json);
    } catch {
      // silently fail — filters just won't show options
    }
  }, []);

  useEffect(() => {
    fetchOptions(filters.background);
  }, [filters.background, fetchOptions]);

  const activeCount = [filters.role, filters.experienceLevel, filters.industry, filters.background].filter(Boolean).length;

  function update(key: keyof SegmentFilters, value: string) {
    onFilterChange({ ...filters, [key]: value });
  }

  function updateBackground(value: string) {
    onFilterChange({ ...filters, background: value, role: "", experienceLevel: "", industry: "" });
  }

  if (!options) return null;

  const hasOptions =
    options.roles.length > 0 ||
    options.levels.length > 0 ||
    options.industries.length > 0 ||
    options.backgrounds.length > 0;

  if (!hasOptions) return null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect
        label="Background"
        value={filters.background}
        placeholder="All backgrounds"
        options={options.backgrounds}
        onChange={updateBackground}
        formatOption={(b) => BACKGROUND_LABELS[b] ?? b}
      />

      <FilterSelect
        label="Role"
        value={filters.role}
        placeholder="All roles"
        options={options.roles}
        onChange={(v) => update("role", v)}
      />

      <FilterSelect
        label="Experience"
        value={filters.experienceLevel}
        placeholder="All levels"
        options={options.levels}
        onChange={(v) => update("experienceLevel", v)}
      />

      <FilterSelect
        label="Industry"
        value={filters.industry}
        placeholder="All industries"
        options={options.industries}
        onChange={(v) => update("industry", v)}
      />

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
