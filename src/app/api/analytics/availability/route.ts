import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseDateRange, handleRouteError, pct } from "@/lib/api/helpers";
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
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    // Parse optional date range filters (accept both formats)
    const { searchParams } = new URL(request.url);
    const { startDate, endDate } = parseDateRange(searchParams);

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
      return handleRouteError("Analytics availability query error", queryError);
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
          const key = `${day.toLowerCase()}|${time.toLowerCase()}`;
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
        const percentage = pct(count, totalSubmissions);
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
    return handleRouteError("Analytics availability error", error);
  }
}
