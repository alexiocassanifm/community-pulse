import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseDateRange, validateDates, parseSegmentFilters, applySegmentFilters, pct, paginatedFetch, handleRouteError } from "@/lib/api/helpers";
import type { ExperienceLevel } from "@/types/database.types";

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
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    const { searchParams } = new URL(request.url);
    const { startDate, endDate } = parseDateRange(searchParams);

    const dateError = validateDates(startDate, endDate);
    if (dateError) return dateError;

    const filters = parseSegmentFilters(searchParams);

    type SubmissionRow = {
      professional_role: string | null;
      experience_level: ExperienceLevel | null;
      industry: string | null;
      skills: string[] | null;
    };

    const { data: rows, error: queryError } = await paginatedFetch<SubmissionRow>(
      async (from, to) => {
        let q = supabase
          .from("anonymous_submissions")
          .select("professional_role, experience_level, industry, skills");

        if (startDate) q = q.gte("submission_timestamp", startDate);
        if (endDate) q = q.lte("submission_timestamp", endDate);

        q = applySegmentFilters(q, filters);

        return await q.range(from, to);
      }
    );

    if (queryError) {
      return handleRouteError("Analytics demographics query error", queryError);
    }

    const totalSubmissions = rows.length;

    // Aggregate roles
    const roleMap = new Map<string, number>();
    for (const row of rows) {
      if (row.professional_role) {
        const existing = roleMap.get(row.professional_role);
        roleMap.set(row.professional_role, (existing ?? 0) + 1);
      }
    }
    const roles = Array.from(roleMap.entries())
      .map(([category, count]) => ({ category, count, percentage: pct(count, totalSubmissions) }))
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
        return { category: level, count, percentage: pct(count, totalSubmissions) };
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
      .map(([category, count]) => ({ category, count, percentage: pct(count, totalSubmissions) }))
      .sort((a, b) => b.count - a.count);

    const topIndustries = industriesSorted.slice(0, TOP_INDUSTRIES_COUNT);
    const otherIndustries = industriesSorted.slice(TOP_INDUSTRIES_COUNT);
    const otherCount = otherIndustries.reduce((sum, item) => sum + item.count, 0);

    const industries = [...topIndustries];
    if (otherCount > 0) {
      industries.push({
        category: "Other",
        count: otherCount,
        percentage: pct(otherCount, totalSubmissions),
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
    return handleRouteError("Analytics demographics error", error);
  }
}
