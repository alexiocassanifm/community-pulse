import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { speakerSubmissionSchema } from "@/lib/validations/speaker-schema";
import { sendSpeakerEmail } from "@/lib/email/send-speaker-email";
import { renderSpeakerConfirmation } from "@/lib/email/templates/speaker-confirmation";

/**
 * POST /api/speakers/submit
 * Submit a speaker proposal for the meetup
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = speakerSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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
    const { data: submission, error: readError } = await supabaseAdmin
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
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portalUrl = `${baseUrl}/speaker/portal?token=${submission.access_token}`;

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

    return NextResponse.json(
      { message: "Proposal submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
