import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseSegmentFilters, applySegmentFilters, handleRouteError, pct } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    const { searchParams } = new URL(request.url);
    const filters = parseSegmentFilters(searchParams);

    // Fetch total count, averages, and background distribution
    let summaryQuery = supabase
      .from("anonymous_submissions")
      .select("completion_percentage, submission_timestamp, professional_background");

    summaryQuery = applySegmentFilters(summaryQuery, filters);

    const { data: summary, error: summaryError } = await summaryQuery;

    if (summaryError) {
      return handleRouteError("Analytics summary query error", summaryError);
    }

    const totalSubmissions = summary?.length ?? 0;

    // Calculate averageCompletion
    let averageCompletion = 0;
    let dateRangeStart: string | null = null;
    let dateRangeEnd: string | null = null;

    if (totalSubmissions > 0) {
      const sum = summary.reduce(
        (acc, row) => acc + (row.completion_percentage ?? 0),
        0
      );
      averageCompletion =
        Math.round((sum / totalSubmissions) * 10) / 10;

      // Calculate date range
      const timestamps = summary
        .map((row) => row.submission_timestamp)
        .filter(Boolean)
        .sort();

      dateRangeStart = timestamps[0] ?? null;
      dateRangeEnd = timestamps[timestamps.length - 1] ?? null;
    }

    // Recent trends: last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const fourteenDaysAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    let last7Query = supabase
      .from("anonymous_submissions")
      .select("*", { count: "exact", head: true })
      .gte("submission_timestamp", sevenDaysAgo);

    let prev7Query = supabase
      .from("anonymous_submissions")
      .select("*", { count: "exact", head: true })
      .gte("submission_timestamp", fourteenDaysAgo)
      .lt("submission_timestamp", sevenDaysAgo);

    last7Query = applySegmentFilters(last7Query, filters);
    prev7Query = applySegmentFilters(prev7Query, filters);

    const { count: last7Days, error: last7Error } = await last7Query;
    const { count: previous7Days, error: prev7Error } = await prev7Query;

    if (last7Error || prev7Error) {
      return handleRouteError("Analytics trends query error", last7Error || prev7Error);
    }

    const last7 = last7Days ?? 0;
    const prev7 = previous7Days ?? 0;
    const submissionsPerDay = Math.round((last7 / 7) * 10) / 10;

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
        percentage: pct(count, totalSubmissions),
      })
    );

    return NextResponse.json({
      totalSubmissions,
      averageCompletion,
      dateRange: {
        start: dateRangeStart,
        end: dateRangeEnd,
      },
      recentTrends: {
        last7Days: last7,
        previousPeriod: prev7,
        submissionsPerDay,
        trend,
      },
      backgroundDistribution,
    });
  } catch (error) {
    return handleRouteError("Analytics overview error", error);
  }
}
