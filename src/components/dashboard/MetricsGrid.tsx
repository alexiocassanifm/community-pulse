import { Users, CheckCircle, TrendingUp, Calendar, Monitor, Briefcase, Palette, MoreHorizontal } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "./MetricsCard";
import { EmptyState } from "./EmptyState";
import { BackgroundDistributionChart } from "./background-distribution-chart";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function fetchOverviewData() {
  const supabase = createServerClient();

  const { data: summary, error: summaryError } = await supabase
    .from("anonymous_submissions")
    .select("completion_percentage, submission_timestamp, professional_background");

  if (summaryError) {
    throw new Error("Failed to fetch analytics data");
  }

  const totalSubmissions = summary?.length ?? 0;

  let averageCompletion = 0;
  let dateRangeStart: string | null = null;
  let dateRangeEnd: string | null = null;

  if (totalSubmissions > 0) {
    const sum = summary.reduce(
      (acc, row) => acc + (row.completion_percentage ?? 0),
      0
    );
    averageCompletion = Math.round((sum / totalSubmissions) * 10) / 10;

    const timestamps = summary
      .map((row) => row.submission_timestamp)
      .filter(Boolean)
      .sort();

    dateRangeStart = timestamps[0] ?? null;
    dateRangeEnd = timestamps[timestamps.length - 1] ?? null;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const fourteenDaysAgo = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { count: last7Days } = await supabase
    .from("anonymous_submissions")
    .select("*", { count: "exact", head: true })
    .gte("submission_timestamp", sevenDaysAgo);

  const { count: previous7Days } = await supabase
    .from("anonymous_submissions")
    .select("*", { count: "exact", head: true })
    .gte("submission_timestamp", fourteenDaysAgo)
    .lt("submission_timestamp", sevenDaysAgo);

  const last7 = last7Days ?? 0;
  const prev7 = previous7Days ?? 0;

  let trend: "up" | "down" | "stable" = "stable";
  if (last7 > prev7) trend = "up";
  else if (last7 < prev7) trend = "down";

  // Background distribution
  const bgCounts: Record<string, number> = {};
  for (const row of summary ?? []) {
    const bg = row.professional_background as string | null;
    if (bg) {
      bgCounts[bg] = (bgCounts[bg] ?? 0) + 1;
    }
  }
  const backgroundDistribution = Object.entries(bgCounts).map(
    ([value, count]) => ({
      value,
      count,
      percentage:
        totalSubmissions > 0
          ? Math.round((count / totalSubmissions) * 1000) / 10
          : 0,
    })
  );

  return {
    totalSubmissions,
    averageCompletion,
    dateRange: { start: dateRangeStart, end: dateRangeEnd },
    recentTrends: { last7Days: last7, previousPeriod: prev7, trend },
    backgroundDistribution,
  };
}

export async function MetricsGrid() {
  const data = await fetchOverviewData();

  if (data.totalSubmissions === 0) {
    return <EmptyState />;
  }

  const dateRangeText =
    data.dateRange.start && data.dateRange.end
      ? `${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}`
      : "N/A";

  const trendDiff = data.recentTrends.last7Days - data.recentTrends.previousPeriod;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Submissions"
          value={data.totalSubmissions}
          description="All time submissions"
          icon={Users}
        />
        <MetricsCard
          title="Avg Completion"
          value={`${data.averageCompletion}%`}
          description="Average form completion rate"
          icon={CheckCircle}
        />
        <MetricsCard
          title="Recent Activity"
          value={data.recentTrends.last7Days}
          description="vs previous 7 days"
          icon={TrendingUp}
          trend={
            data.recentTrends.trend !== "stable"
              ? {
                  value: Math.abs(trendDiff),
                  isPositive: data.recentTrends.trend === "up",
                }
              : undefined
          }
        />
        <MetricsCard
          title="Data Period"
          value={dateRangeText}
          description="Submission date range"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Tech / Engineering"
          value={data.backgroundDistribution.find((d) => d.value === "tech")?.count ?? 0}
          description={`${data.backgroundDistribution.find((d) => d.value === "tech")?.percentage ?? 0}% of total`}
          icon={Monitor}
        />
        <MetricsCard
          title="Business / Management"
          value={data.backgroundDistribution.find((d) => d.value === "business")?.count ?? 0}
          description={`${data.backgroundDistribution.find((d) => d.value === "business")?.percentage ?? 0}% of total`}
          icon={Briefcase}
        />
        <MetricsCard
          title="Design / Creative"
          value={data.backgroundDistribution.find((d) => d.value === "design")?.count ?? 0}
          description={`${data.backgroundDistribution.find((d) => d.value === "design")?.percentage ?? 0}% of total`}
          icon={Palette}
        />
        <MetricsCard
          title="Other"
          value={data.backgroundDistribution.find((d) => d.value === "other")?.count ?? 0}
          description={`${data.backgroundDistribution.find((d) => d.value === "other")?.percentage ?? 0}% of total`}
          icon={MoreHorizontal}
        />
      </div>

      {data.backgroundDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Background Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BackgroundDistributionChart data={data.backgroundDistribution} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
