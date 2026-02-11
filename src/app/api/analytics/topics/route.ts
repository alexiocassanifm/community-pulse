import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import { PREDEFINED_TOPICS } from "@/constants/topics";
import type { ExperienceLevel, ProfessionalBackground } from "@/types/database.types";

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

    const role = searchParams.get("role");
    const experienceLevel = searchParams.get("experienceLevel");
    const industry = searchParams.get("industry");
    const background = searchParams.get("background");

    let query = supabase
      .from("anonymous_submissions")
      .select("predefined_topics, custom_topics");

    if (startDate) {
      query = query.gte("submission_timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("submission_timestamp", endDate);
    }
    if (role) {
      query = query.eq("professional_role", role);
    }
    if (experienceLevel) {
      query = query.eq("experience_level", experienceLevel as ExperienceLevel);
    }
    if (industry) {
      query = query.eq("industry", industry);
    }
    if (background) {
      query = query.eq("professional_background", background as ProfessionalBackground);
    }

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      console.error("Analytics topics query error:", queryError);
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
        percentage: pct(count),
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
    console.error("Analytics topics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
