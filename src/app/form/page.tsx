import { Metadata } from "next";
import { AnonymousFormContainer } from "@/components/form/anonymous-form-container";
import { FormErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Share Your Preferences | Claude Code Milan",
  description:
    "Help us create better events by sharing your preferences anonymously. All fields are optional.",
};

export default function FormPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <FormErrorBoundary>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Share Your Preferences Anonymously
            </h1>
            <p className="text-lg text-muted-foreground">
              Help us create events that match your interests and schedule. Your
              responses are completely anonymous and all fields are optional.
            </p>
          </div>

          <AnonymousFormContainer />
        </div>
      </FormErrorBoundary>
    </div>
  );
}
