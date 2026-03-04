import { Metadata } from "next";
import { SpeakerForm } from "@/components/speakers/speaker-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Call for Speakers — ${siteConfig.communityName}`,
  description: `Submit your talk proposal for the ${siteConfig.communityName} meetup`,
};

export default function SpeakerSubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Call for Speakers
      </h1>
      <p className="text-muted-foreground mb-8">
        Share your experience with AI coding tools at our next meetup. Fill out
        the form below to submit your proposal.
      </p>
      <SpeakerForm />
    </div>
  );
}
