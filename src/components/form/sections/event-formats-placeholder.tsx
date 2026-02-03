"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";

interface EventFormatsPlaceholderProps {
  form: UseFormReturn<AnonymousFormData>;
}

export function EventFormatsPlaceholder({
  form: _form,
}: EventFormatsPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Event Formats</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How do you like to learn and engage?
        </p>
      </div>
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Event Formats section — coming in Phase 2</p>
      </div>
    </div>
  );
}
