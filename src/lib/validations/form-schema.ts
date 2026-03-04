import { z } from "zod";
import { PROFESSIONAL_ROLE_VALUES } from "@/constants/professional-roles";
import { INDUSTRY_VALUES } from "@/constants/industries";

/**
 * Professional Background Section Schema
 */
export const professionalBackgroundSchema = z
  .object({
    professional_background: z.enum(["tech", "business", "design", "other"], {
      message: "Please select your background type",
    }),
    professional_role: z.enum(
      PROFESSIONAL_ROLE_VALUES as unknown as [string, ...string[]],
      { message: "Please select your current role" }
    ),
    professional_role_other: z.string().max(100).optional(),
    experience_level: z.enum(["junior", "mid", "senior", "lead", "executive"], {
      message: "Please select your experience level",
    }),
    industry: z.enum(
      INDUSTRY_VALUES as unknown as [string, ...string[]],
      { message: "Please select your industry" }
    ),
    industry_other: z.string().max(100).optional(),
    skills: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      data.professional_role !== "other" ||
      (data.professional_role_other && data.professional_role_other.trim().length > 0),
    {
      message: "Please specify your role",
      path: ["professional_role_other"],
    }
  )
  .refine(
    (data) =>
      data.industry !== "other" ||
      (data.industry_other && data.industry_other.trim().length > 0),
    {
      message: "Please specify your industry",
      path: ["industry_other"],
    }
  );

/**
 * Availability Section Schema
 */
export const availabilitySchema = z.object({
  preferred_days: z.array(z.string()).optional(),
  preferred_times: z
    .array(z.enum(["morning", "afternoon", "evening", "flexible"]))
    .optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).optional(),
});

/**
 * Event Formats Section Schema
 */
export const eventFormatsSchema = z.object({
  format_presentations: z.boolean().optional(),
  format_workshops: z.boolean().optional(),
  format_discussions: z.boolean().optional(),
  format_networking: z.boolean().optional(),
  format_hackathons: z.boolean().optional(),
  format_mentoring: z.boolean().optional(),
  format_hybrid: z
    .enum(["in_person", "virtual", "hybrid", "no_preference"])
    .optional(),
  format_custom: z.string().max(500).optional(),
});

/**
 * Topics Section Schema
 */
export const topicsSchema = z.object({
  predefined_topics: z.array(z.string()).optional(),
  custom_topics: z.string().max(300).optional(),
});

/**
 * GDPR Section Schema
 */
export const gdprSchema = z.object({
  data_retention_acknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the data retention policy to submit"
  }),
});

/**
 * Combined Anonymous Form Schema
 * All fields are optional except GDPR consent which is required for submission
 */
export const anonymousFormSchema = z.object({
  professional_background: professionalBackgroundSchema,
  availability: availabilitySchema.optional(),
  event_formats: eventFormatsSchema.optional(),
  topics: topicsSchema.optional(),
  gdpr: gdprSchema,
});

/**
 * TypeScript type inferred from the schema
 */
export type AnonymousFormData = z.infer<typeof anonymousFormSchema>;

/**
 * Individual section types for granular type checking
 */
export type ProfessionalBackgroundData = z.infer<
  typeof professionalBackgroundSchema
>;
export type AvailabilityData = z.infer<typeof availabilitySchema>;
export type EventFormatsData = z.infer<typeof eventFormatsSchema>;
export type TopicsData = z.infer<typeof topicsSchema>;
export type GdprData = z.infer<typeof gdprSchema>;
