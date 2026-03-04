import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { validateZodBody, lookupByToken } from "@/lib/api/speaker-helpers";
import { jsonError, handleRouteError } from "@/lib/api/helpers";
import { portalReplySchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderAdminSpeakerReply } from "@/lib/email/templates/admin-speaker-reply";

/**
 * POST /api/speakers/portal/reply
 * Speaker sends a reply message via the portal (public, token-validated)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateZodBody(request, portalReplySchema);
    if (validation.error) return validation.error;
    const { token, content } = validation.data;

    // Look up submission by access token
    const submission = await lookupByToken(token);

    if (!submission) {
      return jsonError("Submission not found or token revoked", 404);
    }

    // Prevent replies on withdrawn submissions
    if (submission.status === "withdrawn") {
      return jsonError("Cannot reply to a withdrawn submission", 400);
    }

    // Insert speaker message
    const { error: insertError } = await getSupabaseAdmin()
      .from("speaker_messages")
      .insert({
        submission_id: submission.id,
        sender_type: "speaker",
        content,
      });

    if (insertError) {
      return handleRouteError("Failed to insert message", insertError);
    }

    // Send admin notification email if configured
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        await sendSpeakerEmail({
          to: adminEmail,
          subject: `New speaker reply: ${submission.talk_title}`,
          html: renderAdminSpeakerReply({
            speakerName: submission.name,
            speakerEmail: submission.email,
            talkTitle: submission.talk_title,
            content,
          }),
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
    return handleRouteError("Portal reply error", error);
  }
}
