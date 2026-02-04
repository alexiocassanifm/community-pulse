"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAnonymousForm } from "./use-anonymous-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from "@/lib/form-persistence";
import { StepState, FORM_SECTIONS } from "@/types/form";
import { useToast } from "@/hooks/use-toast";

const STEPS_STORAGE_KEY = "anonymous-form-steps";

function initializeStepStates(): StepState[] {
  return FORM_SECTIONS.map((section, index) => ({
    sectionId: section.id,
    status: index === 0 ? "active" : "available",
    completionPercentage: 0,
  }));
}

function loadStepStates(): StepState[] | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STEPS_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveStepStates(states: StepState[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(states));
  } catch {}
}

function isSectionFilled(
  data: Partial<AnonymousFormData>,
  sectionId: string
): boolean {
  const sectionData = data[sectionId as keyof AnonymousFormData];
  if (!sectionData || typeof sectionData !== "object") return false;

  return Object.values(sectionData).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value === true;
    if (typeof value === "string") return value.trim().length > 0;
    return value !== undefined && value !== null;
  });
}

export function useMultiStepForm() {
  const { toast } = useToast();

  const savedData = loadFormDraft();
  const form = useAnonymousForm(savedData || undefined);

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = loadStepStates();
    if (saved && saved.length === FORM_SECTIONS.length) {
      const activeIndex = saved.findIndex((s) => s.status !== "completed");
      return activeIndex >= 0 ? activeIndex : saved.length - 1;
    }
    return 0;
  });

  const [stepStates, setStepStates] = useState<StepState[]>(() => {
    const saved = loadStepStates();
    if (saved && saved.length === FORM_SECTIONS.length) return saved;
    return initializeStepStates();
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-save with subscription (not watch() at top level which causes infinite re-renders)
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveFormDraft(data as Partial<AnonymousFormData>);
      }, 1000);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form]);

  // Save step states whenever they change
  useEffect(() => {
    saveStepStates(stepStates);
  }, [stepStates]);

  /**
   * Calculate overall progress percentage
   */
  const progress = useMemo((): number => {
    const completedCount = stepStates.filter(
      (s) => s.status === "completed"
    ).length;
    return Math.round((completedCount / FORM_SECTIONS.length) * 100);
  }, [stepStates]);

  /**
   * Update step state for a specific step
   */
  const updateStepState = useCallback(
    (index: number, updates: Partial<StepState>) => {
      setStepStates((prev) =>
        prev.map((state, i) => (i === index ? { ...state, ...updates } : state))
      );
    },
    []
  );

  /**
   * Check if can navigate to a specific step
   */
  const canNavigateToStep = useCallback(
    (index: number): boolean => {
      if (index === currentStep) return false;
      const targetState = stepStates[index];
      return targetState.status !== "locked";
    },
    [currentStep, stepStates]
  );

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback(
    (index: number) => {
      if (!canNavigateToStep(index)) return;

      // Mark current step as visited if not completed
      if (stepStates[currentStep].status !== "completed") {
        updateStepState(currentStep, { status: "visited" });
      }

      // Update all step states
      setStepStates((prev) =>
        prev.map((state, i) => {
          if (i === index) {
            return { ...state, status: "active" };
          } else if (i === currentStep) {
            return {
              ...state,
              status: state.status === "completed" ? "completed" : "visited",
            };
          }
          return state;
        })
      );

      setCurrentStep(index);
    },
    [canNavigateToStep, currentStep, stepStates, updateStepState]
  );

  /**
   * Navigate to next step
   */
  const goToNext = useCallback(() => {
    if (currentStep >= FORM_SECTIONS.length - 1) return;

    const currentSectionId = FORM_SECTIONS[currentStep].id;
    const currentValues = form.getValues();
    const isFilled = isSectionFilled(currentValues, currentSectionId);

    const nextStep = currentStep + 1;
    setStepStates((prev) =>
      prev.map((state, i) => {
        if (i === nextStep) return { ...state, status: "active" };
        if (i === currentStep) return { ...state, status: isFilled ? "completed" : "visited" };
        return state;
      })
    );
    setCurrentStep(nextStep);
  }, [currentStep, form]);

  /**
   * Navigate to previous step
   */
  const goToPrevious = useCallback(() => {
    if (currentStep <= 0) return;

    // Mark current step as visited if not completed
    if (stepStates[currentStep].status !== "completed") {
      updateStepState(currentStep, { status: "visited" });
    }

    const prevStep = currentStep - 1;
    setStepStates((prev) =>
      prev.map((state, i) => {
        if (i === prevStep) {
          return { ...state, status: "active" };
        } else if (i === currentStep) {
          return {
            ...state,
            status: state.status === "completed" ? "completed" : "visited",
          };
        }
        return state;
      })
    );

    setCurrentStep(prevStep);
  }, [currentStep, stepStates, updateStepState]);

  /**
   * Handle form submission
   */
  const handleFormSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const currentValues = form.getValues();
      const response = await fetch("/api/submit-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentValues),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit preferences");
      }

      // Clear localStorage on success
      clearFormDraft();
      if (typeof window !== "undefined") {
        localStorage.removeItem(STEPS_STORAGE_KEY);
      }

      // Show success modal
      setShowSuccessModal(true);

      // Reset form with empty defaults (not initial saved data)
      form.reset({
        professional_background: {
          professional_role: "",
          experience_level: undefined,
          industry: "",
          skills: [],
        },
        availability: {
          preferred_days: [],
          preferred_times: [],
          frequency: undefined,
        },
        event_formats: {
          format_presentations: false,
          format_workshops: false,
          format_discussions: false,
          format_networking: false,
          format_hackathons: false,
          format_mentoring: false,
          format_hybrid: undefined,
          format_custom: "",
        },
        topics: {
          predefined_topics: [],
          custom_topics: "",
        },
        gdpr: {
          data_retention_acknowledged: false,
        },
      });
      setStepStates(initializeStepStates());
      setCurrentStep(0);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission failed",
        description:
          error instanceof Error
            ? error.message
            : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, toast]);

  return {
    form,
    currentStep,
    stepStates,
    progress,
    goToNext,
    goToPrevious,
    goToStep,
    canNavigateToStep,
    handleFormSubmit,
    isSubmitting,
    showSuccessModal,
    setShowSuccessModal,
  };
}

/**
 * Hook return type export
 */
export type MultiStepFormInstance = ReturnType<typeof useMultiStepForm>;
