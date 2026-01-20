import { z } from "zod";

/**
 * Schema for finance summary query parameters
 */
export const financeSummaryParamsSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional(),
});

/**
 * Schema for recent projects query parameters
 */
export const recentProjectsParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Type exports from schemas
export type FinanceSummaryParamsInput = z.input<typeof financeSummaryParamsSchema>;
export type FinanceSummaryParams = z.output<typeof financeSummaryParamsSchema>;

export type RecentProjectsParamsInput = z.input<typeof recentProjectsParamsSchema>;
export type RecentProjectsParams = z.output<typeof recentProjectsParamsSchema>;
