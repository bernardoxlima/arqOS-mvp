// ============================================================================
// TypeScript Types for ArqExpress Unified Database
// Auto-generated compatible types for Supabase client
// Author: DevOps Senior
// Date: 2026-01-19
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'owner' | 'coordinator' | 'architect' | 'intern' | 'admin'

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected'

export type ProjectStatus = 'aguardando' | 'em_andamento' | 'entregue' | 'cancelado'

export type ServiceType =
  | 'arquitetonico'
  | 'interiores'
  | 'decoracao'
  | 'reforma'
  | 'comercial'
  | 'decorexpress'
  | 'producao'
  | 'projetexpress'

export type FinanceType = 'income' | 'expense'

export type FinanceCategory = 'projeto' | 'fixo' | 'variavel' | 'salario' | 'imposto'

export type FinanceStatus = 'pending' | 'paid' | 'overdue'

export type ItemCategory =
  | 'mobiliario'
  | 'marcenaria'
  | 'iluminacao'
  | 'decoracao'
  | 'revestimentos'
  | 'metais_loucas'
  | 'eletrodomesticos'
  | 'textil'
  | 'paisagismo'
  | 'arte'
  // New categories
  | 'marmoraria'
  | 'cortinas'
  | 'materiais_revestimentos'
  | 'eletrica'
  | 'hidraulica'
  | 'mao_de_obra'
  | 'acabamentos'
  | 'outros'

export type PresentationPhase = 'apresentacao' | 'revisao' | 'manual' | 'entrega'

export type PresentationStatus = 'draft' | 'in_progress' | 'ready' | 'delivered'

export type PresentationImageSection =
  | 'photos_before'
  | 'moodboard'
  | 'references'
  | 'floor_plan'
  | 'renders'

export type PresentationItemCategory =
  | 'mobiliario'
  | 'marcenaria'
  | 'marmoraria'
  | 'iluminacao'
  | 'decoracao'
  | 'cortinas'
  | 'materiais_revestimentos'
  | 'eletrica'
  | 'hidraulica'
  | 'mao_de_obra'
  | 'acabamentos'
  | 'outros'

export type PresentationItemType = 'layout' | 'complementary'

export type PresentationItemStatus = 'pending' | 'complete'

export type LookupType =
  | 'environment'
  | 'category'
  | 'supplier'
  | 'service_template'
  | 'workflow_template'

export type ActivityEntityType =
  | 'project'
  | 'budget'
  | 'client'
  | 'finance_record'
  | 'time_entry'
  | 'presentation'

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'stage_changed'

// ============================================================================
// JSONB TYPES
// ============================================================================

export interface OrganizationSettings {
  margin: number
  hour_value: number
  brand_architecture: {
    identity: Json
    essence: Json
    audience: Json
    method: Json
    transformation: Json
    vision: Json
    synthesis: Json
  }
  costs: {
    rent: number
    utilities: number
    software: number
    marketing: number
    accountant: number
    internet: number
    others: number
  }
}

export interface ProfileSettings {
  avatar_url: string | null
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
  squad: string | null
}

export interface ProfileMetadata {
  salary: number | null
  monthly_hours: number
  coordinator_id: string | null
}

export interface ClientContact {
  email: string | null
  phone: string | null
  document: string | null
  instagram: string | null
  address: string | null
  company: string | null
}

export interface BudgetCalculation {
  base_price: number
  multipliers: {
    complexity: number
    finish: number
  }
  extras_total: number
  survey_fee: number
  discount: number
  final_price: number
  estimated_hours: number
  hour_rate: number
  efficiency: string | null
  price_per_m2: number
}

export interface BudgetDetails {
  area: number
  rooms: number
  room_list: Array<{
    id: number
    name: string
    size: 'P' | 'M' | 'G'
  }>
  complexity: string
  finish: string
  modality: string
  project_type: string
}

export interface BudgetPaymentTerms {
  type: string
  installments: Array<{
    percent: number
    description: string
  }>
  validity_days: number
  custom_terms: string | null
}

export interface BudgetHistoryEntry {
  status: string
  date: string
  actor_id: string | null
  reason: string | null
}

export interface WorkflowStage {
  id: string
  name: string
  color: string
  order?: number
}

export interface ProjectWorkflow {
  type: string | null
  stages: WorkflowStage[]
  current_stage_index: number
}

export interface ProjectTeam {
  architect_id: string | null
  architect_name: string | null
  members: string[]
  squad: string | null
}

export interface ProjectSchedule {
  start_date: string | null
  deadline: string | null
  briefing_date: string | null
  presentation_date: string | null
  milestones: Array<{
    date: string
    type: string
    phase: string
    description: string
  }>
}

export interface ProjectFinancials {
  value: number
  estimated_hours: number
  hours_used: number
  hour_rate: number
}

export interface ClientSnapshot {
  id: string
  name: string
  contact: ClientContact
  snapshot_at: string
}

export interface SupplierInfo {
  id: string | null
  name: string | null
  website: string | null
}

