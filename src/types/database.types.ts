export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      anonymous_submissions: {
        Row: {
          id: string;
          created_at: string;
          name: string | null;
          email: string | null;
          city: string | null;
          topics: string[] | null;
          availability: string | null;
          experience_level: string | null;
          group_size_preference: string | null;
          additional_info: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name?: string | null;
          email?: string | null;
          city?: string | null;
          topics?: string[] | null;
          availability?: string | null;
          experience_level?: string | null;
          group_size_preference?: string | null;
          additional_info?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string | null;
          email?: string | null;
          city?: string | null;
          topics?: string[] | null;
          availability?: string | null;
          experience_level?: string | null;
          group_size_preference?: string | null;
          additional_info?: string | null;
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
