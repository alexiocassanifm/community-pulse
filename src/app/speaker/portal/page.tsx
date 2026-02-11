import { Metadata } from "next";
import { SpeakerPortalView } from "@/components/speakers/speaker-portal-view";

export const metadata: Metadata = {
  title: "Speaker Portal — Claude Code Milan",
};

export default async function SpeakerPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <SpeakerPortalView token={token} />;
}
