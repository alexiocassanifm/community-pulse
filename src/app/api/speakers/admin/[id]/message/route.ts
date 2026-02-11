import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderSpeakerNewMessage } from "@/lib/email/templates/speaker-new-message";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authClient = await createAuthClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content } = parsed.data;
    const supabase = createServerClient();

    // Fetch submission to get speaker info for email
    const { data: submission, error: fetchError } = await supabase
      .from("speaker_submissions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
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
      console.error("Speaker message insert error:", insertError);
      return NextResponse.json(
        { message: "Failed to send message" },
        { status: 500 }
      );
    }

    // Build portal URL and send email notification
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/speaker/portal?token=${submission.access_token}`;

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
    console.error("Speaker admin message error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
