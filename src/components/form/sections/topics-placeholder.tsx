"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";

interface TopicsPlaceholderProps {
  form: UseFormReturn<AnonymousFormData>;
}

export function TopicsPlaceholder({ form: _form }: TopicsPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Topics of Interest</h2>
        <p className="text-sm text-muted-foreground mt-1">
          What topics would you like to see at future events? All fields are optional.
        </p>
      </div>
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Topics section — coming in Phase 2</p>
      </div>
    </div>
  );
}
