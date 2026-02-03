"use client";

import { useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { AnonymousFormData } from "@/lib/validations/form-schema";
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from "@/lib/form-persistence";

export function useFormPersistence(form: UseFormReturn<AnonymousFormData>) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadedRef = useRef(false);

  // Load saved draft on mount
  useEffect(() => {
    if (isLoadedRef.current) return;
    const draft = loadFormDraft();
    if (draft) {
      form.reset({ ...form.getValues(), ...draft });
    }
    isLoadedRef.current = true;
  }, [form]);

  // Auto-save on form changes (debounced 1s)
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!isLoadedRef.current) return;
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

  const clearDraft = useCallback(() => {
    clearFormDraft();
  }, []);

  return { clearDraft };
}
