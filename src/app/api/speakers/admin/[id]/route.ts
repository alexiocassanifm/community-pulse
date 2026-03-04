import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    // Fetch submission
    const { data: submission, error: submissionError } = await supabase
      .from("speaker_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (submissionError || !submission) {
      return jsonError("Submission not found", 404);
    }

    // Fetch messages and status history in parallel
    const [messagesResult, historyResult] = await Promise.all([
      supabase
        .from("speaker_messages")
        .select("*")
        .eq("submission_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("speaker_status_history")
        .select("*")
        .eq("submission_id", id)
        .order("created_at", { ascending: true }),
    ]);

    if (messagesResult.error) {
      return handleRouteError("Speaker messages query error", messagesResult.error);
    }

    if (historyResult.error) {
      return handleRouteError("Speaker history query error", historyResult.error);
    }

    return NextResponse.json({
      submission,
      messages: messagesResult.data || [],
      history: historyResult.data || [],
    });
  } catch (error) {
    return handleRouteError("Speaker admin detail error", error);
  }
}
