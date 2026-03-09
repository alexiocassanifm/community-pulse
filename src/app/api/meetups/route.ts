import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { createMeetupSchema } from "@/lib/validations/meetup-schema";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createMeetupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const { data: meetup, error } = await auth.supabase
      .from("meetups")
      .insert(parsed.data)
      .select()
      .single();

    if (error) {
      console.error("Create meetup error:", error);
      return jsonError("Failed to create meetup", 500);
    }

    return NextResponse.json(meetup, { status: 201 });
  } catch (err) {
    return handleRouteError("POST /api/meetups", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const isOrganizer = !(auth instanceof NextResponse);

    const supabase = isOrganizer ? auth.supabase : createServerClient();

    let query = supabase.from("meetups").select("*").order("date", { ascending: true });

    if (!isOrganizer) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      console.error("List meetups error:", error);
      return jsonError("Failed to list meetups", 500);
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    return handleRouteError("GET /api/meetups", err);
  }
}
