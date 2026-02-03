export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          // GDPR
          data_retention_acknowledged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          // Professional Background
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
          // GDPR
          data_retention_acknowledged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          // Professional Background
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
          // GDPR
          data_retention_acknowledged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
