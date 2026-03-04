"use client";

import { Shield } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Your privacy is protected</p>
        <p>
          This form is completely anonymous. We do not collect any personally
          identifiable information. All fields are optional — share only what
          you&apos;re comfortable with.
        </p>
      </div>
    </div>
  );
}
