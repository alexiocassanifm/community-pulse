import { Metadata } from "next";
import { SpeakerPortalView } from "@/components/speakers/speaker-portal-view";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Speaker Portal — ${siteConfig.communityName}`,
};

export default async function SpeakerPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <SpeakerPortalView token={token} />;
}
