// Re-export status types from existing modules
export type { ProjectStatus, ServiceType } from "@/modules/projects";
export type { BudgetStatus } from "@/modules/budgets";
export type { PresentationStatus } from "@/modules/presentations";

// ============================================
// Dashboard Stats Types
// ============================================

/**
 * Project statistics for dashboard
 */
export interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
  activeCount: number;
  completedThisMonth: number;
}

/**
 * Budget statistics for dashboard
 */
export interface BudgetStats {
  total: number;
  byStatus: Record<string, number>;
  approvalRate: number; // approved / (approved + rejected)
  avgValue: number; // average final_price
  pendingValue: number; // sum of draft + sent values
}

/**
 * Presentation statistics for dashboard
 */
export interface PresentationStats {
  total: number;
  byStatus: Record<string, number>;
  inProgressCount: number;
}

/**
 * Hours statistics for dashboard
 */
export interface HoursStats {
  totalThisMonth: number;
  byProject: Array<{
    projectId: string;
    projectCode: string;
    hours: number;
  }>;
}

/**
 * Combined dashboard statistics
 */
export interface DashboardStats {
  projects: ProjectStats;
  budgets: BudgetStats;
  presentations: PresentationStats;
  hours: HoursStats;
}

// ============================================
// Recent Projects Types
// ============================================

/**
 * Recent project for dashboard listing
 */
export interface RecentProject {
  id: string;
  code: string;
  status: string;
  stage: string | null;
  serviceType: string;
  client: {
    id: string;
    name: string;
  } | null;
  financials: {
    value: number;
    hoursUsed: number;
  } | null;
  updatedAt: string;
}

// ============================================
// Finance Summary Types
// ============================================

/**
 * Income breakdown for finance summary
 */
export interface IncomeBreakdown {
  total: number;
  byCategory: Record<string, number>;
  byPaymentStatus: {
    paid: number;
    pending: number;
    overdue: number;
  };
}

/**
 * Expenses breakdown for finance summary
 */
export interface ExpensesBreakdown {
  total: number;
  byCategory: Record<string, number>;
}

/**
 * Project revenue entry
 */
export interface ProjectRevenue {
  projectId: string;
  projectCode: string;
  value: number;
}

/**
 * Finance summary response
 */
export interface FinanceSummary {
  period: {
    start: string;
    end: string;
  };
  income: IncomeBreakdown;
  expenses: ExpensesBreakdown;
  balance: number; // income.paid - expenses.total
  projectsRevenue: ProjectRevenue[];
}

// ============================================
// Service Result Types
// ============================================

/**
 * Generic result wrapper for service functions
 */
export interface DashboardResult<T = void> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

// ============================================
// API Response Types
// ============================================

export interface DashboardStatsResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export interface RecentProjectsResponse {
  success: boolean;
  data?: RecentProject[];
  error?: string;
}

export interface FinanceSummaryResponse {
  success: boolean;
  data?: FinanceSummary;
  error?: string;
}

// ============================================
// Query Parameters
// ============================================

export interface FinanceSummaryParams {
  startDate?: string;
  endDate?: string;
}

// ============================================
// Organization Types
// ============================================

/**
 * Organization costs breakdown
 */
export interface OrganizationCosts {
  rent: number;
  utilities: number;
  software: number;
  marketing: number;
  accountant: number;
  internet: number;
  others: number;
}

/**
 * Organization settings from JSONB
 */
export interface OrganizationSettings {
  margin: number;
  hour_value: number;
  costs: OrganizationCosts;
}

/**
 * Organization data for dashboard
 */
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  settings: OrganizationSettings;
}

// ============================================
// Team Types
// ============================================

/**
 * Team member with profile data
 */
export interface TeamMember {
  id: string;
  full_name: string;
  role: "owner" | "coordinator" | "architect" | "intern" | "admin";
  avatar_url: string | null;
  salary: number | null;
  monthly_hours: number;
}

/**
 * Team data aggregation
 */
export interface TeamData {
  members: TeamMember[];
  totals: {
    salaries: number;
    hours: number;
    hourly_rate: number;
  };
}

// ============================================
// Office Totals Types
// ============================================

/**
 * Calculated office totals
 */
export interface OfficeTotals {
  salaries: number;
  costs: number;
  monthly: number;
  hourly: number;
}

// ============================================
// Process Flow Types
// ============================================

/**
 * Process flow step counts
 */
export interface ProcessFlowCounts {
  orcamento: number;
  aprovacao: number;
  projeto: number;
  financeiro: number;
}

// ============================================
// Active Services Types
// ============================================

/**
 * Active service from projects
 */
export interface ActiveService {
  type: string;
  count: number;
}

// ============================================
// API Response Types (Organization)
// ============================================

export interface OrganizationResponse {
  success: boolean;
  data?: OrganizationData;
  error?: string;
}

export interface TeamResponse {
  success: boolean;
  data?: TeamData;
  error?: string;
}

export interface ServicesResponse {
  success: boolean;
  data?: ActiveService[];
  error?: string;
}
