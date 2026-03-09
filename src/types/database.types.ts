export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfessionalBackground = 'tech' | 'business' | 'design' | 'other';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
export type HybridFormat = 'in_person' | 'virtual' | 'hybrid' | 'no_preference';

export interface Database {
  public: {
    Tables: {
      anonymous_submissions: {
        Row: {
          id: string;
          // Professional Background
          professional_background: ProfessionalBackground | null;
          professional_role: string | null;
          experience_level: ExperienceLevel | null;
          industry: string | null;
          skills: string[] | null;
          // Availability
          preferred_days: string[] | null;
          preferred_times: PreferredTime[] | null;
          frequency: Frequency | null;
          // Event Formats
          format_presentations: boolean;
          format_workshops: boolean;
          format_discussions: boolean;
          format_networking: boolean;
          format_hackathons: boolean;
          format_mentoring: boolean;
          format_hybrid: HybridFormat | null;
          format_custom: string | null;
          // Topics
          predefined_topics: string[] | null;
          custom_topics: string | null;
          // Metadata
          submission_timestamp: string;
          form_version: string;
          completion_percentage: number;
          anonymous_reference_id: string | null;
          // Duplicate Prevention
          ip_hash: string;
          device_id: string | null;
          submitted_at: string;
          // GDPR
          data_retention_acknowledged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          // Professional Background
          professional_background?: ProfessionalBackground | null;
          professional_role?: string | null;
          experience_level?: ExperienceLevel | null;
          industry?: string | null;
          skills?: string[] | null;
          // Availability
          preferred_days?: string[] | null;
          preferred_times?: PreferredTime[] | null;
          frequency?: Frequency | null;
          // Event Formats
          format_presentations?: boolean;
          format_workshops?: boolean;
          format_discussions?: boolean;
          format_networking?: boolean;
          format_hackathons?: boolean;
          format_mentoring?: boolean;
          format_hybrid?: HybridFormat | null;
          format_custom?: string | null;
          // Topics
          predefined_topics?: string[] | null;
          custom_topics?: string | null;
          // Metadata
          submission_timestamp?: string;
          form_version?: string;
          completion_percentage?: number;
          anonymous_reference_id?: string | null;
          // Duplicate Prevention
          ip_hash: string;
          device_id?: string | null;
          submitted_at?: string;
          // GDPR
          data_retention_acknowledged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          // Professional Background
          professional_background?: ProfessionalBackground | null;
          professional_role?: string | null;
          experience_level?: ExperienceLevel | null;
          industry?: string | null;
          skills?: string[] | null;
          // Availability
          preferred_days?: string[] | null;
          preferred_times?: PreferredTime[] | null;
          frequency?: Frequency | null;
          // Event Formats
          format_presentations?: boolean;
          format_workshops?: boolean;
          format_discussions?: boolean;
          format_networking?: boolean;
          format_hackathons?: boolean;
          format_mentoring?: boolean;
          format_hybrid?: HybridFormat | null;
          format_custom?: string | null;
          // Topics
          predefined_topics?: string[] | null;
          custom_topics?: string | null;
          // Metadata
          submission_timestamp?: string;
          form_version?: string;
          completion_percentage?: number;
          anonymous_reference_id?: string | null;
          // Duplicate Prevention
          ip_hash?: string;
          device_id?: string | null;
          submitted_at?: string;
          // GDPR
          data_retention_acknowledged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      speaker_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          talk_title: string;
          format: string;
          ai_tools_experience: string;
          title_company: string | null;
          anything_else: string | null;
          status: string;
          assigned_meetup: string | null;
          preferred_meetup: string | null;
          access_token: string;
          token_revoked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          talk_title: string;
          format: string;
          ai_tools_experience: string;
          title_company?: string | null;
          anything_else?: string | null;
          status?: string;
          assigned_meetup?: string | null;
          preferred_meetup?: string | null;
          access_token?: string;
          token_revoked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          talk_title?: string;
          format?: string;
          ai_tools_experience?: string;
          title_company?: string | null;
          anything_else?: string | null;
          assigned_meetup?: string | null;
          preferred_meetup?: string | null;
          status?: string;
          access_token?: string;
          token_revoked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      speaker_messages: {
        Row: {
          id: string;
          submission_id: string;
          sender_type: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          sender_type: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          sender_type?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [{
          foreignKeyName: "speaker_messages_submission_id_fkey";
          columns: ["submission_id"];
          referencedRelation: "speaker_submissions";
          referencedColumns: ["id"];
        }];
      };
      speaker_status_history: {
        Row: {
          id: string;
          submission_id: string;
          old_status: string | null;
          new_status: string;
          changed_by: string;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          old_status?: string | null;
          new_status: string;
          changed_by: string;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          old_status?: string | null;
          new_status?: string;
          changed_by?: string;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [{
          foreignKeyName: "speaker_status_history_submission_id_fkey";
          columns: ["submission_id"];
          referencedRelation: "speaker_submissions";
          referencedColumns: ["id"];
        }];
      };
      meetups: {
        Row: {
          id: string;
          title: string;
          date: string;
          location: string;
          luma_url: string | null;
          homepage_visible: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          location: string;
          luma_url?: string | null;
          homepage_visible?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          location?: string;
          luma_url?: string | null;
          homepage_visible?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [{
          foreignKeyName: "organizers_id_fkey";
          columns: ["id"];
          referencedRelation: "users";
          referencedColumns: ["id"];
        }];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_old_ip_hashes: {
        Args: { retention_days?: number };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
