"use client";

import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAnonymousForm } from "./use-anonymous-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from "@/lib/form-persistence";
import { StepState, FORM_SECTIONS } from "@/types/form";
import { useToast } from "@/hooks/use-toast";

/**
 * Storage key for step states
 */
const STEPS_STORAGE_KEY = "anonymous-form-steps";

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Initialize step states
 */
function initializeStepStates(): StepState[] {
  return FORM_SECTIONS.map((section, index) => ({
    sectionId: section.id,
    status: index === 0 ? "active" : "available",
    completionPercentage: 0,
  }));
}

/**
 * Load step states from localStorage
 */
function loadStepStates(): StepState[] | null {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STEPS_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load step states:", error);
    return null;
  }
}

/**
 * Save step states to localStorage
 */
function saveStepStates(states: StepState[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(states));
  } catch (error) {
    console.error("Failed to save step states:", error);
  }
}

/**
 * Check if a section has any filled fields
 */
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

/**
 * Enhanced multi-step form hook with auto-save and navigation
 */
export function useMultiStepForm() {
  const { toast } = useToast();

  // Load saved draft data
  const savedData = loadFormDraft();
  const form = useAnonymousForm(savedData || undefined);

  // Initialize step state
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStates, setStepStates] = useState<StepState[]>(() => {
    const saved = loadStepStates();
    if (saved && saved.length === FORM_SECTIONS.length) {
      // Find the first non-completed step or the last step
      const activeIndex = saved.findIndex((s) => s.status !== "completed");
      const startIndex = activeIndex >= 0 ? activeIndex : saved.length - 1;
      setCurrentStep(startIndex);
      return saved;
    }
    return initializeStepStates();
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch form values for auto-save
  const formValues = form.watch();

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce((data: Partial<AnonymousFormData>) => {
      const success = saveFormDraft(data);
      if (!success) {
        console.error("Failed to auto-save form data");
      }
    }, 1000),
    []
  );

  // Auto-save on form changes
  useEffect(() => {
    debouncedSave(formValues);
  }, [formValues, debouncedSave]);

  // Save step states whenever they change
  useEffect(() => {
    saveStepStates(stepStates);
  }, [stepStates]);

  /**
   * Calculate overall progress percentage
   */
  const calculateProgress = useCallback((): number => {
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
    const isFilled = isSectionFilled(formValues, currentSectionId);

    // Mark current step as completed or visited
    updateStepState(currentStep, {
      status: isFilled ? "completed" : "visited",
    });

    // Move to next step
    const nextStep = currentStep + 1;
    setStepStates((prev) =>
      prev.map((state, i) => {
        if (i === nextStep) {
          return { ...state, status: "active" };
        } else if (i === currentStep) {
          return { ...state, status: isFilled ? "completed" : "visited" };
        }
        return state;
      })
    );

    setCurrentStep(nextStep);
  }, [currentStep, formValues, updateStepState]);

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
      // Submit to API
      const response = await fetch("/api/submit-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
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

      // Show success toast
      toast({
        title: "Preferences submitted successfully",
        description: "Thank you for sharing your preferences with us!",
      });

      // Reset form
      form.reset();
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
  }, [formValues, form, toast]);

  return {
    form,
    currentStep,
    stepStates,
    progress: calculateProgress(),
    goToNext,
    goToPrevious,
    goToStep,
    canNavigateToStep,
    handleFormSubmit,
    isSubmitting,
    formValues,
  };
}

/**
 * Hook return type export
 */
export type MultiStepFormInstance = ReturnType<typeof useMultiStepForm>;
