import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Authenticate organizer session
    const authClient = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Fetch total count and averages
    const { data: summary, error: summaryError } = await supabase
      .from("anonymous_submissions")
      .select("completion_percentage, submission_timestamp");

    if (summaryError) {
      console.error("Analytics summary query error:", summaryError);
      return NextResponse.json(
        { message: "Failed to fetch analytics data" },
        { status: 500 }
      );
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

    const { count: last7Days, error: last7Error } = await supabase
      .from("anonymous_submissions")
      .select("*", { count: "exact", head: true })
      .gte("submission_timestamp", sevenDaysAgo);

    const { count: previous7Days, error: prev7Error } = await supabase
      .from("anonymous_submissions")
      .select("*", { count: "exact", head: true })
      .gte("submission_timestamp", fourteenDaysAgo)
      .lt("submission_timestamp", sevenDaysAgo);

    if (last7Error || prev7Error) {
      console.error("Analytics trends query error:", last7Error || prev7Error);
      return NextResponse.json(
        { message: "Failed to fetch analytics data" },
        { status: 500 }
      );
    }

    const last7 = last7Days ?? 0;
    const prev7 = previous7Days ?? 0;
    const submissionsPerDay = Math.round((last7 / 7) * 10) / 10;

    let trend: "up" | "down" | "stable" = "stable";
    if (last7 > prev7) trend = "up";
    else if (last7 < prev7) trend = "down";

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
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
