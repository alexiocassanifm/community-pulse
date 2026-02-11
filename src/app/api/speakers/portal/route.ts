import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/speakers/portal?token=UUID
 * Fetch speaker submission and messages by access token (public, no auth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Validate token format
    const tokenResult = z.string().uuid().safeParse(token);
    if (!tokenResult.success) {
      return NextResponse.json(
        { message: "Invalid token format" },
        { status: 400 }
      );
    }

    // Look up submission by access token
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("speaker_submissions")
      .select("*")
      .eq("access_token", tokenResult.data)
      .eq("token_revoked", false)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { message: "Submission not found or token revoked" },
        { status: 404 }
      );
    }

    // Fetch messages for this submission
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("speaker_messages")
      .select("*")
      .eq("submission_id", submission.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Failed to fetch messages:", messagesError);
      return NextResponse.json(
        { message: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { submission, messages: messages ?? [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Portal GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
