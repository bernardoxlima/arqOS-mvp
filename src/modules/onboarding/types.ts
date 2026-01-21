/**
 * Onboarding Module Types
 * Types for the setup wizard and organization configuration
 */

// Office size options
export type OfficeSize = 'solo' | 'small' | 'medium' | 'large';

// Team member role types
export type TeamRole = 'owner' | 'coordinator' | 'architect' | 'intern' | 'admin';

// Service types offered by the office
export type ServiceId = 'decorexpress' | 'projetexpress' | 'producao' | 'consultoria';

// Office costs structure
export interface OfficeCosts {
  rent: number;
  utilities: number;
  software: number;
  marketing: number;
  accountant: number;
  internet: number;
  others: number;
}

// Office configuration stored in organization.settings
export interface OfficeConfig {
  size: OfficeSize;
  margin: number;
  services: ServiceId[];
  costs: OfficeCosts;
}

// Organization settings structure (extends any existing settings)
export interface OrganizationSettings {
  setup_completed_at?: string | null;
  setup_skipped_at?: string | null;
  setup_step?: number;
  office?: OfficeConfig;
  [key: string]: unknown;
}

// Team member data for setup
export interface TeamMemberData {
  id?: string;
  name: string;
  role: TeamRole;
  salary: number;
  monthlyHours: number;
  email?: string;
}

// Setup wizard state
export interface SetupWizardState {
  currentStep: number;
  officeSize: OfficeSize | null;
  officeName: string;
  team: TeamMemberData[];
  costs: OfficeCosts;
  services: ServiceId[];
  margin: number;
}

// Setup status response
export interface SetupStatus {
  isCompleted: boolean;
  isSkipped: boolean;
  currentStep: number;
  organizationId: string;
  organizationName: string;
}

// Complete setup request
export interface CompleteSetupData {
  office: {
    size: OfficeSize;
    margin: number;
    services: ServiceId[];
    costs: OfficeCosts;
  };
  team: TeamMemberData[];
  organizationName: string;
}

// Step definition for wizard
export interface WizardStep {
  id: number;
  name: string;
  description: string;
}

// Office size option for UI
export interface OfficeSizeOption {
  id: OfficeSize;
  name: string;
  description: string;
  teamRange: string;
}

// Role option for team member form
export interface RoleOption {
  id: TeamRole;
  name: string;
  defaultSalary: number;
  defaultHours: number;
}

// Cost field definition for UI
export interface CostField {
  key: keyof OfficeCosts;
  label: string;
  placeholder?: string;
}

// Service option for multi-select
export interface ServiceOption {
  id: ServiceId;
  name: string;
  description: string;
}
