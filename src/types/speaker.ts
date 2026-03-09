export type SpeakerFormat = "speech" | "demo" | "workshop";
export type SpeakerStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type MessageSenderType = "admin" | "speaker";

export interface SpeakerSubmissionRow {
  id: string;
  name: string;
  email: string;
  talk_title: string;
  format: SpeakerFormat;
  ai_tools_experience: string;
  title_company: string | null;
  anything_else: string | null;
  status: SpeakerStatus;
  assigned_meetup: string | null;
  preferred_meetup: string | null;
  access_token: string;
  token_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeakerSubmissionInsert {
  name: string;
  email: string;
  talk_title: string;
  format: SpeakerFormat;
  ai_tools_experience: string;
  title_company?: string | null;
  anything_else?: string | null;
  preferred_meetup?: string | null;
}

export interface SpeakerMessageRow {
  id: string;
  submission_id: string;
  sender_type: MessageSenderType;
  content: string;
  created_at: string;
}

export interface SpeakerStatusHistoryRow {
  id: string;
  submission_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  message: string | null;
  created_at: string;
}

export interface SpeakerSubmissionWithMessages extends SpeakerSubmissionRow {
  messages: SpeakerMessageRow[];
}

export interface SpeakerSubmissionListItem extends SpeakerSubmissionRow {
  message_count: number;
}
