import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { ProfessionalBackground } from "@/types/database.types";

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
    const validBackgrounds: ProfessionalBackground[] = ["tech", "business", "design", "other"];
    const bgParam = request.nextUrl.searchParams.get("background");
    const background = bgParam && validBackgrounds.includes(bgParam as ProfessionalBackground)
      ? (bgParam as ProfessionalBackground)
      : null;

    // Always fetch all backgrounds from unfiltered data
    const { data: allSubmissions, error: allError } = await supabase
      .from("anonymous_submissions")
      .select("professional_background");

    if (allError) {
      console.error("Filter options query error:", allError);
      return NextResponse.json(
        { message: "Failed to fetch filter options" },
        { status: 500 }
      );
    }

    const backgrounds = new Set<string>();
    for (const row of allSubmissions ?? []) {
      if (row.professional_background) backgrounds.add(row.professional_background);
    }

    // Fetch dependent options, filtered by background when selected
    let query = supabase
      .from("anonymous_submissions")
      .select("professional_role, experience_level, industry");

    if (background) {
      query = query.eq("professional_background", background);
    }

    const { data: submissions, error: queryError } = await query;

    if (queryError) {
      console.error("Filter options query error:", queryError);
      return NextResponse.json(
        { message: "Failed to fetch filter options" },
        { status: 500 }
      );
    }

    const roles = new Set<string>();
    const levels = new Set<string>();
    const industries = new Set<string>();

    for (const row of submissions ?? []) {
      if (row.professional_role) roles.add(row.professional_role);
      if (row.experience_level) levels.add(row.experience_level);
      if (row.industry) industries.add(row.industry);
    }

    return NextResponse.json({
      roles: [...roles].sort(),
      levels: [...levels].sort(),
      industries: [...industries].sort(),
      backgrounds: [...backgrounds].sort(),
    });
  } catch (error) {
    console.error("Filter options error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
