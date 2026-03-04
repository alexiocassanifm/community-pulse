"use client";

import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {isLastStep ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm submission</AlertDialogTitle>
              <AlertDialogDescription>
                Once submitted, your preferences cannot be modified. Please make sure your answers are correct before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go back and review</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit}>
                Submit preferences
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button type="button" onClick={onNext} disabled={isSubmitting} className="gap-2">
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
