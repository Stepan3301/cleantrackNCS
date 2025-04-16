export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bonus_thresholds: {
        Row: {
          created_at: string | null
          id: string
          monthly_bonus_amount: number | null
          monthly_hours: number | null
          role: Database["public"]["Enums"]["employee_role"]
          updated_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_bonus_amount?: number | null
          monthly_hours?: number | null
          role: Database["public"]["Enums"]["employee_role"]
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_bonus_amount?: number | null
          monthly_hours?: number | null
          role?: Database["public"]["Enums"]["employee_role"]
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Relationships: []
      }
      daily_hours: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          employee_id: string | null
          hours: number
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          employee_id?: string | null
          hours: number
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          employee_id?: string | null
          hours?: number
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_hours_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_summaries: {
        Row: {
          bonus_amount: number | null
          bonus_eligible: boolean | null
          created_at: string | null
          employee_id: string | null
          id: string
          month: string
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          bonus_amount?: number | null
          bonus_eligible?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month: string
          total_hours?: number
          updated_at?: string | null
        }
        Update: {
          bonus_amount?: number | null
          bonus_eligible?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          month?: string
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_summaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["employee_role"]
          updated_at: string | null
        }
        Insert: {
          first_name: string
          id: string
          is_active?: boolean | null
          joined_at?: string | null
          last_name: string
          phone?: string | null
          role: Database["public"]["Enums"]["employee_role"]
          updated_at?: string | null
        }
        Update: {
          first_name?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["employee_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          requested_role: Database["public"]["Enums"]["employee_role"]
          status: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          requested_role: Database["public"]["Enums"]["employee_role"]
          status?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          requested_role?: Database["public"]["Enums"]["employee_role"]
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          cleaner_id: string | null
          created_at: string | null
          id: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          cleaner_id?: string | null
          created_at?: string | null
          id?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cleaner_id?: string | null
          created_at?: string | null
          id?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          manager_id: string | null
          name: string
          role: Database["public"]["Enums"]["app_role"]
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          manager_id?: string | null
          name: string
          role?: Database["public"]["Enums"]["app_role"]
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          manager_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_profiles_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_summaries: {
        Row: {
          bonus_eligible: boolean | null
          created_at: string | null
          employee_id: string | null
          id: string
          total_hours: number
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          bonus_eligible?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          total_hours?: number
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          bonus_eligible?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          total_hours?: number
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
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
      approve_user_registration: {
        Args: {
          request_id: string
          approver_id: string
          approval_notes?: string
        }
        Returns: boolean
      }
      calculate_monthly_summary: {
        Args: { p_employee_id: string; p_month_date: string }
        Returns: boolean
      }
      calculate_weekly_summary: {
        Args: { p_employee_id: string; p_week_start: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["employee_role"]
      }
      reject_user_registration: {
        Args: {
          request_id: string
          rejector_id: string
          rejection_notes?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "head_manager" | "manager" | "supervisor" | "staff"
      employee_role:
        | "owner"
        | "head_manager"
        | "manager"
        | "supervisor"
        | "cleaner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "head_manager", "manager", "supervisor", "staff"],
      employee_role: [
        "owner",
        "head_manager",
        "manager",
        "supervisor",
        "cleaner",
      ],
    },
  },
} as const
