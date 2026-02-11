import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { portalReplySchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";

/**
 * POST /api/speakers/portal/reply
 * Speaker sends a reply message via the portal (public, token-validated)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = portalReplySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, content } = validationResult.data;

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

    // Prevent replies on withdrawn submissions
    if (submission.status === "withdrawn") {
      return NextResponse.json(
        { message: "Cannot reply to a withdrawn submission" },
        { status: 400 }
      );
    }

    // Insert speaker message
    const { error: insertError } = await supabaseAdmin
      .from("speaker_messages")
      .insert({
        submission_id: submission.id,
        sender_type: "speaker",
        content,
      });

    if (insertError) {
      console.error("Failed to insert message:", insertError);
      return NextResponse.json(
        { message: "Failed to send reply" },
        { status: 500 }
      );
    }

    // Send admin notification email if configured
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        await sendSpeakerEmail({
          to: adminEmail,
          subject: `New speaker reply: ${submission.talk_title}`,
          html: `
            <h2>New reply from speaker</h2>
            <p><strong>Speaker:</strong> ${submission.name} (${submission.email})</p>
            <p><strong>Talk:</strong> ${submission.talk_title}</p>
            <hr />
            <p>${content}</p>
          `,
        });
      } catch (emailError) {
        // Do not fail the request if notification email fails
        console.error("Failed to send admin notification:", emailError);
      }
    }

    return NextResponse.json(
      { message: "Reply sent" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Portal reply error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
