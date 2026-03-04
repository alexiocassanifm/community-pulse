import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseDateRange, validateDates, parseSegmentFilters, applySegmentFilters, pct, handleRouteError } from "@/lib/api/helpers";
import type { HybridFormat } from "@/types/database.types";
import { FORMAT_FIELDS } from "@/constants/event-formats";

const HYBRID_VALUES: HybridFormat[] = [
  "in_person",
  "virtual",
  "hybrid",
  "no_preference",
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    const { searchParams } = new URL(request.url);
    const { startDate, endDate } = parseDateRange(searchParams);

    const dateError = validateDates(startDate, endDate);
    if (dateError) return dateError;

    const filters = parseSegmentFilters(searchParams);

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

    query = applySegmentFilters(query, filters);

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      return handleRouteError("Analytics formats query error", queryError);
    }

    const rows = submissions ?? [];
    const totalSubmissions = rows.length;

    const data: Record<string, { count: number; percentage: number }> = {};
    for (const field of FORMAT_FIELDS) {
      const count = rows.filter(
        (r) => r[`format_${field}` as keyof typeof r] === true
      ).length;
      data[field] = { count, percentage: pct(count, totalSubmissions) };
    }

    const hybrid: Record<string, { count: number; percentage: number }> = {};
    for (const value of HYBRID_VALUES) {
      const count = rows.filter((r) => r.format_hybrid === value).length;
      hybrid[value] = { count, percentage: pct(count, totalSubmissions) };
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
    return handleRouteError("Analytics formats error", error);
  }
}
