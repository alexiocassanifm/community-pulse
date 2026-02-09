import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    const { data: submissions, error: queryError } = await supabase
      .from("anonymous_submissions")
      .select("professional_role, experience_level, industry");

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
    });
  } catch (error) {
    console.error("Filter options error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
