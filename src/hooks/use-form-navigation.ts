"use client";

import { useState, useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import { FORM_SECTIONS, StepState, StepStatus } from "@/types/form";

const NAV_STORAGE_KEY = "anonymous-form-navigation";

interface NavigationState {
  currentStep: number;
  visitedSteps: number[];
}

function loadNavigationState(): NavigationState {
  if (typeof window === "undefined") return { currentStep: 0, visitedSteps: [0] };
  try {
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { currentStep: 0, visitedSteps: [0] };
}

function saveNavigationState(state: NavigationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function clearNavigationState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NAV_STORAGE_KEY);
  } catch {}
}

function getSectionCompletion(
  sectionId: string,
  data: AnonymousFormData
): number {
  const section = data[sectionId as keyof AnonymousFormData];
  if (!section || typeof section !== "object") return 0;

  const values = Object.values(section);
  if (values.length === 0) return 0;

  const filled = values.filter((v) => {
    if (v === undefined || v === null || v === "") return false;
    if (typeof v === "boolean") return v;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }).length;

  return Math.round((filled / values.length) * 100);
}

export function useFormNavigation(form: UseFormReturn<AnonymousFormData>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = loadNavigationState();
    setCurrentStep(saved.currentStep);
    setVisitedSteps(saved.visitedSteps);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    saveNavigationState({ currentStep, visitedSteps });
  }, [currentStep, visitedSteps, isInitialized]);

  const totalSteps = FORM_SECTIONS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const getStepStatus = useCallback(
    (index: number): StepStatus => {
      const formValues = form.getValues();
      const sectionId = FORM_SECTIONS[index].id;
      const completion = getSectionCompletion(sectionId, formValues);

      if (index === currentStep) return "active";
      if (completion > 0 && visitedSteps.includes(index)) return "completed";
      if (visitedSteps.includes(index)) return "visited";
      if (index <= Math.max(...visitedSteps) + 1) return "available";
      return "locked";
    },
    [currentStep, visitedSteps, form]
  );

  const getStepStates = useCallback((): StepState[] => {
    const formValues = form.getValues();
    return FORM_SECTIONS.map((section, index) => ({
      sectionId: section.id,
      status: getStepStatus(index),
      completionPercentage: getSectionCompletion(section.id, formValues),
    }));
  }, [getStepStatus, form]);

  const getOverallProgress = useCallback((): number => {
    const formValues = form.getValues();
    const completions = FORM_SECTIONS.map((s) =>
      getSectionCompletion(s.id, formValues)
    );
    return Math.round(
      completions.reduce((sum, c) => sum + c, 0) / completions.length
    );
  }, [form]);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= totalSteps) return;
      const status = getStepStatus(step);
      if (status === "locked") return;
      setCurrentStep(step);
      setVisitedSteps((prev) =>
        prev.includes(step) ? prev : [...prev, step]
      );
    },
    [totalSteps, getStepStatus]
  );

  const goNext = useCallback(() => {
    if (isLastStep) return;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setVisitedSteps((prev) =>
      prev.includes(nextStep) ? prev : [...prev, nextStep]
    );
  }, [currentStep, isLastStep]);

  const goPrevious = useCallback(() => {
    if (isFirstStep) return;
    setCurrentStep(currentStep - 1);
  }, [currentStep, isFirstStep]);

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isInitialized,
    goToStep,
    goNext,
    goPrevious,
    getStepStatus,
    getStepStates,
    getOverallProgress,
    currentSection: FORM_SECTIONS[currentStep],
  };
}
