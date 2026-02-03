"use client";

import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PREDEFINED_TOPICS, TOPIC_CATEGORIES } from "@/constants/topics";

interface TopicsSectionProps {
  form: UseFormReturn<AnonymousFormData>;
}

export function TopicsSection({ form }: TopicsSectionProps) {
  const { setValue, watch } = form;
  const selectedTopics = watch("topics.predefined_topics") || [];
  const customTopics = watch("topics.custom_topics") || "";

  const toggleTopic = (topicId: string) => {
    const current = [...selectedTopics];
    const index = current.indexOf(topicId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(topicId);
    }
    setValue("topics.predefined_topics", current, { shouldDirty: true });
  };

  const handleCustomTopicsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (value.length <= 300) {
      setValue("topics.custom_topics", value, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Topics of Interest</h2>
        <p className="text-sm text-muted-foreground mt-1">
          What topics would you like to see at future events? All fields are
          optional.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Predefined Topics</Label>
          <p className="text-sm text-muted-foreground">
            Select topics that interest you most.
          </p>

          {TOPIC_CATEGORIES.map((category) => {
            const categoryTopics = PREDEFINED_TOPICS.filter(
              (topic) => topic.category === category
            );

            if (categoryTopics.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => toggleTopic(topic.id)}
                        aria-label={`Select ${topic.label}`}
                      />
                      <span className="text-sm">{topic.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_topics">Custom Topics</Label>
          <p className="text-sm text-muted-foreground">
            Add any other topics not listed above (e.g., specific technologies,
            methodologies, or interests).
          </p>
          <Textarea
            id="custom_topics"
            placeholder="e.g., Rust programming, System design, Remote work culture..."
            value={customTopics}
            onChange={handleCustomTopicsChange}
            className="min-h-[100px] resize-none"
            aria-label="Enter custom topics of interest"
          />
          <div className="flex justify-end">
            <span
              className={`text-xs ${
                customTopics.length > 280
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {customTopics.length} / 300 characters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with old name for backward compatibility
export { TopicsSection as TopicsPlaceholder };
