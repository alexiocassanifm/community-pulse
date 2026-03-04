import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError, handleRouteError } from "@/lib/api/helpers";
import { validateZodBody, buildPortalUrl } from "@/lib/api/speaker-helpers";
import { messageSchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderSpeakerNewMessage } from "@/lib/email/templates/speaker-new-message";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { supabase } = authResult;

    // Validate request body
    const validation = await validateZodBody(request, messageSchema);
    if (validation.error) return validation.error;
    const { content } = validation.data;

    // Fetch submission to get speaker info for email
    const { data: submission, error: fetchError } = await supabase
      .from("speaker_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return jsonError("Submission not found", 404);
    }

    // Insert admin message
    const { error: insertError } = await supabase
      .from("speaker_messages")
      .insert({
        submission_id: id,
        sender_type: "admin",
        content,
      });

    if (insertError) {
      return handleRouteError("Speaker message insert error", insertError);
    }

    // Build portal URL and send email notification
    const portalUrl = buildPortalUrl(submission.access_token);

    try {
      const html = renderSpeakerNewMessage({
        name: submission.name,
        talkTitle: submission.talk_title,
        portalUrl,
      });

      await sendSpeakerEmail({
        to: submission.email,
        subject: `New message about: ${submission.talk_title}`,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send new message email:", emailError);
      // Non-blocking: message was saved successfully, email failure is logged
    }

    return NextResponse.json(
      { message: "Message sent" },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError("Speaker admin message error", error);
  }
}
