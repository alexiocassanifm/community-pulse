import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { validateZodBody, buildPortalUrl } from "@/lib/api/speaker-helpers";
import { statusChangeSchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderSpeakerStatusChange } from "@/lib/email/templates/speaker-status-change";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user, supabase } = authResult;

    // Validate request body
    const validation = await validateZodBody(request, statusChangeSchema);
    if (validation.error) return validation.error;
    const { status, message, meetup } = validation.data;

    // Fetch current submission to get old status and speaker info
    const { data: submission, error: fetchError } = await supabase
      .from("speaker_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return jsonError("Submission not found", 404);
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from("speaker_submissions")
      .update({ status, ...(meetup ? { assigned_meetup: meetup } : {}) })
      .eq("id", id);

    if (updateError) {
      return handleRouteError("Speaker status update error", updateError);
    }

    // Insert status history record
    const { error: historyError } = await supabase
      .from("speaker_status_history")
      .insert({
        submission_id: id,
        old_status: submission.status,
        new_status: status,
        changed_by: user.email || "unknown",
        message: message || null,
      });

    if (historyError) {
      console.error("Speaker status history insert error:", historyError);
      // Non-blocking: status was already updated, log but continue
    }

    // If a message was provided, also insert it as an admin message
    if (message) {
      const { error: messageError } = await supabase
        .from("speaker_messages")
        .insert({
          submission_id: id,
          sender_type: "admin",
          content: message,
        });

      if (messageError) {
        console.error("Speaker message insert error:", messageError);
        // Non-blocking: status was already updated, log but continue
      }
    }

    // Build portal URL and send email notification
    const portalUrl = buildPortalUrl(submission.access_token);

    try {
      const html = renderSpeakerStatusChange({
        name: submission.name,
        talkTitle: submission.talk_title,
        newStatus: status,
        message,
        meetup,
        portalUrl,
      });

      await sendSpeakerEmail({
        to: submission.email,
        subject: `Talk proposal update: ${submission.talk_title}`,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send status change email:", emailError);
      // Non-blocking: status was updated successfully, email failure is logged
    }

    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    return handleRouteError("Speaker admin status change error", error);
  }
}
