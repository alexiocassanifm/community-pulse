"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TopicCategoryChart } from "@/components/dashboard/topic-category-chart";
import {
  SegmentFilter,
  EMPTY_FILTERS,
  type SegmentFilters,
} from "@/components/dashboard/SegmentFilter";
import { Tags } from "lucide-react";

interface TopicEntry {
  id: string;
  topic: string;
  count: number;
  percentage: number;
}

interface TopicsAnalyticsResponse {
  categories: Record<string, TopicEntry[]>;
  custom_topics: { text: string; count: number }[];
  total_submissions: number;
  date_range: { start: string | null; end: string | null };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Claude Products": "#2563eb",
  "Agentic AI": "#7c3aed",
  "Skills & MCP": "#0891b2",
  "Development Practices": "#059669",
  "Session Formats": "#d97706",
};

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TopicsContent() {
  const [analytics, setAnalytics] = useState<TopicsAnalyticsResponse | null>(
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
      if (filters.experienceLevel) params.set("experienceLevel", filters.experienceLevel);
      if (filters.industry) params.set("industry", filters.industry);
      if (filters.background) params.set("background", filters.background);
      const qs = params.toString();
      const res = await fetch(`/api/analytics/topics${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch topic analytics");
      const json: TopicsAnalyticsResponse = await res.json();
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
        title="No Topic Data"
        description="Topic interest data will appear here once participants submit their preferences."
        icon={Tags}
      />
    );
  }

  const categoryEntries = Object.entries(analytics.categories);

  return (
    <div className="space-y-6">
      <SegmentFilter filters={filters} onFilterChange={setFilters} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-live="polite">
        {categoryEntries.map(([category, topics]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopicCategoryChart
                data={topics}
                color={CATEGORY_COLORS[category] ?? "#6b7280"}
              />
            </CardContent>
          </Card>
        ))}

        {analytics.custom_topics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Custom Topic Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics.custom_topics.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{item.text}</span>
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
        Participants can select multiple topics.
      </p>
    </div>
  );
}
