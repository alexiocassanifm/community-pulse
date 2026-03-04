import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseDateRange, validateDates, parseSegmentFilters, applySegmentFilters, pct, handleRouteError } from "@/lib/api/helpers";
import { PREDEFINED_TOPICS } from "@/constants/topics";

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
      .select("predefined_topics, custom_topics");

    if (startDate) {
      query = query.gte("submission_timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("submission_timestamp", endDate);
    }

    query = applySegmentFilters(query, filters);

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      return handleRouteError("Analytics topics query error", queryError);
    }

    const rows = submissions ?? [];
    const totalSubmissions = rows.length;

    // Count occurrences of each predefined topic
    const topicCounts = new Map<string, number>();
    for (const row of rows) {
      const topics = row.predefined_topics as string[] | null;
      if (topics) {
        for (const topicId of topics) {
          topicCounts.set(topicId, (topicCounts.get(topicId) ?? 0) + 1);
        }
      }
    }

    // Group by category using PREDEFINED_TOPICS constant
    const categories: Record<
      string,
      { id: string; topic: string; count: number; percentage: number }[]
    > = {};

    for (const { id, label, category } of PREDEFINED_TOPICS) {
      const count = topicCounts.get(id) ?? 0;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        id,
        topic: label,
        count,
        percentage: pct(count, totalSubmissions),
      });
    }

    // Sort topics within each category by count descending
    for (const category of Object.keys(categories)) {
      categories[category].sort((a, b) => b.count - a.count);
    }

    // Aggregate custom topics
    const customMap = new Map<string, number>();
    for (const row of rows) {
      const text = (row.custom_topics as string | null)?.trim();
      if (text && text.length <= 200) {
        const lower = text.toLowerCase();
        customMap.set(lower, (customMap.get(lower) ?? 0) + 1);
      }
    }

    const custom_topics = Array.from(customMap.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      categories,
      custom_topics,
      total_submissions: totalSubmissions,
      date_range: {
        start: startDate ?? null,
        end: endDate ?? null,
      },
    });
  } catch (error) {
    return handleRouteError("Analytics topics error", error);
  }
}
