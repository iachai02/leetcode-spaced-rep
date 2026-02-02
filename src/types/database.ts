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
      problems: {
        Row: {
          id: string;
          leetcode_id: number | null;
          title: string;
          difficulty: "Easy" | "Medium" | "Hard" | null;
          url: string | null;
          acceptance_rate: number | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          leetcode_id?: number | null;
          title: string;
          difficulty?: "Easy" | "Medium" | "Hard" | null;
          url?: string | null;
          acceptance_rate?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          leetcode_id?: number | null;
          title?: string;
          difficulty?: "Easy" | "Medium" | "Hard" | null;
          url?: string | null;
          acceptance_rate?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      problem_sets: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_preset: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_preset?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_preset?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
      };
      problem_set_items: {
        Row: {
          id: string;
          problem_set_id: string;
          problem_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          problem_set_id: string;
          problem_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          problem_set_id?: string;
          problem_id?: string;
          sort_order?: number;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          daily_goal: number;
          has_seen_onboarding: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          daily_goal?: number;
          has_seen_onboarding?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          daily_goal?: number;
          has_seen_onboarding?: boolean;
          created_at?: string;
        };
      };
      review_history: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          rating: "again" | "hard" | "medium" | "easy" | null;
          time_spent: number | null;
          notes: string | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          rating?: "again" | "hard" | "medium" | "easy" | null;
          time_spent?: number | null;
          notes?: string | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_id?: string;
          rating?: "again" | "hard" | "medium" | "easy" | null;
          time_spent?: number | null;
          notes?: string | null;
          reviewed_at?: string;
        };
      };
      user_problem_sets: {
        Row: {
          id: string;
          user_id: string;
          problem_set_id: string;
          is_active: boolean;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_set_id: string;
          is_active?: boolean;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_set_id?: string;
          is_active?: boolean;
          added_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          ease_factor: number;
          interval: number;
          repetitions: number;
          next_review: string | null;
          last_reviewed: string | null;
          status: "new" | "learning" | "review" | "mastered";
        };
        Insert: {
          id?: string;
          user_id: string;
          problem_id: string;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review?: string | null;
          last_reviewed?: string | null;
          status?: "new" | "learning" | "review" | "mastered";
        };
        Update: {
          id?: string;
          user_id?: string;
          problem_id?: string;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review?: string | null;
          last_reviewed?: string | null;
          status?: "new" | "learning" | "review" | "mastered";
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_review_date: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_review_date?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_review_date?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
