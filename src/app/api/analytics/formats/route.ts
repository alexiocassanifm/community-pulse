import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { HybridFormat } from "@/types/database.types";

const FORMAT_FIELDS = [
  "presentations",
  "workshops",
  "discussions",
  "networking",
  "hackathons",
  "mentoring",
] as const;

const HYBRID_VALUES: HybridFormat[] = [
  "in_person",
  "virtual",
  "hybrid",
  "no_preference",
];

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get("startDate") ?? searchParams.get("start_date");
    const endDate =
      searchParams.get("endDate") ?? searchParams.get("end_date");

    const isValidDate = (d: string) =>
      /^\d{4}-\d{2}-\d{2}/.test(d) && !isNaN(new Date(d).getTime());

    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { message: "Invalid start date format" },
        { status: 400 }
      );
    }
    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { message: "Invalid end date format" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("anonymous_submissions")
      .select(
        "format_presentations, format_workshops, format_discussions, format_networking, format_hackathons, format_mentoring, format_hybrid, format_custom"
      );

    if (startDate) {
      query = query.gte("submission_timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("submission_timestamp", endDate);
    }

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      console.error("Analytics formats query error:", queryError);
      return NextResponse.json(
        { message: "Failed to fetch analytics data" },
        { status: 500 }
      );
    }

    const rows = submissions ?? [];
    const totalSubmissions = rows.length;

    const pct = (count: number) =>
      totalSubmissions > 0
        ? Math.round((count / totalSubmissions) * 1000) / 10
        : 0;

    const data: Record<string, { count: number; percentage: number }> = {};
    for (const field of FORMAT_FIELDS) {
      const count = rows.filter(
        (r) => r[`format_${field}` as keyof typeof r] === true
      ).length;
      data[field] = { count, percentage: pct(count) };
    }

    const hybrid: Record<string, { count: number; percentage: number }> = {};
    for (const value of HYBRID_VALUES) {
      const count = rows.filter((r) => r.format_hybrid === value).length;
      hybrid[value] = { count, percentage: pct(count) };
    }

    const customMap = new Map<string, number>();
    for (const row of rows) {
      const text = row.format_custom?.trim();
      if (text && text.length <= 200) {
        const lower = text.toLowerCase();
        const existing = customMap.get(lower);
        customMap.set(lower, (existing ?? 0) + 1);
      }
    }

    const custom_formats = Array.from(customMap.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      data,
      hybrid,
      custom_formats,
      total_submissions: totalSubmissions,
      date_range: {
        start: startDate ?? null,
        end: endDate ?? null,
      },
    });
  } catch (error) {
    console.error("Analytics formats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
