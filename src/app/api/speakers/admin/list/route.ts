import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import type { SpeakerSubmissionListItem, SpeakerSubmissionRow, SpeakerStatus } from "@/types/speaker";

const VALID_STATUSES: SpeakerStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
];

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
    const status = searchParams.get("status");

    if (status && !VALID_STATUSES.includes(status as SpeakerStatus)) {
      return NextResponse.json(
        { message: "Invalid status filter" },
        { status: 400 }
      );
    }

    // Fetch submissions
    let query = supabase
      .from("speaker_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error("Speaker list query error:", submissionsError);
      return NextResponse.json(
        { message: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    // Fetch message counts for all submissions
    const ids = submissions.map((s) => s.id);
    const { data: messageCounts, error: messageCountsError } = await supabase
      .from("speaker_messages")
      .select("submission_id")
      .in("submission_id", ids);

    if (messageCountsError) {
      console.error("Speaker message counts query error:", messageCountsError);
      return NextResponse.json(
        { message: "Failed to fetch message counts" },
        { status: 500 }
      );
    }

    const countMap: Record<string, number> = {};
    for (const m of messageCounts || []) {
      countMap[m.submission_id] = (countMap[m.submission_id] || 0) + 1;
    }

    const result: SpeakerSubmissionListItem[] = submissions.map((s) => ({
      ...(s as unknown as SpeakerSubmissionRow),
      message_count: countMap[s.id] || 0,
    }));

    return NextResponse.json({ submissions: result });
  } catch (error) {
    console.error("Speaker admin list error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
