import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { updateMeetupSchema } from "@/lib/validations/meetup-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const { data: meetup, error } = await auth.supabase
      .from("meetups")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update meetup error:", error);
      return jsonError("Failed to update meetup", 500);
    }

    return NextResponse.json(meetup);
  } catch (err) {
    return handleRouteError("PATCH /api/meetups/[id]", err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const { count } = await auth.supabase
      .from("speaker_submissions")
      .select("id", { count: "exact", head: true })
      .eq("assigned_meetup", id);

    if (count && count > 0) {
      return jsonError("Cannot delete meetup with assigned speakers", 409);
    }

    const { error } = await auth.supabase
      .from("meetups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete meetup error:", error);
      return jsonError("Failed to delete meetup", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError("DELETE /api/meetups/[id]", err);
  }
}
