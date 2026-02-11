import { Metadata } from "next";
import { SpeakerForm } from "@/components/speakers/speaker-form";

export const metadata: Metadata = {
  title: "Call for Speakers — Claude Code Milan",
  description: "Submit your talk proposal for the Claude Code Milan meetup",
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
