"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TrendsChart, type Granularity } from "@/components/dashboard/trends-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { TrendingUp } from "lucide-react";

interface TrendDataPoint {
  date: string;
  count: number;
}

interface TrendsResponse {
  data: TrendDataPoint[];
  total_submissions: number;
  date_range: { start: string; end: string };
  granularity: string;
}

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="h-[350px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function TrendsContent() {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("granularity", granularity);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await fetch(`/api/analytics/trends?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trend analytics");
      const json: TrendsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [granularity, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDateChange(start: string | null, end: string | null) {
    setStartDate(start);
    setEndDate(end);
  }

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

  if (!data || data.total_submissions === 0) {
    return (
      <EmptyState
        title="No Trend Data"
        description="Trend data will appear here once participants submit their preferences."
        icon={TrendingUp}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Response Volume Over Time
          </CardTitle>
          <CardDescription>
            Submissions per {granularity} across the selected time range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangeFilter
            onDateChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
          />
          <TrendsChart
            data={data.data}
            granularity={granularity}
            onGranularityChange={setGranularity}
            totalSubmissions={data.total_submissions}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Based on {data.total_submissions}{" "}
        {data.total_submissions === 1 ? "submission" : "submissions"}
        {data.date_range.start && data.date_range.end && (
          <> from {data.date_range.start} to {data.date_range.end}</>
        )}
        .
      </p>
    </div>
  );
}
