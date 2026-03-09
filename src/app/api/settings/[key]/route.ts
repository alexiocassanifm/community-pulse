import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { communityLinkSchema } from "@/lib/validations/settings-schema";
import type { z } from "zod";

const validators: Record<string, z.ZodSchema> = {
  community_link: communityLinkSchema,
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { key } = await params;
    const validator = validators[key];
    if (!validator) {
      return jsonError("Unknown setting key", 404);
    }

    const body = await req.json();
    const parsed = validator.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Invalid data",
        400
      );
    }

    const { data, error } = await auth.supabase
      .from("site_settings")
      .update({ value: parsed.data as Record<string, unknown> })
      .eq("key", key)
      .select()
      .single();

    if (error) {
      console.error(`Update setting "${key}" error:`, error);
      return jsonError("Failed to update setting", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError("PATCH /api/settings/[key]", err);
  }
}
