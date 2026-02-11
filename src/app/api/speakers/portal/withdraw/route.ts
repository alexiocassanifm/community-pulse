import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { tokenSchema } from "@/lib/validations/speaker-schema";

/**
 * POST /api/speakers/portal/withdraw
 * Speaker withdraws their submission via the portal (public, token-validated)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = tokenSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Look up submission by access token
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("speaker_submissions")
      .select("*")
      .eq("access_token", token)
      .eq("token_revoked", false)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { message: "Submission not found or token revoked" },
        { status: 404 }
      );
    }

    // Prevent double withdrawal
    if (submission.status === "withdrawn") {
      return NextResponse.json(
        { message: "Already withdrawn" },
        { status: 400 }
      );
    }

    // Update submission status to withdrawn
    const { error: updateError } = await supabaseAdmin
      .from("speaker_submissions")
      .update({ status: "withdrawn" })
      .eq("id", submission.id);

    if (updateError) {
      console.error("Failed to update status:", updateError);
      return NextResponse.json(
        { message: "Failed to withdraw submission" },
        { status: 500 }
      );
    }

    // Insert status history record
    const { error: historyError } = await supabaseAdmin
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
    console.error("Portal withdraw error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
