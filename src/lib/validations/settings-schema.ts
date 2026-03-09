import { z } from "zod";

export const communityLinkSchema = z.object({
  enabled: z.boolean(),
  platform: z.enum(["telegram", "whatsapp"]),
  url: z
    .string()
    .url("Please enter a valid URL")
    .max(500)
    .or(z.literal("")),
  label: z.string().max(100),
});

export type CommunityLinkData = z.infer<typeof communityLinkSchema>;
