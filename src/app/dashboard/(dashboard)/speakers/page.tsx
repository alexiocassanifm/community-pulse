import { Metadata } from "next";
import { SpeakersContent } from "./speakers-content";

export const metadata: Metadata = {
  title: "Speakers — Dashboard",
};

export default function SpeakersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Speaker Submissions</h1>
        <p className="text-muted-foreground">
          Review and manage talk proposals from speakers.
        </p>
      </div>
      <SpeakersContent />
    </div>
  );
}
