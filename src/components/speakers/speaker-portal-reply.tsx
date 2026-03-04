"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SpeakerPortalReplyProps {
  token: string;
  onReplySent: () => void;
}

export function SpeakerPortalReply({ token, onReplySent }: SpeakerPortalReplyProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/speakers/portal/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send reply");
      }

      setContent("");
      onReplySent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={sending}
        rows={4}
        maxLength={2000}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={sending || !content.trim()}>
          {sending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}
