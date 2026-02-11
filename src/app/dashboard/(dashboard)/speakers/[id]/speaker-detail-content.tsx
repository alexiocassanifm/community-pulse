"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpeakerStatusBadge } from "@/components/dashboard/speaker-status-badge";
import { SPEAKER_FORMATS } from "@/constants/speakers";
import type {
  SpeakerSubmissionRow,
  SpeakerMessageRow,
  SpeakerStatusHistoryRow,
  SpeakerStatus,
} from "@/types/speaker";

function getFormatLabel(format: string): string {
  return SPEAKER_FORMATS.find((f) => f.value === format)?.label ?? format;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded bg-muted" />
      <div className="h-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function SpeakerDetailContent({ id }: { id: string }) {
  const [submission, setSubmission] = useState<SpeakerSubmissionRow | null>(
    null
  );
  const [messages, setMessages] = useState<SpeakerMessageRow[]>([]);
  const [history, setHistory] = useState<SpeakerStatusHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusMeetup, setStatusMeetup] = useState("");
  const [statusAction, setStatusAction] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/speakers/admin/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission);
        setMessages(data.messages ?? []);
        setHistory(data.history ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusChange = async (status: "accepted" | "rejected") => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/speakers/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(statusMessage.trim() ? { message: statusMessage.trim() } : {}),
          ...(statusMeetup.trim() ? { meetup: statusMeetup.trim() } : {}),
        }),
      });
      if (res.ok) {
        setStatusAction(null);
        setStatusMessage("");
        setStatusMeetup("");
        await fetchDetail();
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/speakers/admin/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchDetail();
      }
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!submission) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/speakers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Speakers
          </Link>
        </Button>
        <p className="text-muted-foreground">Submission not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard/speakers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Speakers
        </Link>
      </Button>

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{submission.talk_title}</CardTitle>
              <CardDescription>by {submission.name}</CardDescription>
            </div>
            <SpeakerStatusBadge status={submission.status as SpeakerStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{submission.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Format
              </p>
              <p className="text-sm">{getFormatLabel(submission.format)}</p>
            </div>
            {submission.title_company && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Title / Company
                </p>
                <p className="text-sm">{submission.title_company}</p>
              </div>
            )}
            {submission.assigned_meetup && (
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned Meetup
                </p>
                <p className="text-sm font-medium">{submission.assigned_meetup}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Submitted
              </p>
              <p className="text-sm">
                {new Date(submission.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AI Tools Experience
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {submission.ai_tools_experience}
            </p>
          </div>
          {submission.anything_else && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Additional Notes
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">
                {submission.anything_else}
              </p>
            </div>
          )}

          {/* Status Actions */}
          {submission.status === "pending" && (
            <div className="border-t pt-4">
              {statusAction === null ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setStatusAction("accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setStatusAction("rejected")}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {statusAction === "accepted" ? "Accept" : "Reject"} this
                    submission
                  </p>
                  {statusAction === "accepted" && (
                    <input
                      type="text"
                      placeholder="Assigned meetup (e.g. Milan Meetup #3 — March 2026)"
                      value={statusMeetup}
                      onChange={(e) => setStatusMeetup(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  )}
                  <Textarea
                    placeholder="Optional message to the speaker..."
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        statusAction === "accepted" ? "default" : "destructive"
                      }
                      disabled={statusUpdating}
                      onClick={() => handleStatusChange(statusAction)}
                    >
                      {statusUpdating
                        ? "Updating..."
                        : `Confirm ${statusAction === "accepted" ? "Accept" : "Reject"}`}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={statusUpdating}
                      onClick={() => {
                        setStatusAction(null);
                        setStatusMessage("");
                        setStatusMeetup("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    msg.sender_type === "admin"
                      ? "bg-primary/10 ml-8"
                      : "bg-muted mr-8"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {msg.sender_type === "admin" ? "Admin" : "Speaker"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Message Composer */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a message to the speaker..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                size="icon"
                disabled={!newMessage.trim() || sendingMessage}
                onClick={handleSendMessage}
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                  <div className="flex-1">
                    <p>
                      {entry.old_status ? (
                        <>
                          Changed from{" "}
                          <span className="font-medium">{entry.old_status}</span>{" "}
                          to{" "}
                          <span className="font-medium">{entry.new_status}</span>
                        </>
                      ) : (
                        <>
                          Set to{" "}
                          <span className="font-medium">{entry.new_status}</span>
                        </>
                      )}
                    </p>
                    {entry.message && (
                      <p className="mt-1 text-muted-foreground">
                        {entry.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()} by{" "}
                      {entry.changed_by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
