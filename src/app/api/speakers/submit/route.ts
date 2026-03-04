import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { validateContentType, validateZodBody, buildPortalUrl } from "@/lib/api/speaker-helpers";
import { handleRouteError } from "@/lib/api/helpers";
import { speakerSubmissionSchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderSpeakerConfirmation } from "@/lib/email/templates/speaker-confirmation";
import { renderAdminNewSubmission } from "@/lib/email/templates/admin-new-submission";

/**
 * POST /api/speakers/submit
 * Submit a speaker proposal for the meetup
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Content-Type
    const contentTypeError = validateContentType(request);
    if (contentTypeError) return contentTypeError;

    // Validate request body
    const validation = await validateZodBody(request, speakerSubmissionSchema);
    if (validation.error) return validation.error;
    const data = validation.data;

    // Insert into Supabase via anon client (only required fields)
    const { error: insertError } = await supabase
      .from("speaker_submissions")
      .insert({
        name: data.name,
        email: data.email,
        talk_title: data.talk_title,
        format: data.format,
        ai_tools_experience: data.ai_tools_experience,
        title_company: data.title_company || null,
        anything_else: data.anything_else || null,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          message: "Failed to submit proposal",
          error:
            process.env.NODE_ENV === "development"
              ? insertError.message
              : undefined,
        },
        { status: 500 }
      );
    }

    // Read back the inserted row via admin client to get the access_token
    const { data: submission, error: readError } = await getSupabaseAdmin()
      .from("speaker_submissions")
      .select("access_token, name, talk_title")
      .eq("email", data.email)
      .eq("talk_title", data.talk_title)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (readError || !submission) {
      console.error("Failed to read back submission:", readError);
      return NextResponse.json(
        { message: "Proposal submitted but failed to send confirmation email" },
        { status: 201 }
      );
    }

    // Build portal URL and send confirmation email
    const portalUrl = buildPortalUrl(submission.access_token);

    try {
      await sendSpeakerEmail({
        to: data.email,
        subject: "We received your talk proposal!",
        html: renderSpeakerConfirmation({
          name: submission.name,
          talkTitle: submission.talk_title,
          portalUrl,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Do not fail the request if email fails — the submission was saved
    }

    // Send admin notification if configured
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      try {
        await sendSpeakerEmail({
          to: adminEmail,
          subject: `New speaker proposal: ${data.talk_title}`,
          html: renderAdminNewSubmission({
            speakerName: data.name,
            speakerEmail: data.email,
            talkTitle: data.talk_title,
            format: data.format,
            titleCompany: data.title_company,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }
    }

    return NextResponse.json(
      { message: "Proposal submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError("API route error", error);
  }
}
