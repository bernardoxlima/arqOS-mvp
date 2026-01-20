// Types
export type {
  // Re-exported status types
  ProjectStatus,
  ServiceType,
  BudgetStatus,
  PresentationStatus,
  // Dashboard types
  ProjectStats,
  BudgetStats,
  PresentationStats,
  HoursStats,
  DashboardStats,
  RecentProject,
  IncomeBreakdown,
  ExpensesBreakdown,
  ProjectRevenue,
  FinanceSummary,
  DashboardResult,
  // API Response types
  DashboardStatsResponse,
  RecentProjectsResponse,
  FinanceSummaryResponse,
  // Query params
  FinanceSummaryParams,
} from "./types";

// Schemas
export {
  financeSummaryParamsSchema,
  recentProjectsParamsSchema,
} from "./schemas";
export type {
  FinanceSummaryParamsInput,
  RecentProjectsParamsInput,
  RecentProjectsParams,
} from "./schemas";

// Services
export {
  getDashboardStats,
  getRecentProjects,
  getFinanceSummary,
} from "./services/dashboard.service";

// Hooks
export { useDashboard, type UseDashboardReturn } from "./hooks/use-dashboard";

// Components
export {
  MetricCard,
  FinanceCard,
  DashboardSkeleton,
  RecentBudgets,
  ActiveProjects,
  QuickActions,
} from "./components";
export type {
  MetricCardProps,
  FinanceCardProps,
  FinanceCardVariant,
  RecentBudgetsProps,
  ActiveProjectsProps,
  QuickActionsProps,
} from "./components";
