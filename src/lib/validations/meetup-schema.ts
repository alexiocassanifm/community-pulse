import { z } from "zod";

export const createMeetupSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required").max(500),
  luma_url: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  homepage_visible: z.boolean().optional(),
  status: z.enum(["draft", "published", "past"]).optional(),
});

export const updateMeetupSchema = createMeetupSchema.partial();

export const assignMeetupSchema = z.object({
  meetup_id: z.string().uuid("Invalid meetup ID").nullable(),
});

export type CreateMeetupData = z.infer<typeof createMeetupSchema>;
export type UpdateMeetupData = z.infer<typeof updateMeetupSchema>;
