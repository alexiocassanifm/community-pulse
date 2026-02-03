import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { anonymousFormSchema } from "@/lib/validations/form-schema";
import { Database } from "@/types/database.types";

type AnonymousSubmissionInsert =
  Database["public"]["Tables"]["anonymous_submissions"]["Insert"];

/**
 * POST /api/submit-preferences
 * Submit anonymous form preferences
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = anonymousFormSchema.safeParse(body);
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

    // Calculate completion percentage
    const sections = [
      "professional_background",
      "availability",
      "event_formats",
      "topics",
    ] as const;

    let filledSections = 0;
    sections.forEach((section) => {
      const sectionData = data[section];
      if (sectionData && typeof sectionData === "object") {
        const hasValues = Object.values(sectionData).some((value) => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === "boolean") return value === true;
          if (typeof value === "string") return value.trim().length > 0;
          return value !== undefined && value !== null;
        });
        if (hasValues) filledSections++;
      }
    });

    const completionPercentage = Math.round((filledSections / sections.length) * 100);

    // Prepare data for database insertion
    const insertData: AnonymousSubmissionInsert = {
      // Professional Background
      professional_role: data.professional_background?.professional_role || null,
      experience_level: data.professional_background?.experience_level || null,
      industry: data.professional_background?.industry || null,
      skills: data.professional_background?.skills || null,

      // Availability
      preferred_days: data.availability?.preferred_days || null,
      preferred_times: data.availability?.preferred_times || null,
      frequency: data.availability?.frequency || null,

      // Event Formats
      format_presentations: data.event_formats?.format_presentations || false,
      format_workshops: data.event_formats?.format_workshops || false,
      format_discussions: data.event_formats?.format_discussions || false,
      format_networking: data.event_formats?.format_networking || false,
      format_hackathons: data.event_formats?.format_hackathons || false,
      format_mentoring: data.event_formats?.format_mentoring || false,
      format_hybrid: data.event_formats?.format_hybrid || null,
      format_custom: data.event_formats?.format_custom || null,

      // Topics
      predefined_topics: data.topics?.predefined_topics || null,
      custom_topics: data.topics?.custom_topics || null,

      // GDPR
      data_retention_acknowledged:
        data.gdpr?.data_retention_acknowledged || false,

      // Metadata
      submission_timestamp: new Date().toISOString(),
      form_version: "1.0",
      completion_percentage: completionPercentage,
    };

    // Insert into Supabase (anon role can only INSERT, not SELECT)
    const { error } = await supabase
      .from("anonymous_submissions")
      .insert(insertData);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          message: "Failed to submit preferences",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Success response (no ID returned due to anon role permissions)
    return NextResponse.json(
      {
        message: "Preferences submitted successfully",
        completion_percentage: completionPercentage,
      },
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

// TODO: Consider implementing rate limiting to prevent abuse
// TODO: Add analytics/telemetry for submission tracking (anonymously)
