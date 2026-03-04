import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseDateRange, validateDates, paginatedFetch, handleRouteError } from "@/lib/api/helpers";

type Granularity = "day" | "week" | "month";

const VALID_GRANULARITIES: Granularity[] = ["day", "week", "month"];

function toDateKey(date: Date, granularity: Granularity): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  switch (granularity) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      // Find Monday of the week (ISO week starts on Monday)
      const d = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate()));
      const dayOfWeek = d.getUTCDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      d.setUTCDate(d.getUTCDate() + diff);
      const wy = d.getUTCFullYear();
      const wm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const wd = String(d.getUTCDate()).padStart(2, "0");
      return `${wy}-${wm}-${wd}`;
    }
    case "month":
      return `${year}-${month}-01`;
  }
}

function generateDateRange(start: Date, end: Date, granularity: Granularity): string[] {
  const keys: string[] = [];
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

  // Align start to granularity boundary
  if (granularity === "week") {
    const dayOfWeek = current.getUTCDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    current.setUTCDate(current.getUTCDate() + diff);
  } else if (granularity === "month") {
    current.setUTCDate(1);
  }

  const endKey = toDateKey(end, granularity);

  while (true) {
    const key = toDateKey(current, granularity);
    keys.push(key);
    if (key >= endKey) break;

    switch (granularity) {
      case "day":
        current.setUTCDate(current.getUTCDate() + 1);
        break;
      case "week":
        current.setUTCDate(current.getUTCDate() + 7);
        break;
      case "month":
        current.setUTCMonth(current.getUTCMonth() + 1);
        break;
    }
  }

  return keys;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    const { searchParams } = new URL(request.url);

    // Parse granularity
    const granularityParam = searchParams.get("granularity") ?? "day";
    if (!VALID_GRANULARITIES.includes(granularityParam as Granularity)) {
      return NextResponse.json(
        { message: "Invalid granularity. Must be one of: day, week, month" },
        { status: 400 }
      );
    }
    const granularity = granularityParam as Granularity;

    // Parse dates (support both camelCase and snake_case)
    const { startDate: startDateParam, endDate: endDateParam } = parseDateRange(searchParams);

    const dateError = validateDates(startDateParam, endDateParam);
    if (dateError) return dateError;

    // Default date range: last 30 days
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = startDateParam ?? defaultStart.toISOString().split("T")[0];
    const endDate = endDateParam ?? now.toISOString().split("T")[0];

    // Paginated fetch of submission timestamps
    type TimestampRow = { submission_timestamp: string | null };

    const { data: rows, error: queryError } = await paginatedFetch<TimestampRow>(
      async (from, to) => {
        let q = supabase
          .from("anonymous_submissions")
          .select("submission_timestamp");

        q = q.gte("submission_timestamp", startDate);
        q = q.lte("submission_timestamp", endDate + "T23:59:59.999Z");

        return await q.range(from, to);
      }
    );

    if (queryError) {
      return handleRouteError("Analytics trends query error", queryError);
    }

    // Aggregate by granularity
    const countMap = new Map<string, number>();
    for (const row of rows) {
      if (row.submission_timestamp) {
        const date = new Date(row.submission_timestamp);
        const key = toDateKey(date, granularity);
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
    }

    // Fill gaps for continuous chart data
    const dateKeys = generateDateRange(
      new Date(startDate),
      new Date(endDate),
      granularity
    );

    const data = dateKeys.map((date) => ({
      date,
      count: countMap.get(date) ?? 0,
    }));

    const totalSubmissions = rows.length;

    return NextResponse.json({
      data,
      total_submissions: totalSubmissions,
      date_range: {
        start: startDate,
        end: endDate,
      },
      granularity,
    });
  } catch (error) {
    return handleRouteError("Analytics trends error", error);
  }
}
