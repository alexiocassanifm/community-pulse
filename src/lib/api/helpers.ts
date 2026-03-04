import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ExperienceLevel, ProfessionalBackground } from "@/types/database.types";

type AuthResult = {
  user: User;
  supabase: SupabaseClient<Database>;
};

/**
 * Authenticate organizer and return user + admin supabase client.
 * Returns 401 NextResponse if auth fails or user is not found.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  return { user, supabase };
}

/**
 * Shorthand for JSON error responses
 */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ message }, { status });
}

/**
 * Standardized catch block error handler
 */
export function handleRouteError(label: string, error: unknown, clientMessage = "Internal server error"): NextResponse {
  console.error(`${label}:`, error);
  return jsonError(clientMessage, 500);
}

/**
 * Calculate percentage with safe division
 */
export function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
}

/**
 * Parse date range from URL params (supports both camelCase and snake_case)
 */
export function parseDateRange(params: URLSearchParams): {
  startDate: string | null;
  endDate: string | null;
} {
  const startDate = params.get("startDate") ?? params.get("start_date");
  const endDate = params.get("endDate") ?? params.get("end_date");
  return { startDate, endDate };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDates(
  startDate: string | null,
  endDate: string | null
): NextResponse | null {
  const isValidDate = (d: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());

  if (startDate && !isValidDate(startDate)) {
    return jsonError("Invalid start date format", 400);
  }
  if (endDate && !isValidDate(endDate)) {
    return jsonError("Invalid end date format", 400);
  }
  return null;
}

/**
 * Segment filter types
 */
export type SegmentFilters = {
  role: string | null;
  experienceLevel: ExperienceLevel | null;
  industry: string | null;
  background: ProfessionalBackground | null;
};

/**
 * Parse segment filters from URL params
 */
export function parseSegmentFilters(params: URLSearchParams): SegmentFilters {
  const role = params.get("role");
  const experienceLevel = params.get("experienceLevel") as ExperienceLevel | null;
  const industry = params.get("industry");
  const background = params.get("background") as ProfessionalBackground | null;

  return { role, experienceLevel, industry, background };
}

/**
 * Apply segment filters to a Supabase query (single-value .eq() matching).
 * Uses `any` cast because Supabase's PostgrestFilterBuilder generics
 * are too complex to express in a reusable helper without coupling to a specific table.
 */
export function applySegmentFilters<T>(
  query: T,
  filters: SegmentFilters
): T {
  let result = query as any;

  if (filters.role) {
    result = result.eq("professional_role", filters.role);
  }
  if (filters.experienceLevel) {
    result = result.eq("experience_level", filters.experienceLevel);
  }
  if (filters.industry) {
    result = result.eq("industry", filters.industry);
  }
  if (filters.background) {
    result = result.eq("professional_background", filters.background);
  }

  return result;
}

/**
 * Paginated fetch helper for large result sets
 */
export async function paginatedFetch<T>(
  buildQuery: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>,
  pageSize: number = 1000
): Promise<{ data: T[]; error: any }> {
  const rows: T[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data: batch, error } = await buildQuery(from, to);

    if (error) {
      return { data: [], error };
    }

    const items = batch ?? [];
    rows.push(...items);
    hasMore = items.length === pageSize;
    page++;
  }

  return { data: rows, error: null };
}
