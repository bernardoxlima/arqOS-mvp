/**
 * Settings Module Schemas
 * Zod validation schemas for settings operations
 */

import { z } from "zod";
import {
  officeSizeSchema,
  teamRoleSchema,
  serviceIdSchema,
  officeCostsSchema,
} from "@/modules/onboarding";

// ============================================
// Organization Update Schemas
// ============================================

/**
 * Schema for updating organization name
 */
export const updateOrganizationNameSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
});

/**
 * Schema for updating organization settings
 */
export const updateOrganizationSettingsSchema = z.object({
  margin: z.number().min(10, "Margem mínima de 10%").max(100, "Margem máxima de 100%").optional(),
  hour_value: z.number().min(0).optional(),
  costs: officeCostsSchema.partial().optional(),
  office: z
    .object({
      size: officeSizeSchema.optional(),
      margin: z.number().min(10).max(100).optional(),
      services: z.array(serviceIdSchema).optional(),
      costs: officeCostsSchema.partial().optional(),
    })
    .optional(),
});

/**
 * Full organization update schema
 */
export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  settings: updateOrganizationSettingsSchema.optional(),
});

// ============================================
// Team Member Schemas
// ============================================

/**
 * Schema for creating a new team member
 */
export const createTeamMemberSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  role: teamRoleSchema,
  salary: z.number().min(0, "Salário não pode ser negativo"),
  monthly_hours: z
    .number()
    .min(1, "Horas devem ser pelo menos 1")
    .max(744, "Máximo de horas por mês excedido"),
});

/**
 * Schema for updating an existing team member
 */
export const updateTeamMemberSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  role: teamRoleSchema.optional(),
  salary: z.number().min(0).optional(),
  monthly_hours: z.number().min(1).max(744).optional(),
});

// ============================================
// Form Schemas
// ============================================

/**
 * Schema for office section form
 */
export const officeFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  size: officeSizeSchema,
  margin: z.number().min(10, "Margem mínima de 10%").max(100, "Margem máxima de 100%"),
});

/**
 * Schema for team member form
 */
export const teamMemberFormSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  role: teamRoleSchema,
  salary: z.number().min(0, "Salário não pode ser negativo"),
  monthly_hours: z.number().min(1, "Horas devem ser pelo menos 1").max(744, "Máximo de horas"),
});

/**
 * Schema for costs form
 */
export const costsFormSchema = officeCostsSchema;

/**
 * Schema for services form
 */
export const servicesFormSchema = z.object({
  services: z.array(serviceIdSchema).min(1, "Selecione pelo menos um serviço"),
});

// ============================================
// Type Exports
// ============================================

export type UpdateOrganizationNameInput = z.infer<typeof updateOrganizationNameSchema>;
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type OfficeFormInput = z.infer<typeof officeFormSchema>;
export type TeamMemberFormInput = z.infer<typeof teamMemberFormSchema>;
export type CostsFormInput = z.infer<typeof costsFormSchema>;
export type ServicesFormInput = z.infer<typeof servicesFormSchema>;
