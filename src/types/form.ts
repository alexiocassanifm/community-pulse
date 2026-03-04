export interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type StepStatus = "completed" | "active" | "visited" | "available" | "locked";

export interface StepState {
  sectionId: string;
  status: StepStatus;
  completionPercentage: number;
}

export const FORM_SECTIONS: FormSection[] = [
  {
    id: "professional_background",
    title: "Professional Background",
    description: "Tell us about your role and experience",
    icon: "briefcase",
  },
  {
    id: "availability",
    title: "Availability",
    description: "When works best for you",
    icon: "calendar",
  },
  {
    id: "event_formats",
    title: "Event Formats",
    description: "How do you like to learn",
    icon: "layout",
  },
  {
    id: "topics",
    title: "Topics of Interest",
    description: "What are you curious about",
    icon: "lightbulb",
  },
  {
    id: "gdpr",
    title: "Privacy Consent",
    description: "Data usage agreement",
    icon: "shield",
  },
];
