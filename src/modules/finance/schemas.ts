/**
 * Finance Module Schemas
 * Zod validation schemas for expense management
 */

import { z } from 'zod';

// Expense categories that can be used for expenses
export const expenseCategorySchema = z.enum(['fixo', 'variavel', 'salario', 'imposto']);

// Status schema
export const expenseStatusSchema = z.enum(['pending', 'paid', 'overdue']);

// Create expense schema
export const createExpenseSchema = z.object({
  category: expenseCategorySchema,
  description: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  value: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor máximo excedido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento inválida').optional(),
  status: z.enum(['pending', 'paid']).optional(),
});

// Update expense schema (all fields optional)
export const updateExpenseSchema = z.object({
  category: expenseCategorySchema.optional(),
  description: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional(),
  value: z
    .number()
    .positive('Valor deve ser positivo')
    .max(999999999, 'Valor máximo excedido')
    .optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de vencimento inválida').optional().nullable(),
  status: expenseStatusSchema.optional(),
});

// Expense filters schema
export const expenseFiltersSchema = z.object({
  category: z.union([expenseCategorySchema, z.literal('all')]).optional(),
  status: z.union([expenseStatusSchema, z.literal('all')]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial inválida').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data final inválida').optional(),
});

// ID validation
export const expenseIdSchema = z.string().uuid('ID inválido');

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>;
