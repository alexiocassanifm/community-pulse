import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  anonymousFormSchema,
  AnonymousFormData,
} from "@/lib/validations/form-schema";

/**
 * Default values for the anonymous form
 * All fields are optional to allow progressive submission
 */
export const DEFAULT_FORM_VALUES: AnonymousFormData = {
  professional_background: {
    professional_background: undefined as unknown as "tech" | "business" | "design" | "other",
    professional_role: undefined as unknown as string,
    professional_role_other: "",
    experience_level: undefined as unknown as "junior" | "mid" | "senior" | "lead" | "executive",
    industry: undefined as unknown as string,
    industry_other: "",
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
};

/**
 * Custom hook for managing the anonymous form state
 * Uses react-hook-form with Zod validation
 *
 * @param initialData - Optional initial data to populate the form
 * @returns Form instance with validation and helper functions
 */
export function useAnonymousForm(
  initialData?: Partial<AnonymousFormData>
): UseFormReturn<AnonymousFormData> {
  const form = useForm<AnonymousFormData>({
    resolver: zodResolver(anonymousFormSchema),
    defaultValues: initialData ? { ...DEFAULT_FORM_VALUES, ...initialData } : DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });

  return form;
}

/**
 * Hook type export for convenience
 */
export type AnonymousFormInstance = ReturnType<typeof useAnonymousForm>;
