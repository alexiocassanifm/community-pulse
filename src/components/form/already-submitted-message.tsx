"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface AlreadySubmittedMessageProps {
  timestamp?: string;
}

export function AlreadySubmittedMessage({
  timestamp,
}: AlreadySubmittedMessageProps) {
  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-col items-center space-y-4 pb-2">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Thank You!</h2>
      </CardHeader>
      <CardContent className="text-center space-y-3">
        <p className="text-muted-foreground">
          You&apos;ve already submitted your response.
        </p>
        {formattedDate && (
          <p className="text-sm text-muted-foreground">
            Submitted on {formattedDate}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Need to update your response? Contact the event organizer.
        </p>
      </CardContent>
    </Card>
  );
}
