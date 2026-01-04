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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      complaint_images: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          image_url: string
          uploaded_by: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          image_url: string
          uploaded_by: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          image_url?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_images_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          authority_notes: string | null
          created_at: string
          description: string
          id: string
          is_resolved: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          resolution_rating: number | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at: string
          user_id: string
          ward_id: string
          work_started_within_week: boolean | null
        }
        Insert: {
          authority_notes?: string | null
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          resolution_rating?: number | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title: string
          updated_at?: string
          user_id: string
          ward_id: string
          work_started_within_week?: boolean | null
        }
        Update: {
          authority_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          resolution_rating?: number | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string
          updated_at?: string
          user_id?: string
          ward_id?: string
          work_started_within_week?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          contact_type: string
          created_at: string
          id: string
          name: string
          phone: string
          ward_id: string
        }
        Insert: {
          address?: string | null
          contact_type: string
          created_at?: string
          id?: string
          name: string
          phone: string
          ward_id: string
        }
        Update: {
          address?: string | null
          contact_type?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          complaint_id: string
          content: string
          created_at: string
          helpfulness_score: number | null
          id: string
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          content: string
          created_at?: string
          helpfulness_score?: number | null
          id?: string
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          content?: string
          created_at?: string
          helpfulness_score?: number | null
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          avg_rainfall_mm: number | null
          basin: string
          created_at: string
          drain_capacity_mm: number | null
          id: string
          last_maintenance_date: string | null
          name: string
          pincode: string
          rating: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          silt_management_status: string | null
          updated_at: string
        }
        Insert: {
          avg_rainfall_mm?: number | null
          basin: string
          created_at?: string
          drain_capacity_mm?: number | null
          id?: string
          last_maintenance_date?: string | null
          name: string
          pincode: string
          rating?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          silt_management_status?: string | null
          updated_at?: string
        }
        Update: {
          avg_rainfall_mm?: number | null
          basin?: string
          created_at?: string
          drain_capacity_mm?: number | null
          id?: string
          last_maintenance_date?: string | null
          name?: string
          pincode?: string
          rating?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          silt_management_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      water_logging_history: {
        Row: {
          created_at: string
          date: string
          id: string
          rainfall_mm: number
          severity: Database["public"]["Enums"]["risk_level"] | null
          ward_id: string
          water_logged: boolean | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          rainfall_mm: number
          severity?: Database["public"]["Enums"]["risk_level"] | null
          ward_id: string
          water_logged?: boolean | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          rainfall_mm?: number
          severity?: Database["public"]["Enums"]["risk_level"] | null
          ward_id?: string
          water_logged?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "water_logging_history_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      complaint_status: "pending" | "in_progress" | "resolved" | "rejected"
      risk_level: "low" | "medium" | "high"
      user_role: "citizen" | "authority"
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
      complaint_status: ["pending", "in_progress", "resolved", "rejected"],
      risk_level: ["low", "medium", "high"],
      user_role: ["citizen", "authority"],
    },
  },
} as const
