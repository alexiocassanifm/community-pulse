"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SpeakerWithdrawDialogProps {
  token: string;
  onWithdrawn: () => void;
}

export function SpeakerWithdrawDialog({ token, onWithdrawn }: SpeakerWithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    setWithdrawing(true);
    setError(null);

    try {
      const response = await fetch("/api/speakers/portal/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to withdraw submission");
      }

      setOpen(false);
      onWithdrawn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw submission");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Withdraw Submission</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Submission</DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your talk submission? This action
            cannot be undone. You will no longer be considered for a speaking
            slot at this event.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={withdrawing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleWithdraw}
            disabled={withdrawing}
          >
            {withdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
