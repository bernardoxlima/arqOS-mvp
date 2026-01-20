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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          calculation: Json
          client_id: string | null
          client_snapshot: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          details: Json | null
          history: Json[] | null
          id: string
          notes: string | null
          organization_id: string
          payment_terms: Json | null
          scope: string[] | null
          service_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          calculation?: Json
          client_id?: string | null
          client_snapshot?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          history?: Json[] | null
          id?: string
          notes?: string | null
          organization_id: string
          payment_terms?: Json | null
          scope?: string[] | null
          service_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          calculation?: Json
          client_id?: string | null
          client_snapshot?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          history?: Json[] | null
          id?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: Json | null
          scope?: string[] | null
          service_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact: Json
          created_at: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          tags: string[] | null
        }
        Insert: {
          contact?: Json
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          tags?: string[] | null
        }
        Update: {
          contact?: Json
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      finance_records: {
        Row: {
          category: string | null
          created_at: string | null
          date: string
          description: string
          due_date: string | null
          id: string
          installment: string | null
          metadata: Json | null
          organization_id: string
          project_id: string | null
          status: string
          type: string
          value: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date: string
          description: string
          due_date?: string | null
          id?: string
          installment?: string | null
          metadata?: Json | null
          organization_id: string
          project_id?: string | null
          status?: string
          type: string
          value: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          installment?: string | null
          metadata?: Json | null
          organization_id?: string
          project_id?: string | null
          status?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      lookup_data: {
        Row: {
          active: boolean | null
          created_at: string | null
          data: Json | null
          id: string
          name: string
          organization_id: string
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          data?: Json | null
          id?: string
          name: string
          organization_id: string
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          data?: Json | null
          id?: string
          name?: string
          organization_id?: string
          type?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
        }
        Relationships: []
      }
      presentation_images: {
        Row: {
          created_at: string | null
          display_order: number
          file_size: number | null
          filename: string | null
          id: string
          image_url: string
          metadata: Json | null
          organization_id: string
          presentation_id: string
          section: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          file_size?: number | null
          filename?: string | null
          id?: string
          image_url: string
          metadata?: Json | null
          organization_id: string
          presentation_id: string
          section: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          file_size?: number | null
          filename?: string | null
          id?: string
          image_url?: string
          metadata?: Json | null
          organization_id?: string
          presentation_id?: string
          section?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "presentation_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentation_images_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      presentation_items: {
        Row: {
          ambiente: string | null
          category: string
          created_at: string | null
          id: string
          item_type: string
          name: string
          number: number
          organization_id: string
          position: Json | null
          presentation_id: string
          product: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ambiente?: string | null
          category: string
          created_at?: string | null
          id?: string
          item_type?: string
          name: string
          number: number
          organization_id: string
          position?: Json | null
          presentation_id: string
          product?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ambiente?: string | null
          category?: string
          created_at?: string | null
          id?: string
          item_type?: string
          name?: string
          number?: number
          organization_id?: string
          position?: Json | null
          presentation_id?: string
          product?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentation_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "presentation_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentation_items_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      presentations: {
        Row: {
          client_data: Json | null
          code: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          organization_id: string
          phase: string
          project_id: string | null
          settings: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_data?: Json | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          organization_id: string
          phase?: string
          project_id?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_data?: Json | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string
          phase?: string
          project_id?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presentations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_metrics"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "presentations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          metadata: Json | null
          organization_id: string
          role: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          metadata?: Json | null
          organization_id: string
          role: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          role?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_items: {
        Row: {
          category: string | null
          created_at: string | null
          environment: string | null
          id: string
          item: Json
          organization_id: string
          position: Json | null
          project_id: string
          supplier: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          item?: Json
          organization_id: string
          position?: Json | null
          project_id: string
          supplier?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          item?: Json
          organization_id?: string
          position?: Json | null
          project_id?: string
          supplier?: Json | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_id: string | null
          client_id: string | null
          client_snapshot: Json | null
          code: string
          completed_at: string | null
          created_at: string | null
          financials: Json | null
          id: string
          notes: string | null
          organization_id: string
          schedule: Json | null
          scope: string[] | null
          service_type: string
          stage: string | null
          status: string
          team: Json | null
          updated_at: string | null
          workflow: Json | null
        }
        Insert: {
          budget_id?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          code: string
          completed_at?: string | null
          created_at?: string | null
          financials?: Json | null
          id?: string
          notes?: string | null
          organization_id: string
          schedule?: Json | null
          scope?: string[] | null
          service_type: string
          stage?: string | null
          status?: string
          team?: Json | null
          updated_at?: string | null
          workflow?: Json | null
        }
        Update: {
          budget_id?: string | null
          client_id?: string | null
          client_snapshot?: Json | null
          code?: string
          completed_at?: string | null
          created_at?: string | null
          financials?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string
          schedule?: Json | null
          scope?: string[] | null
          service_type?: string
          stage?: string | null
          status?: string
          team?: Json | null
          updated_at?: string | null
          workflow?: Json | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          hours: number
          id: string
          organization_id: string
          profile_id: string
          project_id: string
          stage: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          hours: number
          id?: string
          organization_id: string
          profile_id: string
          project_id: string
          stage?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          hours?: number
          id?: string
          organization_id?: string
          profile_id?: string
          project_id?: string
          stage?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      db_health_metrics: {
        Row: {
          active_connections: number | null
          database_size_bytes: number | null
          database_size_pretty: string | null
          idle_connections: number | null
          max_connections: number | null
          total_connections: number | null
        }
        Relationships: []
      }
      finance_monthly_summary: {
        Row: {
          month: string | null
          organization_id: string | null
          overdue_value: number | null
          paid_value: number | null
          pending_value: number | null
          record_count: number | null
          total_value: number | null
          type: string | null
        }
        Relationships: []
      }
      organization_metrics: {
        Row: {
          active_projects: number | null
          active_projects_value: number | null
          approved_budgets: number | null
          completed_projects: number | null
          draft_budgets: number | null
          hours_this_month: number | null
          organization_id: string | null
          organization_name: string | null
          overdue_records: number | null
          pending_budgets: number | null
          pending_receivables: number | null
          revenue_this_month: number | null
          team_members: number | null
          total_budgets: number | null
          total_clients: number | null
          total_projects: number | null
        }
        Insert: {
          active_projects?: never
          active_projects_value?: never
          approved_budgets?: never
          completed_projects?: never
          draft_budgets?: never
          hours_this_month?: never
          organization_id?: string | null
          organization_name?: string | null
          overdue_records?: never
          pending_budgets?: never
          pending_receivables?: never
          revenue_this_month?: never
          team_members?: never
          total_budgets?: never
          total_clients?: never
          total_projects?: never
        }
        Update: {
          active_projects?: never
          active_projects_value?: never
          approved_budgets?: never
          completed_projects?: never
          draft_budgets?: never
          hours_this_month?: never
          organization_id?: string | null
          organization_name?: string | null
          overdue_records?: never
          pending_budgets?: never
          pending_receivables?: never
          revenue_this_month?: never
          team_members?: never
          total_budgets?: never
          total_clients?: never
          total_projects?: never
        }
        Relationships: []
      }
      project_performance: {
        Row: {
          actual_hour_rate: number | null
          code: string | null
          days_elapsed: number | null
          days_until_deadline: number | null
          deadline: string | null
          delivered_on_time: boolean | null
          estimated_hours: number | null
          hours_usage_percent: number | null
          hours_used: number | null
          id: string | null
          organization_id: string | null
          project_value: number | null
          service_type: string | null
          stage: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          actual_hour_rate?: never
          code?: string | null
          days_elapsed?: never
          days_until_deadline?: never
          deadline?: never
          delivered_on_time?: never
          estimated_hours?: never
          hours_usage_percent?: never
          hours_used?: never
          id?: string | null
          organization_id?: string | null
          project_value?: never
          service_type?: string | null
          stage?: string | null
          start_date?: never
          status?: string | null
        }
        Update: {
          actual_hour_rate?: never
          code?: string | null
          days_elapsed?: never
          days_until_deadline?: never
          deadline?: never
          delivered_on_time?: never
          estimated_hours?: never
          hours_usage_percent?: never
          hours_used?: never
          id?: string | null
          organization_id?: string | null
          project_value?: never
          service_type?: string | null
          stage?: string | null
          start_date?: never
          status?: string | null
        }
        Relationships: []
      }
      slow_queries: {
        Row: {
          calls: number | null
          mean_exec_time_ms: number | null
          percent_of_total: number | null
          query: string | null
          rows: number | null
          total_exec_time_ms: number | null
        }
        Relationships: []
      }
      table_sizes: {
        Row: {
          column_count: number | null
          data_size: string | null
          index_size: string | null
          schemaname: unknown
          tablename: unknown
          total_size: string | null
        }
        Relationships: []
      }
      team_productivity: {
        Row: {
          avg_hours_per_entry: number | null
          entry_count: number | null
          full_name: string | null
          month: string | null
          organization_id: string | null
          profile_id: string | null
          projects_worked: number | null
          role: string | null
          total_hours: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_presentation_progress: {
        Args: { pres_id: string }
        Returns: Json
      }
      check_overdue_finance_records: { Args: never; Returns: number }
      cleanup_old_activity_logs: { Args: never; Returns: number }
      cleanup_orphaned_storage_files: { Args: never; Returns: number }
      generate_budget_code: { Args: { org_id: string }; Returns: string }
      generate_presentation_code: { Args: { org_id: string }; Returns: string }
      generate_project_code: {
        Args: { org_id: string; svc_type: string }
        Returns: string
      }
      get_current_profile: {
        Args: never
        Returns: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          metadata: Json | null
          organization_id: string
          role: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_organizations_needing_attention: {
        Args: never
        Returns: {
          issue_details: string
          issue_type: string
          organization_id: string
          organization_name: string
          severity: string
        }[]
      }
      get_presentation_summary: { Args: { pres_id: string }; Returns: Json }
      get_storage_url: {
        Args: { bucket: string; expires_in?: number; file_path: string }
        Returns: string
      }
      get_user_organization_id: { Args: never; Returns: string }
      run_all_tests: {
        Args: never
        Returns: {
          category: string
          details: string
          passed: boolean
          test_name: string
        }[]
      }
      test_cleanup: { Args: { org_id: string }; Returns: undefined }
      test_create_organization: { Args: { org_name?: string }; Returns: string }
      test_create_profile: {
        Args: { org_id: string; profile_name?: string; profile_role?: string }
        Returns: string
      }
      test_data_integrity: {
        Args: never
        Returns: {
          details: string
          passed: boolean
          test_name: string
        }[]
      }
      test_query_performance: {
        Args: never
        Returns: {
          execution_time_ms: number
          query_name: string
          row_count: number
          status: string
        }[]
      }
      test_rls_isolation: {
        Args: never
        Returns: {
          details: string
          passed: boolean
          test_name: string
        }[]
      }
      test_triggers: {
        Args: never
        Returns: {
          details: string
          passed: boolean
          test_name: string
        }[]
      }
      update_table_statistics: { Args: never; Returns: undefined }
      user_has_role: { Args: { required_roles: string[] }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
