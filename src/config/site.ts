export const siteConfig = {
  communityName:
    process.env.NEXT_PUBLIC_COMMUNITY_NAME || "My Community",
  creatorName: process.env.NEXT_PUBLIC_CREATOR_NAME || "",
  creatorUrl: process.env.NEXT_PUBLIC_CREATOR_URL || "",
  creatorRole: process.env.NEXT_PUBLIC_CREATOR_ROLE || "",
} as const;
