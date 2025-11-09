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
      card_offers: {
        Row: {
          card_id: string | null
          card_type: string | null
          category: string
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          merchant_name: string | null
          offer_type: string
          reward_rate: number
        }
        Insert: {
          card_id?: string | null
          card_type?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          merchant_name?: string | null
          offer_type: string
          reward_rate: number
        }
        Update: {
          card_id?: string | null
          card_type?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          merchant_name?: string | null
          offer_type?: string
          reward_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_offers_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          annual_fee: number | null
          apr: number | null
          balance: number | null
          card_image_url: string | null
          card_name: string
          card_type: string
          cashback: number | null
          created_at: string | null
          credit_limit: number | null
          due_date: string | null
          gradient: string | null
          id: string
          is_primary: boolean | null
          last_four: string
          pending_dues: number | null
          rewards_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_fee?: number | null
          apr?: number | null
          balance?: number | null
          card_image_url?: string | null
          card_name: string
          card_type: string
          cashback?: number | null
          created_at?: string | null
          credit_limit?: number | null
          due_date?: string | null
          gradient?: string | null
          id?: string
          is_primary?: boolean | null
          last_four: string
          pending_dues?: number | null
          rewards_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_fee?: number | null
          apr?: number | null
          balance?: number | null
          card_image_url?: string | null
          card_name?: string
          card_type?: string
          cashback?: number | null
          created_at?: string | null
          credit_limit?: number | null
          due_date?: string | null
          gradient?: string | null
          id?: string
          is_primary?: boolean | null
          last_four?: string
          pending_dues?: number | null
          rewards_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          amount: number
          card_id: string
          created_at: string | null
          id: string
          is_sent: boolean | null
          reminder_date: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_date: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          card_id: string
          category: string
          created_at: string | null
          id: string
          merchant_name: string
          rewards_earned: number | null
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          category: string
          created_at?: string | null
          id?: string
          merchant_name: string
          rewards_earned?: number | null
          transaction_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          category?: string
          created_at?: string | null
          id?: string
          merchant_name?: string
          rewards_earned?: number | null
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_status: {
        Row: {
          created_at: string | null
          id: string
          id_verified: boolean | null
          profile_completed: boolean | null
          ssn_verified: boolean | null
          updated_at: string | null
          user_id: string
          verification_level: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_verified?: boolean | null
          profile_completed?: boolean | null
          ssn_verified?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_level?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_verified?: boolean | null
          profile_completed?: boolean | null
          ssn_verified?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_verification_status: {
        Args: {
          p_id_verified?: boolean
          p_ssn_verified?: boolean
          p_user_id: string
          p_verification_level?: string
        }
        Returns: undefined
      }
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
