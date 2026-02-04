import { z } from "zod";

/**
 * Professional Background Section Schema
 */
export const professionalBackgroundSchema = z.object({
  professional_role: z.string().max(100).optional(),
  experience_level: z
    .enum(["junior", "mid", "senior", "lead", "executive"])
    .optional(),
  industry: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
});

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
  professional_background: professionalBackgroundSchema.optional(),
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
