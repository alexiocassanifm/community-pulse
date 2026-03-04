import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { validateZodBody, lookupByToken } from "@/lib/api/speaker-helpers";
import { jsonError, handleRouteError } from "@/lib/api/helpers";
import { tokenSchema } from "@/lib/validations/speaker-schema";

/**
 * POST /api/speakers/portal/withdraw
 * Speaker withdraws their submission via the portal (public, token-validated)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateZodBody(request, tokenSchema);
    if (validation.error) return validation.error;
    const { token } = validation.data;

    // Look up submission by access token
    const submission = await lookupByToken(token);

    if (!submission) {
      return jsonError("Submission not found or token revoked", 404);
    }

    // Prevent double withdrawal
    if (submission.status === "withdrawn") {
      return jsonError("Already withdrawn", 400);
    }

    // Update submission status to withdrawn
    const { error: updateError } = await getSupabaseAdmin()
      .from("speaker_submissions")
      .update({ status: "withdrawn" })
      .eq("id", submission.id);

    if (updateError) {
      return handleRouteError("Failed to update status", updateError);
    }

    // Insert status history record
    const { error: historyError } = await getSupabaseAdmin()
      .from("speaker_status_history")
      .insert({
        submission_id: submission.id,
        old_status: submission.status,
        new_status: "withdrawn",
        changed_by: "speaker",
      });

    if (historyError) {
      // Log but do not fail — the status was already updated
      console.error("Failed to insert status history:", historyError);
    }

    return NextResponse.json(
      { message: "Submission withdrawn" },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError("Portal withdraw error", error);
  }
}
