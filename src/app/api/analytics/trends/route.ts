import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

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
    const startDateParam =
      searchParams.get("startDate") ?? searchParams.get("start_date");
    const endDateParam =
      searchParams.get("endDate") ?? searchParams.get("end_date");

    const isValidDate = (d: string) =>
      /^\d{4}-\d{2}-\d{2}/.test(d) && !isNaN(new Date(d).getTime());

    if (startDateParam && !isValidDate(startDateParam)) {
      return NextResponse.json(
        { message: "Invalid start date format" },
        { status: 400 }
      );
    }
    if (endDateParam && !isValidDate(endDateParam)) {
      return NextResponse.json(
        { message: "Invalid end date format" },
        { status: 400 }
      );
    }

    // Default date range: last 30 days
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = startDateParam ?? defaultStart.toISOString().split("T")[0];
    const endDate = endDateParam ?? now.toISOString().split("T")[0];

    // Paginated fetch of submission timestamps
    function buildQuery() {
      let q = supabase
        .from("anonymous_submissions")
        .select("submission_timestamp");

      q = q.gte("submission_timestamp", startDate);
      q = q.lte("submission_timestamp", endDate + "T23:59:59.999Z");
      return q;
    }

    const PAGE_SIZE = 1000;
    type TimestampRow = { submission_timestamp: string | null };
    const rows: TimestampRow[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: batch, error: queryError } = await buildQuery().range(from, to);

      if (queryError) {
        console.error("Analytics trends query error:", queryError);
        return NextResponse.json(
          { message: "Failed to fetch analytics data" },
          { status: 500 }
        );
      }

      const items = batch ?? [];
      rows.push(...items);
      hasMore = items.length === PAGE_SIZE;
      page++;
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
    console.error("Analytics trends error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
