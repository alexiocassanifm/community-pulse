"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EVENT_FORMATS, HYBRID_OPTIONS } from "@/constants/event-formats";

interface EventFormatsSectionProps {
  form: UseFormReturn<AnonymousFormData>;
}

export function EventFormatsSection({ form }: EventFormatsSectionProps) {
  const { setValue, watch } = form;

  const formatPresentations = watch("event_formats.format_presentations") || false;
  const formatWorkshops = watch("event_formats.format_workshops") || false;
  const formatDiscussions = watch("event_formats.format_discussions") || false;
  const formatNetworking = watch("event_formats.format_networking") || false;
  const formatHackathons = watch("event_formats.format_hackathons") || false;
  const formatMentoring = watch("event_formats.format_mentoring") || false;
  const formatHybrid = watch("event_formats.format_hybrid") || "";
  const formatCustom = watch("event_formats.format_custom") || "";

  const getFormatValue = (formatId: string): boolean => {
    switch (formatId) {
      case "presentations":
        return formatPresentations;
      case "workshops":
        return formatWorkshops;
      case "discussions":
        return formatDiscussions;
      case "networking":
        return formatNetworking;
      case "hackathons":
        return formatHackathons;
      case "mentoring":
        return formatMentoring;
      default:
        return false;
    }
  };

  const toggleFormat = (formatId: string) => {
    const fieldName = `event_formats.format_${formatId}` as keyof AnonymousFormData;
    const currentValue = getFormatValue(formatId);
    setValue(fieldName as any, !currentValue, { shouldDirty: true });
  };

  const handleCustomFormatChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (value.length <= 500) {
      setValue("event_formats.format_custom", value, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Event Formats</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How do you like to learn and engage? All fields are optional.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Preferred Event Types</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Select the types of events you enjoy attending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EVENT_FORMATS.map((format) => (
              <label
                key={format.id}
                className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={getFormatValue(format.id)}
                  onCheckedChange={() => toggleFormat(format.id)}
                  className="mt-1"
                  aria-label={`Select ${format.label}`}
                />
                <div className="flex-1 space-y-1">
                  <span className="text-sm font-medium">{format.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {format.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Attendance Preference</Label>
            <p className="text-sm text-muted-foreground mt-1">
              How would you prefer to attend events?
            </p>
          </div>

          <RadioGroup
            value={formatHybrid}
            onValueChange={(value) =>
              setValue(
                "event_formats.format_hybrid",
                value as "in_person" | "virtual" | "hybrid" | "no_preference",
                { shouldDirty: true }
              )
            }
          >
            <div className="space-y-2">
              {HYBRID_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem
                    value={option.value}
                    className="mt-1"
                    aria-label={option.label}
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format_custom">Custom Format Ideas</Label>
          <p className="text-sm text-muted-foreground">
            Suggest any other event formats or activities you would enjoy.
          </p>
          <Textarea
            id="format_custom"
            placeholder="e.g., Code reviews, Lightning talks, Book clubs, Coffee chats..."
            value={formatCustom}
            onChange={handleCustomFormatChange}
            className="min-h-[100px] resize-none"
            aria-label="Enter custom event format ideas"
          />
          <div className="flex justify-end">
            <span
              className={`text-xs ${
                formatCustom.length > 480
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {formatCustom.length} / 500 characters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with old name for backward compatibility
export { EventFormatsSection as EventFormatsPlaceholder };
