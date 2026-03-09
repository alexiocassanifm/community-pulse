import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { SpeakerSubmissionRow } from "@/types/speaker";

/**
 * Validate request JSON body with Zod schema
 * Returns {data, rawBody} on success or {error: NextResponse} on failure
 * rawBody contains the original parsed JSON for accessing non-schema fields
 */
export async function validateZodBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; rawBody: any; error: null } | { data: null; rawBody: null; error: NextResponse }> {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return {
        data: null,
        rawBody: null,
        error: NextResponse.json(
          {
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        ),
      };
    }

    return { data: parsed.data, rawBody: body, error: null };
  } catch {
    return {
      data: null,
      rawBody: null,
      error: NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate Content-Type is application/json
 * Returns error NextResponse or null
 */
export function validateContentType(req: NextRequest): NextResponse | null {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { message: "Content-Type must be application/json" },
      { status: 415 }
    );
  }
  return null;
}

/**
 * Build speaker portal URL from access token
 */
export function buildPortalUrl(accessToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/speaker/portal?token=${accessToken}`;
}

/**
 * Look up speaker submission by access token
 * Returns submission or null if not found/revoked
 */
export async function lookupByToken(token: string): Promise<SpeakerSubmissionRow | null> {
  // Validate token format first
  const tokenResult = z.string().uuid().safeParse(token);
  if (!tokenResult.success) {
    return null;
  }

  const { data: submission, error } = await getSupabaseAdmin()
    .from("speaker_submissions")
    .select("*")
    .eq("access_token", tokenResult.data)
    .eq("token_revoked", false)
    .single();

  if (error || !submission) {
    return null;
  }

  return submission as SpeakerSubmissionRow;
}
