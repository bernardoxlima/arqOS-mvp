/**
 * Settings Module Types
 * Types for organization and team settings management
 */

import type { TeamRole, OfficeCosts, ServiceId, OfficeSize, PositioningMultiplier } from "@/modules/onboarding";

// ============================================
// Organization Update Types
// ============================================

/**
 * Data for updating organization settings
 */
export interface UpdateOrganizationData {
  name?: string;
  settings?: {
    margin?: number;
    hour_value?: number;
    costs?: Partial<OfficeCosts>;
    office?: {
      size?: OfficeSize;
      margin?: number;
      services?: ServiceId[];
      costs?: Partial<OfficeCosts>;
      positioningMultiplier?: PositioningMultiplier;
    };
  };
}

/**
 * Full organization settings with office config
 */
export interface OrganizationSettingsFull {
  margin: number;
  hour_value: number;
  costs: OfficeCosts;
  setup_completed_at?: string | null;
  setup_skipped_at?: string | null;
  setup_step?: number;
  office?: {
    size: OfficeSize;
    margin: number;
    services: ServiceId[];
    costs: OfficeCosts;
    positioningMultiplier?: PositioningMultiplier;
  };
}

// ============================================
// Team Member Types
// ============================================

/**
 * Data for creating a new team member
 */
export interface CreateTeamMemberData {
  full_name: string;
  role: TeamRole;
  salary: number;
  monthly_hours: number;
}

/**
 * Data for updating an existing team member
 */
export interface UpdateTeamMemberData {
  full_name?: string;
  role?: TeamRole;
  salary?: number;
  monthly_hours?: number;
}

/**
 * Team member as stored in the database
 */
export interface TeamMemberRecord {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  role: TeamRole;
  avatar_url: string | null;
  salary: number | null;
  monthly_hours: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Settings State Types
// ============================================

/**
 * Settings page state
 */
export interface SettingsState {
  organization: {
    id: string;
    name: string;
    slug: string;
    settings: OrganizationSettingsFull;
  } | null;
  team: {
    members: TeamMemberRecord[];
    totals: {
      salaries: number;
      hours: number;
      hourly_rate: number;
    };
  } | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

// ============================================
// API Response Types
// ============================================

/**
 * Response for organization update
 */
export interface UpdateOrganizationResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
    settings: OrganizationSettingsFull;
  };
  error?: string;
}

/**
 * Response for team member operations
 */
export interface TeamMemberResponse {
  success: boolean;
  data?: TeamMemberRecord;
  error?: string;
}

/**
 * Response for team list
 */
export interface TeamListResponse {
  success: boolean;
  data?: {
    members: TeamMemberRecord[];
    totals: {
      salaries: number;
      hours: number;
      hourly_rate: number;
    };
  };
  error?: string;
}

// ============================================
// Form Types
// ============================================

/**
 * Office section form values
 */
export interface OfficeFormValues {
  name: string;
  size: OfficeSize;
  margin: number;
  positioningMultiplier: PositioningMultiplier;
}

/**
 * Team member form values
 */
export interface TeamMemberFormValues {
  full_name: string;
  role: TeamRole;
  salary: number;
  monthly_hours: number;
}

/**
 * Costs form values
 */
export interface CostsFormValues {
  rent: number;
  utilities: number;
  software: number;
  marketing: number;
  accountant: number;
  internet: number;
  others: number;
}

/**
 * Services form values
 */
export interface ServicesFormValues {
  services: ServiceId[];
}
