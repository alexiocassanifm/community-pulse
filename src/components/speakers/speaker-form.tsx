"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  speakerSubmissionSchema,
  type SpeakerSubmissionFormData,
} from "@/lib/validations/speaker-schema";
import { SPEAKER_FORMATS } from "@/constants/speakers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakerSubmissionSuccess } from "@/components/speakers/speaker-submission-success";
import type { MeetupRow } from "@/types/meetup";

export function SpeakerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [meetups, setMeetups] = useState<MeetupRow[]>([]);

  useEffect(() => {
    fetch("/api/meetups")
      .then((res) => (res.ok ? res.json() : []))
      .then(setMeetups)
      .catch(() => {});
  }, []);

  const form = useForm<SpeakerSubmissionFormData>({
    resolver: zodResolver(speakerSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      talk_title: "",
      format: undefined,
      ai_tools_experience: "",
      title_company: "",
      preferred_meetup: "",
      anything_else: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: SpeakerSubmissionFormData) {
    setSubmitError(null);

    try {
      const response = await fetch("/api/speakers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        setSubmitted(true);
        return;
      }

      const result = await response.json();
      setSubmitError(result.message || "Something went wrong. Please try again.");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return <SpeakerSubmissionSuccess />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="talk_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talk title</FormLabel>
              <FormControl>
                <Input
                  placeholder="What would you like to talk about?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPEAKER_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ai_tools_experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI tools experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your experience with AI coding tools (e.g., Claude Code, Copilot, Cursor...)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title_company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title / Company{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Engineer at Acme" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {meetups.length > 0 && (
          <FormField
            control={form.control}
            name="preferred_meetup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Preferred meetup{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {meetups.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title} —{" "}
                        {m.luma_url
                          ? new Date(m.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(m.date).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="anything_else"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Anything else?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Links, additional context, special requirements..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p className="text-sm font-medium text-destructive">{submitError}</p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit proposal"}
        </Button>
      </form>
    </Form>
  );
}