export interface ItemInfo {
  name: string | null
  description: string | null
  quantity: number
  unit_price: number
  image_url: string | null
  product_link: string | null
}

export interface ItemPosition {
  x: number | null
  y: number | null
  rotation: number
}

export interface FinanceMetadata {
  client: string | null
  project_code: string | null
  payment_method: string | null
  receipt_url: string | null
}

export interface ActivityChanges {
  [key: string]: {
    old: Json
    new: Json
  }
}

// ============================================================================
// PRESENTATION JSONB TYPES
// ============================================================================

export interface PresentationClientData {
  name: string | null
  phone: string | null
  email: string | null
  address: string | null
  cpf: string | null
  project_code: string | null
}

export interface PresentationSettings {
  architect_name: string | null
  start_date: string | null
  delivery_date: string | null
  total_area_m2: number
  environments: string[]
}

export interface PresentationImageMetadata {
  width: number | null
  height: number | null
  format: string | null
  alt_text: string | null
}

export interface PresentationProduct {
  description: string | null
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  supplier: string | null
  supplier_url: string | null
  product_link: string | null
  image_url: string | null
}

export interface PresentationItemPosition {
  x: number | null
  y: number | null
  rotation: number
  scale: number
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Organization {
  id: string
  name: string
  slug: string
  settings: OrganizationSettings
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  organization_id: string
  full_name: string
  email: string
  role: UserRole
  settings: ProfileSettings
  metadata: ProfileMetadata
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  organization_id: string
  name: string
  contact: ClientContact
  tags: string[]
  notes: string | null
  created_at: string
}

export interface Budget {
  id: string
  organization_id: string
  code: string
  status: BudgetStatus
  client_id: string | null
  client_snapshot: ClientSnapshot | null
  service_type: ServiceType
  calculation: BudgetCalculation
  details: BudgetDetails
  payment_terms: BudgetPaymentTerms
  scope: string[]
  notes: string | null
  history: BudgetHistoryEntry[]
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  organization_id: string
  code: string
  budget_id: string | null
  client_id: string | null
  client_snapshot: ClientSnapshot | null
  service_type: ServiceType
  status: ProjectStatus
  stage: string | null
  workflow: ProjectWorkflow
  team: ProjectTeam
  schedule: ProjectSchedule
  financials: ProjectFinancials
  scope: string[]
  notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface TimeEntry {
  id: string
  organization_id: string
  project_id: string
  profile_id: string
  stage: string | null
  hours: number
  description: string | null
  date: string
  created_at: string
}

export interface ProjectItem {
  id: string
  organization_id: string
  project_id: string
  environment: string | null
  category: ItemCategory | null
  supplier: SupplierInfo
  item: ItemInfo
  position: ItemPosition
  created_at: string
}

export interface FinanceRecord {
  id: string
  organization_id: string
  type: FinanceType
  category: FinanceCategory | null
  project_id: string | null
  description: string
  value: number
  date: string
  due_date: string | null
  status: FinanceStatus
  installment: string | null
  metadata: FinanceMetadata
  created_at: string
}

export interface LookupData {
  id: string
  organization_id: string
  type: LookupType
  name: string
  data: Json
  active: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string
  entity_type: ActivityEntityType
  entity_id: string
  action: ActivityAction
  actor_id: string | null
  changes: ActivityChanges
  created_at: string
}

// ============================================================================
// PRESENTATION TABLE TYPES
// ============================================================================

export interface Presentation {
  id: string
  organization_id: string
  project_id: string | null
  name: string
  code: string | null
  phase: PresentationPhase
  status: PresentationStatus
  client_data: PresentationClientData
  settings: PresentationSettings
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PresentationImage {
  id: string
  organization_id: string
  presentation_id: string
  section: PresentationImageSection
  image_url: string
  thumbnail_url: string | null
  filename: string | null
  file_size: number | null
  display_order: number
  metadata: PresentationImageMetadata
  created_at: string
}

export interface PresentationItem {
  id: string
  organization_id: string
  presentation_id: string
  number: number
  name: string
  ambiente: string | null
  category: PresentationItemCategory
  item_type: PresentationItemType
  product: PresentationProduct
  position: PresentationItemPosition
  status: PresentationItemStatus
  created_at: string
  updated_at: string
}

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Organization, 'id'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Profile, 'id' | 'user_id'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          tags?: string[]
        }
        Update: Partial<Omit<Client, 'id'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'code' | 'created_at' | 'updated_at'> & {
          id?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Budget, 'id' | 'organization_id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'code' | 'created_at' | 'updated_at'> & {
          id?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Project, 'id' | 'organization_id'>>
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<TimeEntry, 'id' | 'organization_id'>>
      }
      project_items: {
        Row: ProjectItem
        Insert: Omit<ProjectItem, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ProjectItem, 'id' | 'organization_id'>>
      }
      finance_records: {
        Row: FinanceRecord
        Insert: Omit<FinanceRecord, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<FinanceRecord, 'id' | 'organization_id'>>
      }
      lookup_data: {
        Row: LookupData
        Insert: Omit<LookupData, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          active?: boolean
        }
        Update: Partial<Omit<LookupData, 'id' | 'organization_id'>>
      }
      activity_log: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: never // Activity log is append-only
      }
      // Presentations Module
      presentations: {
        Row: Presentation
        Insert: Omit<Presentation, 'id' | 'code' | 'created_at' | 'updated_at'> & {
          id?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Presentation, 'id' | 'organization_id'>>
      }
      presentation_images: {
        Row: PresentationImage
        Insert: Omit<PresentationImage, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
          display_order?: number
        }
        Update: Partial<Omit<PresentationImage, 'id' | 'organization_id'>>
      }
      presentation_items: {
        Row: PresentationItem
        Insert: Omit<PresentationItem, 'id' | 'number' | 'created_at' | 'updated_at' | 'status'> & {
          id?: string
          number?: number
          created_at?: string
          updated_at?: string
          status?: PresentationItemStatus
        }
        Update: Partial<Omit<PresentationItem, 'id' | 'organization_id'>>
      }
    }
    Views: {}
    Functions: {
      get_user_organization_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_current_profile: {
        Args: Record<string, never>
        Returns: Profile
      }
      user_has_role: {
        Args: { required_roles: string[] }
        Returns: boolean
      }
      generate_budget_code: {
        Args: { org_id: string }
        Returns: string
      }
      generate_project_code: {
        Args: { org_id: string; svc_type: string }
        Returns: string
      }
      check_overdue_finance_records: {
        Args: Record<string, never>
        Returns: void
      }
      generate_presentation_code: {
        Args: { org_id: string }
        Returns: string
      }
      calculate_presentation_progress: {
        Args: { pres_id: string }
        Returns: Json
      }
      get_presentation_summary: {
        Args: { pres_id: string }
        Returns: Json
      }
    }
    Enums: {
      user_role: UserRole
      budget_status: BudgetStatus
      project_status: ProjectStatus
      service_type: ServiceType
      finance_type: FinanceType
      finance_category: FinanceCategory
      finance_status: FinanceStatus
      item_category: ItemCategory
      lookup_type: LookupType
      activity_entity_type: ActivityEntityType
      activity_action: ActivityAction
      // Presentations Module
      presentation_phase: PresentationPhase
      presentation_status: PresentationStatus
      presentation_image_section: PresentationImageSection
      presentation_item_category: PresentationItemCategory
      presentation_item_type: PresentationItemType
      presentation_item_status: PresentationItemStatus
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// For use with Supabase client
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience aliases
export type OrganizationRow = Tables<'organizations'>
export type ProfileRow = Tables<'profiles'>
export type ClientRow = Tables<'clients'>
export type BudgetRow = Tables<'budgets'>
export type ProjectRow = Tables<'projects'>
export type TimeEntryRow = Tables<'time_entries'>
export type ProjectItemRow = Tables<'project_items'>
export type FinanceRecordRow = Tables<'finance_records'>
export type LookupDataRow = Tables<'lookup_data'>
export type ActivityLogRow = Tables<'activity_log'>
// Presentations
export type PresentationRow = Tables<'presentations'>
export type PresentationImageRow = Tables<'presentation_images'>
export type PresentationItemRow = Tables<'presentation_items'>

// Insert types
export type OrganizationInsert = InsertTables<'organizations'>
export type ProfileInsert = InsertTables<'profiles'>
export type ClientInsert = InsertTables<'clients'>
export type BudgetInsert = InsertTables<'budgets'>
export type ProjectInsert = InsertTables<'projects'>
export type TimeEntryInsert = InsertTables<'time_entries'>
export type ProjectItemInsert = InsertTables<'project_items'>
export type FinanceRecordInsert = InsertTables<'finance_records'>
export type LookupDataInsert = InsertTables<'lookup_data'>
export type ActivityLogInsert = InsertTables<'activity_log'>
// Presentations
export type PresentationInsert = InsertTables<'presentations'>
export type PresentationImageInsert = InsertTables<'presentation_images'>
export type PresentationItemInsert = InsertTables<'presentation_items'>

// Update types
export type OrganizationUpdate = UpdateTables<'organizations'>
export type ProfileUpdate = UpdateTables<'profiles'>
export type ClientUpdate = UpdateTables<'clients'>
export type BudgetUpdate = UpdateTables<'budgets'>
export type ProjectUpdate = UpdateTables<'projects'>
export type TimeEntryUpdate = UpdateTables<'time_entries'>
export type ProjectItemUpdate = UpdateTables<'project_items'>
export type FinanceRecordUpdate = UpdateTables<'finance_records'>
export type LookupDataUpdate = UpdateTables<'lookup_data'>
// Presentations
export type PresentationUpdate = UpdateTables<'presentations'>
export type PresentationImageUpdate = UpdateTables<'presentation_images'>
export type PresentationItemUpdate = UpdateTables<'presentation_items'>
