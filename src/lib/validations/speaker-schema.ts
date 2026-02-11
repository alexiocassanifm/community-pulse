import { z } from "zod";

export const speakerSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  talk_title: z.string().min(1, "Talk title is required").max(300),
  format: z.enum(["speech", "demo", "workshop"], {
    message: "Please select a format",
  }),
  ai_tools_experience: z
    .string()
    .min(1, "Please describe your AI tools experience")
    .max(2000),
  title_company: z.string().max(200).optional().or(z.literal("")),
  anything_else: z.string().max(2000).optional().or(z.literal("")),
});

export type SpeakerSubmissionFormData = z.infer<typeof speakerSubmissionSchema>;

export const statusChangeSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  message: z.string().max(2000).optional(),
  meetup: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

export const tokenSchema = z.object({
  token: z.string().uuid("Invalid token"),
});

export const portalReplySchema = z.object({
  token: z.string().uuid("Invalid token"),
  content: z.string().min(1, "Message cannot be empty").max(2000),
});
