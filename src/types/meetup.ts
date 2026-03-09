export type MeetupStatus = "draft" | "published" | "past";

export interface MeetupRow {
  id: string;
  title: string;
  date: string;
  location: string;
  luma_url: string | null;
  homepage_visible: boolean;
  status: MeetupStatus;
  created_at: string;
  updated_at: string;
}
