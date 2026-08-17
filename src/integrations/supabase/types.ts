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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      grievance_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          grievance_uuid: string
          id: string
          mime_type: string | null
          size_bytes: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          grievance_uuid: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          grievance_uuid?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grievance_attachments_grievance_uuid_fkey"
            columns: ["grievance_uuid"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_history: {
        Row: {
          changed_by_name: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["grievance_status"] | null
          grievance_uuid: string
          id: string
          note: string | null
          to_status: Database["public"]["Enums"]["grievance_status"]
        }
        Insert: {
          changed_by_name?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["grievance_status"] | null
          grievance_uuid: string
          id?: string
          note?: string | null
          to_status: Database["public"]["Enums"]["grievance_status"]
        }
        Update: {
          changed_by_name?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["grievance_status"] | null
          grievance_uuid?: string
          id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["grievance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "grievance_history_grievance_uuid_fkey"
            columns: ["grievance_uuid"]
            isOneToOne: false
            referencedRelation: "grievances"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          category: string
          centre_name: string
          created_at: string
          description: string
          district: string
          grievance_id: string
          id: string
          internal_notes: string | null
          mobile_number: string
          operator_id: string
          operator_name: string
          priority: Database["public"]["Enums"]["grievance_priority"]
          resolution: string | null
          status: Database["public"]["Enums"]["grievance_status"]
          subject: string
          trainer_id: string
          trainer_name: string
          training_date: string
          training_location: string
          updated_at: string
        }
        Insert: {
          category: string
          centre_name: string
          created_at?: string
          description: string
          district: string
          grievance_id: string
          id?: string
          internal_notes?: string | null
          mobile_number: string
          operator_id: string
          operator_name: string
          priority?: Database["public"]["Enums"]["grievance_priority"]
          resolution?: string | null
          status?: Database["public"]["Enums"]["grievance_status"]
          subject: string
          trainer_id: string
          trainer_name: string
          training_date: string
          training_location: string
          updated_at?: string
        }
        Update: {
          category?: string
          centre_name?: string
          created_at?: string
          description?: string
          district?: string
          grievance_id?: string
          id?: string
          internal_notes?: string | null
          mobile_number?: string
          operator_id?: string
          operator_name?: string
          priority?: Database["public"]["Enums"]["grievance_priority"]
          resolution?: string | null
          status?: Database["public"]["Enums"]["grievance_status"]
          subject?: string
          trainer_id?: string
          trainer_name?: string
          training_date?: string
          training_location?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievances_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      training_locations: {
        Row: {
          address: string | null
          created_at: string
          district: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          district: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          district?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_trainer_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_grievance_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "trainer"
      grievance_priority: "Low" | "Medium" | "High" | "Critical"
      grievance_status:
        | "Submitted"
        | "Under Review"
        | "In Progress"
        | "Resolved"
        | "Closed"
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
      app_role: ["admin", "trainer"],
      grievance_priority: ["Low", "Medium", "High", "Critical"],
      grievance_status: [
        "Submitted",
        "Under Review",
        "In Progress",
        "Resolved",
        "Closed",
      ],
    },
  },
} as const
