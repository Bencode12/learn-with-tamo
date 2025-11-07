export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          coins_reward: number | null
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number | null
        }
        Relationships: []
      }
      ai_insight_usage: {
        Row: {
          created_at: string | null
          id: string
          month: string
          updated_at: string | null
          user_id: string
          uses_count: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          updated_at?: string | null
          user_id: string
          uses_count?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          updated_at?: string | null
          user_id?: string
          uses_count?: number
        }
        Relationships: []
      }
      daily_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          score?: number
          time_taken: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          coins_reward: number
          created_at: string | null
          difficulty: string
          id: string
          questions: Json
          subject: string
          xp_reward: number
        }
        Insert: {
          challenge_date: string
          coins_reward?: number
          created_at?: string | null
          difficulty: string
          id?: string
          questions: Json
          subject: string
          xp_reward?: number
        }
        Update: {
          challenge_date?: string
          coins_reward?: number
          created_at?: string | null
          difficulty?: string
          id?: string
          questions?: Json
          subject?: string
          xp_reward?: number
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          ai_insights: string | null
          completed_at: string | null
          created_at: string | null
          exam_month: string
          id: string
          max_score: number
          percentage: number
          subjects: Json
          total_score: number
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          completed_at?: string | null
          created_at?: string | null
          exam_month: string
          id?: string
          max_score: number
          percentage: number
          subjects: Json
          total_score: number
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          completed_at?: string | null
          created_at?: string | null
          exam_month?: string
          id?: string
          max_score?: number
          percentage?: number
          subjects?: Json
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          accuracy: number
          completed_at: string
          game_mode: Database["public"]["Enums"]["game_mode"]
          id: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          accuracy?: number
          completed_at?: string
          game_mode: Database["public"]["Enums"]["game_mode"]
          id?: string
          score?: number
          time_taken: number
          user_id: string
        }
        Update: {
          accuracy?: number
          completed_at?: string
          game_mode?: Database["public"]["Enums"]["game_mode"]
          id?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          lesson_id: string
          quiz_attempts: number | null
          quiz_completed: boolean | null
          quiz_score: number | null
          status: string
          time_spent: number | null
          updated_at: string | null
          user_id: string
          video_completed: boolean | null
          worksheet_completed: boolean | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lesson_id: string
          quiz_attempts?: number | null
          quiz_completed?: boolean | null
          quiz_score?: number | null
          status?: string
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
          video_completed?: boolean | null
          worksheet_completed?: boolean | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string
          quiz_attempts?: number | null
          quiz_completed?: boolean | null
          quiz_score?: number | null
          status?: string
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
          video_completed?: boolean | null
          worksheet_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          is_published: boolean
          language: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty: string
          id?: string
          is_published?: boolean
          language?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          language?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action_taken: string | null
          ai_confidence: number
          created_at: string
          flagged_reason: string
          game_mode: Database["public"]["Enums"]["game_mode"]
          id: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          ai_confidence: number
          created_at?: string
          flagged_reason: string
          game_mode: Database["public"]["Enums"]["game_mode"]
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          ai_confidence?: number
          created_at?: string
          flagged_reason?: string
          game_mode?: Database["public"]["Enums"]["game_mode"]
          id?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coins: number
          created_at: string
          display_name: string | null
          experience: number
          id: string
          is_premium: boolean | null
          last_life_lost_at: string | null
          level: number
          lives: number | null
          lives_refill_at: string | null
          premium_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          experience?: number
          id: string
          is_premium?: boolean | null
          last_life_lost_at?: string | null
          level?: number
          lives?: number | null
          lives_refill_at?: string | null
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          experience?: number
          id?: string
          is_premium?: boolean | null
          last_life_lost_at?: string | null
          level?: number
          lives?: number | null
          lives_refill_at?: string | null
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lives: {
        Row: {
          last_life_lost_at: string | null
          lives: number
          lives_refill_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_life_lost_at?: string | null
          lives?: number
          lives_refill_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_life_lost_at?: string | null
          lives?: number
          lives_refill_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          difficulty_preference: string
          language: string
          notifications_enabled: boolean
          sound_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          difficulty_preference?: string
          language?: string
          notifications_enabled?: boolean
          sound_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          difficulty_preference?: string
          language?: string
          notifications_enabled?: boolean
          sound_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      game_mode: "single" | "ranked" | "team" | "competitive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
      game_mode: ["single", "ranked", "team", "competitive"],
    },
  },
} as const
