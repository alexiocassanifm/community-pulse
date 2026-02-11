import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { ExperienceLevel, ProfessionalBackground } from "@/types/database.types";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TIMES = ["morning", "afternoon", "evening"] as const;

export async function GET(request: NextRequest) {
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

    // Parse optional date range filters (accept both formats)
    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get("startDate") ?? searchParams.get("start_date");
    const endDate =
      searchParams.get("endDate") ?? searchParams.get("end_date");

    // Parse optional segment filters
    const roleParam = searchParams.get("role");
    const experienceLevelParam = searchParams.get("experienceLevel");
    const industryParam = searchParams.get("industry");
    const backgroundParam = searchParams.get("background");

    // Build query
    let query = supabase
      .from("anonymous_submissions")
      .select(
        "preferred_days, preferred_times, submission_timestamp, professional_role, experience_level, industry"
      );

    if (startDate) {
      query = query.gte("submission_timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("submission_timestamp", endDate);
    }

    // Apply segment filters (comma-separated for multi-value)
    if (roleParam) {
      const roles = roleParam.split(",").map((r) => r.trim());
      query = query.in("professional_role", roles);
    }
    if (experienceLevelParam) {
      const levels = experienceLevelParam
        .split(",")
        .map((l) => l.trim()) as ExperienceLevel[];
      query = query.in("experience_level", levels);
    }
    if (industryParam) {
      const industries = industryParam.split(",").map((i) => i.trim());
      query = query.in("industry", industries);
    }
    if (backgroundParam) {
      const backgrounds = backgroundParam
        .split(",")
        .map((b) => b.trim()) as ProfessionalBackground[];
      query = query.in("professional_background", backgrounds);
    }

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      console.error("Analytics availability query error:", queryError);
      return NextResponse.json(
        { message: "Failed to fetch analytics data" },
        { status: 500 }
      );
    }

    // Filter to submissions that have both preferred_days and preferred_times
    const validSubmissions = (submissions ?? []).filter(
      (s) =>
        s.preferred_days &&
        s.preferred_days.length > 0 &&
        s.preferred_times &&
        s.preferred_times.length > 0
    );

    const totalSubmissions = validSubmissions.length;

    // Cross-tabulate day-time combinations
    const counts = new Map<string, number>();

    for (const submission of validSubmissions) {
      const days = submission.preferred_days ?? [];
      const times = submission.preferred_times ?? [];

      for (const day of days) {
        for (const time of times) {
          // Exclude 'flexible' from heatmap cross-tab
          if (time === "flexible") continue;
          const key = `${day}|${time}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }

    // Build response data with all day-time combinations
    const data: Array<{
      day: string;
      time: string;
      count: number;
      percentage: number;
    }> = [];

    for (const day of DAYS) {
      for (const time of TIMES) {
        const key = `${day}|${time}`;
        const count = counts.get(key) ?? 0;
        const percentage =
          totalSubmissions > 0
            ? Math.round((count / totalSubmissions) * 1000) / 10
            : 0;
        data.push({ day, time, count, percentage });
      }
    }

    return NextResponse.json({
      data,
      totalSubmissions,
      insufficientData: totalSubmissions < 10,
      dateRange: {
        start: startDate ?? null,
        end: endDate ?? null,
      },
    });
  } catch (error) {
    console.error("Analytics availability error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
