"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FormatBarChart } from "@/components/dashboard/format-bar-chart";
import { FormatPieChart } from "@/components/dashboard/format-pie-chart";
import { HybridPreferenceChart } from "@/components/dashboard/hybrid-preference-chart";
import {
  SegmentFilter,
  EMPTY_FILTERS,
  type SegmentFilters,
} from "@/components/dashboard/SegmentFilter";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormatEntry {
  count: number;
  percentage: number;
}

interface CustomFormat {
  text: string;
  count: number;
}

interface FormatAnalyticsResponse {
  data: Record<string, FormatEntry>;
  hybrid: Record<string, FormatEntry>;
  custom_formats: CustomFormat[];
  total_submissions: number;
  date_range: { start: string | null; end: string | null };
}

type ChartView = "bar" | "pie";

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FormatsContent() {
  const [analytics, setAnalytics] = useState<FormatAnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<ChartView>("bar");
  const [filters, setFilters] = useState<SegmentFilters>(EMPTY_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
      if (filters.industry) params.set("industry", filters.industry);
      if (filters.background) params.set("background", filters.background);
      const qs = params.toString();
      const res = await fetch(`/api/analytics/formats${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch format analytics");
      const json: FormatAnalyticsResponse = await res.json();
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

  if (!analytics || analytics.total_submissions === 0) {
    return (
      <EmptyState
        title="No Format Data"
        description="Format preference data will appear here once participants submit their preferences."
        icon={BarChart3}
      />
    );
  }

  const formatData = Object.entries(analytics.data).map(([key, value]) => ({
    name: formatLabel(key),
    key,
    count: value.count,
    percentage: value.percentage,
  }));

  const hybridData = Object.entries(analytics.hybrid).map(([key, value]) => ({
    name: hybridLabel(key),
    key,
    count: value.count,
    percentage: value.percentage,
  }));

  return (
    <div className="space-y-6">
      <SegmentFilter filters={filters} onFilterChange={setFilters} />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-medium">
              Format Preferences
            </CardTitle>
            <div
              className="inline-flex rounded-md border"
              role="tablist"
              aria-label="Chart view toggle"
            >
              <button
                role="tab"
                aria-selected={chartView === "bar"}
                onClick={() => setChartView("bar")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-l-md",
                  chartView === "bar"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                Bar Chart
              </button>
              <button
                role="tab"
                aria-selected={chartView === "pie"}
                onClick={() => setChartView("pie")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors rounded-r-md",
                  chartView === "pie"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                Pie Chart
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div aria-live="polite">
            {chartView === "bar" ? (
              <FormatBarChart data={formatData} />
            ) : (
              <FormatPieChart data={formatData} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Delivery Mode Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HybridPreferenceChart data={hybridData} />
          </CardContent>
        </Card>

        {analytics.custom_formats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Custom Format Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics.custom_formats.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="capitalize">{item.text}</span>
                    <span className="text-muted-foreground">
                      {item.count} {item.count === 1 ? "mention" : "mentions"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Based on {analytics.total_submissions}{" "}
        {analytics.total_submissions === 1 ? "submission" : "submissions"}.
        Participants can select multiple formats.
      </p>
    </div>
  );
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    presentations: "Presentations",
    workshops: "Workshops",
    discussions: "Discussions",
    networking: "Networking",
    hackathons: "Hackathons",
    mentoring: "Mentoring",
  };
  return labels[key] ?? key;
}

function hybridLabel(key: string): string {
  const labels: Record<string, string> = {
    in_person: "In Person",
    virtual: "Virtual",
    hybrid: "Hybrid",
    no_preference: "No Preference",
  };
  return labels[key] ?? key;
}
