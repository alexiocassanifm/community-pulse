"use client";

import { useState } from "react";
import { AvailabilityHeatmap } from "@/components/dashboard/AvailabilityHeatmap";
import {
  SegmentFilter,
  EMPTY_FILTERS,
  type SegmentFilters,
} from "@/components/dashboard/SegmentFilter";

export function AvailabilityContent() {
  const [filters, setFilters] = useState<SegmentFilters>(EMPTY_FILTERS);

  return (
    <div className="space-y-4">
      <SegmentFilter filters={filters} onFilterChange={setFilters} />
      <AvailabilityHeatmap filters={filters} />
    </div>
  );
}
