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
      anti_cheat_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          game_mode: string
          id: string
          severity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          game_mode: string
          id?: string
          severity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          game_mode?: string
          id?: string
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      class_students: {
        Row: {
          class_id: string
          id: string
          joined_at: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_code: string
          created_at: string | null
          description: string | null
          grade_level: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          class_code?: string
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          class_code?: string
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          teacher_id?: string
          updated_at?: string | null
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
      exam_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          exam_id: string
          id: string
          score: number
          subject_breakdown: Json | null
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          exam_id: string
          id?: string
          score: number
          subject_breakdown?: Json | null
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          exam_id?: string
          id?: string
          score?: number
          subject_breakdown?: Json | null
          time_taken_seconds?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
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
      exams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          is_published: boolean | null
          questions: Json
          subject: string
          time_limit_minutes: number
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: string
          id?: string
          is_published?: boolean | null
          questions: Json
          subject: string
          time_limit_minutes?: number
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean | null
          questions?: Json
          subject?: string
          time_limit_minutes?: number
          title?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          created_by: string | null
          friend_id: string
          id: string
          status: Database["public"]["Enums"]["friendship_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          friend_id: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          friend_id?: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_interview_sessions: {
        Row: {
          ai_analysis: Json | null
          company_name: string | null
          created_at: string | null
          experience_level: string
          id: string
          job_title: string
          questions_asked: Json | null
          skills: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          company_name?: string | null
          created_at?: string | null
          experience_level: string
          id?: string
          job_title: string
          questions_asked?: Json | null
          skills?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          company_name?: string | null
          created_at?: string | null
          experience_level?: string
          id?: string
          job_title?: string
          questions_asked?: Json | null
          skills?: Json | null
          status?: string | null
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
      learning_plans: {
        Row: {
          assessment_answers: Json | null
          assessment_score: number | null
          completed_at: string | null
          created_at: string
          current_week: number
          duration_months: number
          fields: string[]
          id: string
          name: string
          started_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
          weekly_plan: Json | null
        }
        Insert: {
          assessment_answers?: Json | null
          assessment_score?: number | null
          completed_at?: string | null
          created_at?: string
          current_week?: number
          duration_months?: number
          fields?: string[]
          id?: string
          name: string
          started_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
          weekly_plan?: Json | null
        }
        Update: {
          assessment_answers?: Json | null
          assessment_score?: number | null
          completed_at?: string | null
          created_at?: string
          current_week?: number
          duration_months?: number
          fields?: string[]
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
          weekly_plan?: Json | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          chapter_id: string
          completed: boolean
          created_at: string
          id: string
          last_accessed: string
          lesson_id: string
          score: number | null
          subject_id: string
          time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          lesson_id: string
          score?: number | null
          subject_id: string
          time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string
          lesson_id?: string
          score?: number | null
          subject_id?: string
          time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      match_participants: {
        Row: {
          id: string
          is_ready: boolean | null
          joined_at: string | null
          left_at: string | null
          match_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_ready?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          match_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_ready?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          match_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "multiplayer_matches"
            referencedColumns: ["id"]
          },
        ]
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
      multiplayer_matches: {
        Row: {
          chapter: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_players: number | null
          id: string
          lesson: string | null
          max_players: number
          mode: string
          room_code: string
          room_name: string | null
          started_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          chapter?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          id?: string
          lesson?: string | null
          max_players: number
          mode: string
          room_code: string
          room_name?: string | null
          started_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          chapter?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          id?: string
          lesson?: string | null
          max_players?: number
          mode?: string
          room_code?: string
          room_name?: string | null
          started_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_learning_time: number
          display_name: string | null
          experience: number
          id: string
          is_premium: boolean | null
          last_life_lost_at: string | null
          learning_time_reset: string
          level: number
          lives: number | null
          lives_refill_at: string | null
          name_color: string | null
          premium_expires_at: string | null
          staff_badge: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          total_learning_time: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_learning_time?: number
          display_name?: string | null
          experience?: number
          id: string
          is_premium?: boolean | null
          last_life_lost_at?: string | null
          learning_time_reset?: string
          level?: number
          lives?: number | null
          lives_refill_at?: string | null
          name_color?: string | null
          premium_expires_at?: string | null
          staff_badge?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          total_learning_time?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_learning_time?: number
          display_name?: string | null
          experience?: number
          id?: string
          is_premium?: boolean | null
          last_life_lost_at?: string | null
          learning_time_reset?: string
          level?: number
          lives?: number | null
          lives_refill_at?: string | null
          name_color?: string | null
          premium_expires_at?: string | null
          staff_badge?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          total_learning_time?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      random_event_completions: {
        Row: {
          completed_at: string | null
          event_id: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          event_id: string
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          event_id?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "random_event_completions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "random_events"
            referencedColumns: ["id"]
          },
        ]
      }
      random_events: {
        Row: {
          active_from: string | null
          active_until: string | null
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          questions: Json
          time_limit_seconds: number | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          questions: Json
          time_limit_seconds?: number | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          questions?: Json
          time_limit_seconds?: number | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      school_pilots: {
        Row: {
          contact_email: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          notes: string | null
          school_name: string
          start_date: string | null
          status: string
          students_count: number | null
          teachers_count: number | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          school_name: string
          start_date?: string | null
          status?: string
          students_count?: number | null
          teachers_count?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          school_name?: string
          start_date?: string | null
          status?: string
          students_count?: number | null
          teachers_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      self_learning_workspaces: {
        Row: {
          browser_url: string | null
          created_at: string | null
          id: string
          last_accessed: string | null
          latex_content: string | null
          subject_id: string
          subject_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          browser_url?: string | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          latex_content?: string | null
          subject_id: string
          subject_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          browser_url?: string | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          latex_content?: string | null
          subject_id?: string
          subject_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      staff_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      synced_grades: {
        Row: {
          created_at: string | null
          date: string | null
          grade: number | null
          grade_type: string | null
          id: string
          notes: string | null
          raw_data: Json | null
          semester: string | null
          source: string
          subject: string
          synced_at: string | null
          teacher_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          grade?: number | null
          grade_type?: string | null
          id?: string
          notes?: string | null
          raw_data?: Json | null
          semester?: string | null
          source: string
          subject: string
          synced_at?: string | null
          teacher_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          grade?: number | null
          grade_type?: string | null
          id?: string
          notes?: string | null
          raw_data?: Json | null
          semester?: string | null
          source?: string
          subject?: string
          synced_at?: string | null
          teacher_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      therapist_checkins: {
        Row: {
          ai_response: string | null
          created_at: string | null
          id: string
          mood_rating: number | null
          notes: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          stress_level?: number | null
          user_id?: string
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
      user_credentials: {
        Row: {
          created_at: string | null
          encrypted_data: string
          id: string
          service_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_data: string
          id?: string
          service_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_data?: string
          id?: string
          service_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_lives: {
        Row: {
          last_life_lost_at: string | null
          lives: number
          lives_refill_at: string | null
          max_lives: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_life_lost_at?: string | null
          lives?: number
          lives_refill_at?: string | null
          max_lives?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_life_lost_at?: string | null
          lives?: number
          lives_refill_at?: string | null
          max_lives?: number | null
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
      user_streaks: {
        Row: {
          current_streak: number
          last_activity_date: string | null
          longest_streak: number
          streak_updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          streak_updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          streak_updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_learning_time: number | null
          display_name: string | null
          experience: number | null
          id: string | null
          is_premium: boolean | null
          level: number | null
          lives: number | null
          staff_badge: string | null
          total_learning_time: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_learning_time?: number | null
          display_name?: string | null
          experience?: number | null
          id?: string | null
          is_premium?: boolean | null
          level?: number | null
          lives?: number | null
          staff_badge?: string | null
          total_learning_time?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_learning_time?: number | null
          display_name?: string | null
          experience?: number | null
          id?: string | null
          is_premium?: boolean | null
          level?: number | null
          lives?: number | null
          staff_badge?: string | null
          total_learning_time?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refill_user_lives: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "staff" | "user" | "teacher"
      friendship_status: "pending" | "accepted" | "rejected"
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
      app_role: ["admin", "staff", "user", "teacher"],
      friendship_status: ["pending", "accepted", "rejected"],
      game_mode: ["single", "ranked", "team", "competitive"],
    },
  },
} as const
