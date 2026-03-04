import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpeakerSubmissionSuccess() {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="rounded-full bg-green-100 p-3 mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Proposal submitted!
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We&apos;ve sent a confirmation email with a link to track your
        submission status.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
