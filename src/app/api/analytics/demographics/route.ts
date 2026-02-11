import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { ExperienceLevel, ProfessionalBackground } from "@/types/database.types";

const EXPERIENCE_ORDER: ExperienceLevel[] = [
  "junior",
  "mid",
  "senior",
  "lead",
  "executive",
];

const TOP_INDUSTRIES_COUNT = 10;
const TOP_SKILLS_COUNT = 15;

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

    function buildQuery() {
      let q = supabase
        .from("anonymous_submissions")
        .select("professional_role, experience_level, industry, skills");

      if (startDate) q = q.gte("submission_timestamp", startDate);
      if (endDate) q = q.lte("submission_timestamp", endDate);
      if (role) q = q.eq("professional_role", role);
      if (experienceLevel)
        q = q.eq("experience_level", experienceLevel as ExperienceLevel);
      if (industry) q = q.eq("industry", industry);
      if (background)
        q = q.eq("professional_background", background as ProfessionalBackground);
      return q;
    }

    const PAGE_SIZE = 1000;
    type SubmissionRow = {
      professional_role: string | null;
      experience_level: ExperienceLevel | null;
      industry: string | null;
      skills: string[] | null;
    };
    const rows: SubmissionRow[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: batch, error: queryError } = await buildQuery().range(from, to);

      if (queryError) {
        console.error("Analytics demographics query error:", queryError);
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

    const totalSubmissions = rows.length;

    const pct = (count: number) =>
      totalSubmissions > 0
        ? Math.round((count / totalSubmissions) * 1000) / 10
        : 0;

    // Aggregate roles
    const roleMap = new Map<string, number>();
    for (const row of rows) {
      if (row.professional_role) {
        const existing = roleMap.get(row.professional_role);
        roleMap.set(row.professional_role, (existing ?? 0) + 1);
      }
    }
    const roles = Array.from(roleMap.entries())
      .map(([category, count]) => ({ category, count, percentage: pct(count) }))
      .sort((a, b) => b.count - a.count);

    // Aggregate experience levels
    const experienceMap = new Map<ExperienceLevel, number>();
    for (const row of rows) {
      if (row.experience_level) {
        const existing = experienceMap.get(row.experience_level);
        experienceMap.set(row.experience_level, (existing ?? 0) + 1);
      }
    }
    const experience = EXPERIENCE_ORDER
      .map((level) => {
        const count = experienceMap.get(level) ?? 0;
        return { category: level, count, percentage: pct(count) };
      })
      .filter((item) => item.count > 0);

    // Aggregate industries
    const industryMap = new Map<string, number>();
    for (const row of rows) {
      if (row.industry) {
        const existing = industryMap.get(row.industry);
        industryMap.set(row.industry, (existing ?? 0) + 1);
      }
    }
    const industriesSorted = Array.from(industryMap.entries())
      .map(([category, count]) => ({ category, count, percentage: pct(count) }))
      .sort((a, b) => b.count - a.count);

    const topIndustries = industriesSorted.slice(0, TOP_INDUSTRIES_COUNT);
    const otherIndustries = industriesSorted.slice(TOP_INDUSTRIES_COUNT);
    const otherCount = otherIndustries.reduce((sum, item) => sum + item.count, 0);

    const industries = [...topIndustries];
    if (otherCount > 0) {
      industries.push({
        category: "Other",
        count: otherCount,
        percentage: pct(otherCount),
      });
    }

    // Aggregate skills
    const skillsMap = new Map<string, number>();
    let submissionsWithSkills = 0;

    for (const row of rows) {
      if (row.skills && Array.isArray(row.skills) && row.skills.length > 0) {
        submissionsWithSkills++;
        for (const skill of row.skills) {
          if (skill && typeof skill === "string") {
            const normalized = skill.toLowerCase().trim();
            if (normalized) {
              const existing = skillsMap.get(normalized);
              skillsMap.set(normalized, (existing ?? 0) + 1);
            }
          }
        }
      }
    }

    const skillsPct = (count: number) =>
      submissionsWithSkills > 0
        ? Math.round((count / submissionsWithSkills) * 1000) / 10
        : 0;

    const skills = Array.from(skillsMap.entries())
      .map(([category, count]) => ({ category, count, percentage: skillsPct(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_SKILLS_COUNT);

    return NextResponse.json({
      totalSubmissions,
      roles,
      experience,
      industries,
      totalDistinctIndustries: industryMap.size,
      skills,
      date_range: {
        start: startDate ?? null,
        end: endDate ?? null,
      },
    });
  } catch (error) {
    console.error("Analytics demographics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
