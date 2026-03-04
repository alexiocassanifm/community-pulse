"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SPEAKER_STATUS_CONFIG, SPEAKER_FORMATS } from "@/constants/speakers";
import type {
  SpeakerSubmissionRow,
  SpeakerMessageRow,
  SpeakerStatus,
} from "@/types/speaker";
import { SpeakerPortalReply } from "@/components/speakers/speaker-portal-reply";
import { SpeakerWithdrawDialog } from "@/components/speakers/speaker-withdraw-dialog";
import { cn } from "@/lib/utils";

interface SpeakerPortalViewProps {
  token?: string;
}

export function SpeakerPortalView({ token }: SpeakerPortalViewProps) {

  const [submission, setSubmission] = useState<SpeakerSubmissionRow | null>(null);
  const [messages, setMessages] = useState<SpeakerMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortalData = useCallback(async () => {
    if (!token) {
      setError("No access token provided. Please use the link from your confirmation email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/speakers/portal?token=${token}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to load submission");
      }

      const data = await response.json();
      setSubmission(data.submission);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid or expired link"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  function handleReplySent() {
    fetchPortalData();
  }

  function handleWithdrawn() {
    fetchPortalData();
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !submission) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load submission</CardTitle>
            <CardDescription>
              {error || "Invalid or expired link. Please check your confirmation email for the correct link."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusConfig = SPEAKER_STATUS_CONFIG[submission.status as SpeakerStatus];
  const formatLabel =
    SPEAKER_FORMATS.find((f) => f.value === submission.format)?.label ??
    submission.format;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Speaker Portal</h1>
        <p className="mt-2 text-muted-foreground">
          View your submission details and communicate with organizers.
        </p>
      </div>

      {/* Submission details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{submission.talk_title}</CardTitle>
              <CardDescription className="mt-1">
                Submitted on{" "}
                {new Date(submission.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            {statusConfig && (
              <Badge
                variant={statusConfig.variant}
                className={cn(statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Name</dt>
              <dd>{submission.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Email</dt>
              <dd>{submission.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Format</dt>
              <dd>{formatLabel}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                AI Tools Experience
              </dt>
              <dd className="whitespace-pre-wrap">
                {submission.ai_tools_experience}
              </dd>
            </div>
            {submission.title_company && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Title / Company
                </dt>
                <dd>{submission.title_company}</dd>
              </div>
            )}
            {submission.assigned_meetup && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Assigned Meetup
                </dt>
                <dd className="font-medium">{submission.assigned_meetup}</dd>
              </div>
            )}
            {submission.anything_else && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Additional Notes
                </dt>
                <dd className="whitespace-pre-wrap">
                  {submission.anything_else}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Messages thread */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
          <CardDescription>
            Conversation with the organizers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. The organizers will reach out when they review
              your submission.
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg border p-3",
                    message.sender_type === "speaker"
                      ? "ml-8 bg-primary/5"
                      : "mr-8 bg-muted"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {message.sender_type === "speaker"
                        ? "You"
                        : "Organizer"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply form - only if not withdrawn */}
      {submission.status !== "withdrawn" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Send a Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <SpeakerPortalReply token={token!} onReplySent={handleReplySent} />
          </CardContent>
        </Card>
      )}

      {/* Withdraw button - only if pending */}
      {submission.status === "pending" && (
        <div className="flex justify-end">
          <SpeakerWithdrawDialog token={token!} onWithdrawn={handleWithdrawn} />
        </div>
      )}
    </div>
  );
}
