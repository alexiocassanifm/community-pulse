import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { lookupByToken } from "@/lib/api/speaker-helpers";
import { jsonError, handleRouteError } from "@/lib/api/helpers";

/**
 * GET /api/speakers/portal?token=UUID
 * Fetch speaker submission and messages by access token (public, no auth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return jsonError("Token is required", 400);
    }

    // Look up submission by access token
    const submission = await lookupByToken(token);

    if (!submission) {
      return jsonError("Submission not found or token revoked", 404);
    }

    // Fetch messages for this submission
    const { data: messages, error: messagesError } = await getSupabaseAdmin()
      .from("speaker_messages")
      .select("*")
      .eq("submission_id", submission.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return handleRouteError("Failed to fetch messages", messagesError);
    }

    return NextResponse.json(
      { submission, messages: messages ?? [] },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError("Portal GET error", error);
  }
}
