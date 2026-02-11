import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch submission
    const { data: submission, error: submissionError } = await supabase
      .from("speaker_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
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
      console.error("Speaker messages query error:", messagesResult.error);
      return NextResponse.json(
        { message: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    if (historyResult.error) {
      console.error("Speaker history query error:", historyResult.error);
      return NextResponse.json(
        { message: "Failed to fetch status history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submission,
      messages: messagesResult.data || [],
      history: historyResult.data || [],
    });
  } catch (error) {
    console.error("Speaker admin detail error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
