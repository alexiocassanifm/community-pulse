import { Metadata } from "next";
import { SpeakerDetailContent } from "./speaker-detail-content";

export const metadata: Metadata = {
  title: "Speaker Detail — Dashboard",
};

export default async function SpeakerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SpeakerDetailContent id={id} />;
}
