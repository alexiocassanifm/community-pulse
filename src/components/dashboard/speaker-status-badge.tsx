import { Badge } from "@/components/ui/badge";
import { SPEAKER_STATUS_CONFIG } from "@/constants/speakers";
import type { SpeakerStatus } from "@/types/speaker";

export function SpeakerStatusBadge({ status }: { status: SpeakerStatus }) {
  const config = SPEAKER_STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
