import type { SpeakerFormat, SpeakerStatus } from "@/types/speaker";

export const SPEAKER_FORMATS: { value: SpeakerFormat; label: string }[] = [
  { value: "speech", label: "Speech" },
  { value: "demo", label: "Demo" },
  { value: "workshop", label: "Workshop" },
];

export const SPEAKER_STATUS_CONFIG: Record<
  SpeakerStatus,
  { label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", variant: "secondary" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800", variant: "default" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", variant: "destructive" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-800", variant: "outline" },
};
