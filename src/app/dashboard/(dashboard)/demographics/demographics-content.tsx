"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RoleBreakdownChart } from "@/components/dashboard/role-breakdown-chart";
import { ExperienceLevelChart } from "@/components/dashboard/experience-level-chart";
import { IndustryDistributionChart } from "@/components/dashboard/industry-distribution-chart";
import { SkillsVisualization } from "@/components/dashboard/skills-visualization";
import {
  SegmentFilter,
  EMPTY_FILTERS,
  type SegmentFilters,
} from "@/components/dashboard/SegmentFilter";
import { Users } from "lucide-react";

interface DemographicEntry {
  category: string;
  count: number;
  percentage: number;
}

interface DemographicsResponse {
  totalSubmissions: number;
  roles: DemographicEntry[];
  experience: DemographicEntry[];
  industries: DemographicEntry[];
  totalDistinctIndustries: number;
  skills: DemographicEntry[];
  date_range: { start: string | null; end: string | null };
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DemographicsContent() {
  const [analytics, setAnalytics] = useState<DemographicsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SegmentFilters>(EMPTY_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.experienceLevel)
        params.set("experienceLevel", filters.experienceLevel);
      if (filters.industry) params.set("industry", filters.industry);
      if (filters.background) params.set("background", filters.background);
      const qs = params.toString();
      const res = await fetch(
        `/api/analytics/demographics${qs ? `?${qs}` : ""}`
      );
      if (!res.ok) throw new Error("Failed to fetch demographic analytics");
      const json: DemographicsResponse = await res.json();
      setAnalytics(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <ContentSkeleton />;

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters =
    filters.role !== "" ||
    filters.experienceLevel !== "" ||
    filters.industry !== "" ||
    filters.background !== "";

  if (!analytics || analytics.totalSubmissions === 0) {
    return (
      <div className="space-y-6">
        {hasActiveFilters && (
          <SegmentFilter filters={filters} onFilterChange={setFilters} />
        )}
        <EmptyState
          title="No Demographic Data"
          description="Demographic data will appear here once participants submit their preferences."
          icon={Users}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SegmentFilter filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-live="polite">
        {analytics.roles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Professional Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoleBreakdownChart data={analytics.roles} />
            </CardContent>
          </Card>
        )}

        {analytics.experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Experience Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExperienceLevelChart data={analytics.experience} />
            </CardContent>
          </Card>
        )}

        {analytics.industries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Industry Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IndustryDistributionChart
                data={analytics.industries}
                totalDistinctIndustries={analytics.totalDistinctIndustries}
              />
            </CardContent>
          </Card>
        )}

        {analytics.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Top Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsVisualization data={analytics.skills} />
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Based on {analytics.totalSubmissions}{" "}
        {analytics.totalSubmissions === 1 ? "submission" : "submissions"}.
      </p>
    </div>
  );
}
