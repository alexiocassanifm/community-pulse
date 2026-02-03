"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubmissionSuccessModal({
  open,
  onClose,
}: SubmissionSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
          <DialogDescription className="text-center text-base">
            Your preferences have been submitted successfully.
          </DialogDescription>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <span className="block">We&apos;ll use your feedback to plan amazing meetup events</span>
            <span className="block">Your responses were saved anonymously</span>
            <span className="block">You&apos;ll see events that match your interests</span>
          </div>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} size="lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
