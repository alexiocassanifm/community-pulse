import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import type { SpeakerSubmissionListItem, SpeakerSubmissionRow, SpeakerStatus } from "@/types/speaker";

const VALID_STATUSES: SpeakerStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (status && !VALID_STATUSES.includes(status as SpeakerStatus)) {
      return jsonError("Invalid status filter", 400);
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
      return handleRouteError("Speaker list query error", submissionsError);
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
      return handleRouteError("Speaker message counts query error", messageCountsError);
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
    return handleRouteError("Speaker admin list error", error);
  }
}
