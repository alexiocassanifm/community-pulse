import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { assignMeetupSchema } from "@/lib/validations/meetup-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await req.json();
    const parsed = assignMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const { data: speaker } = await auth.supabase
      .from("speaker_submissions")
      .select("status")
      .eq("id", id)
      .single();

    if (!speaker || speaker.status !== "accepted") {
      return jsonError("Only accepted speakers can be assigned to meetups", 400);
    }

    const { data, error } = await auth.supabase
      .from("speaker_submissions")
      .update({ assigned_meetup: parsed.data.meetup_id })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Assign meetup error:", error);
      return jsonError("Failed to assign meetup", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError("PATCH /api/speakers/admin/[id]/assign-meetup", err);
  }
}
