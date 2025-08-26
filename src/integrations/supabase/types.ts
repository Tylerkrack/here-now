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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          is_active: boolean | null
          matched_at: string | null
          user1_id: string
          user2_id: string
          zone_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          matched_at?: string | null
          user1_id: string
          user2_id: string
          zone_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          matched_at?: string | null
          user1_id?: string
          user2_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          match_id: string
          message_type: string | null
          read_at: string | null
          sender_id: string
          sent_at: string | null
        }
        Insert: {
          content: string
          id?: string
          match_id: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
          sent_at?: string | null
        }
        Update: {
          content?: string
          id?: string
          match_id?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          intent: string | null
          interests: string[] | null
          is_active: boolean | null
          photos: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age: number
          bio?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          intent?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          photos?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          intent?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          photos?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          direction: string
          id: string
          swiped_at: string | null
          swiped_id: string
          swiper_id: string
          zone_id: string | null
        }
        Insert: {
          direction: string
          id?: string
          swiped_at?: string | null
          swiped_id: string
          swiper_id: string
          zone_id?: string | null
        }
        Update: {
          direction?: string
          id?: string
          swiped_at?: string | null
          swiped_id?: string
          swiper_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swipes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          entered_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          left_at: string | null
          longitude: number
          user_id: string
          zone_id: string | null
        }
        Insert: {
          entered_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          left_at?: string | null
          longitude: number
          user_id: string
          zone_id?: string | null
        }
        Update: {
          entered_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          left_at?: string | null
          longitude?: number
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters: number | null
          zone_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters?: number | null
          zone_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number | null
          zone_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
