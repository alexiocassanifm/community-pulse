import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { anonymousFormSchema } from "@/lib/validations/form-schema";
import { Database } from "@/types/database.types";

type AnonymousSubmissionInsert =
  Database["public"]["Tables"]["anonymous_submissions"]["Insert"];

function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * POST /api/submit-preferences
 * Submit anonymous form preferences with duplicate detection
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

    // Extract and hash IP for duplicate detection
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
    const ipHash = hashIP(ip);

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
    const deviceId = body.device_id;

    // Check for existing submission within 24h from same IP
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: existing } = await supabaseAdmin
      .from("anonymous_submissions")
      .select("id, submitted_at")
      .eq("ip_hash", ipHash)
      .gte("submitted_at", twentyFourHoursAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          message:
            "You have already submitted your preferences recently. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Calculate completion percentage (including GDPR as 5th section)
    const sections = [
      "professional_background",
      "availability",
      "event_formats",
      "topics",
      "gdpr",
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
      professional_background: data.professional_background?.professional_background || null,
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

      // GDPR (cast to boolean since z.literal(true) is validated above)
      data_retention_acknowledged: true,

      // Metadata
      submission_timestamp: new Date().toISOString(),
      form_version: "1.0",
      completion_percentage: completionPercentage,

      // Duplicate Prevention
      ip_hash: ipHash,
      device_id: deviceId || null,
      submitted_at: new Date().toISOString(),
    };

    // Insert into Supabase (anon role can only INSERT, not SELECT)
    const { error } = await supabase
      .from("anonymous_submissions")
      .insert(insertData);

    if (error) {
      console.error("Supabase insert error:", error);

      // Provide more specific error messages
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Duplicate submission detected" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: "Failed to submit preferences",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
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

