/**
 * Onboarding Module Schemas
 * Zod validation schemas for setup wizard
 */

import { z } from 'zod';

// Office size enum
export const officeSizeSchema = z.enum(['solo', 'small', 'medium', 'large']);

// Team role enum
export const teamRoleSchema = z.enum(['owner', 'coordinator', 'architect', 'intern', 'admin']);

// Service ID enum
export const serviceIdSchema = z.enum(['decorexpress', 'projetexpress', 'producao', 'consultoria']);

// Office costs schema
export const officeCostsSchema = z.object({
  rent: z.number().min(0).default(0),
  utilities: z.number().min(0).default(0),
  software: z.number().min(0).default(0),
  marketing: z.number().min(0).default(0),
  accountant: z.number().min(0).default(0),
  internet: z.number().min(0).default(0),
  others: z.number().min(0).default(0),
});

// Team member schema
export const teamMemberSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: teamRoleSchema,
  salary: z.number().min(0, 'Salário não pode ser negativo'),
  monthlyHours: z.number().min(1, 'Horas devem ser pelo menos 1').max(744, 'Máximo de horas por mês excedido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

// Step 1: Office size
export const stepSizeSchema = z.object({
  officeSize: officeSizeSchema,
});

// Step 2: Office name
export const stepNameSchema = z.object({
  officeName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
});

// Step 3: Team members
export const stepTeamSchema = z.object({
  team: z.array(teamMemberSchema).min(1, 'Adicione pelo menos um membro da equipe'),
});

// Step 4: Office costs
export const stepCostsSchema = z.object({
  costs: officeCostsSchema,
});

// Step 5: Services
export const stepServicesSchema = z.object({
  services: z.array(serviceIdSchema).min(1, 'Selecione pelo menos um serviço'),
});

// Step 6: Margin
export const stepMarginSchema = z.object({
  margin: z.number().min(10, 'Margem mínima de 10%').max(100, 'Margem máxima de 100%'),
});

// Complete setup data schema
export const completeSetupSchema = z.object({
  office: z.object({
    size: officeSizeSchema,
    margin: z.number().min(10).max(100),
    services: z.array(serviceIdSchema).min(1),
    costs: officeCostsSchema,
  }),
  team: z.array(teamMemberSchema).min(1),
  organizationName: z.string().min(2).max(100),
});

// Update step schema (for API)
export const updateStepSchema = z.object({
  step: z.number().min(1).max(6),
});

// Full wizard state schema
export const wizardStateSchema = z.object({
  currentStep: z.number().min(1).max(6).default(1),
  officeSize: officeSizeSchema.nullable().default(null),
  officeName: z.string().default(''),
  team: z.array(teamMemberSchema).default([]),
  costs: officeCostsSchema.default({
    rent: 0,
    utilities: 0,
    software: 0,
    marketing: 0,
    accountant: 0,
    internet: 0,
    others: 0,
  }),
  services: z.array(serviceIdSchema).default([]),
  margin: z.number().default(30),
});

// Type exports from schemas
export type OfficeSizeInput = z.infer<typeof officeSizeSchema>;
export type TeamRoleInput = z.infer<typeof teamRoleSchema>;
export type ServiceIdInput = z.infer<typeof serviceIdSchema>;
export type OfficeCostsInput = z.infer<typeof officeCostsSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type StepSizeInput = z.infer<typeof stepSizeSchema>;
export type StepNameInput = z.infer<typeof stepNameSchema>;
export type StepTeamInput = z.infer<typeof stepTeamSchema>;
export type StepCostsInput = z.infer<typeof stepCostsSchema>;
export type StepServicesInput = z.infer<typeof stepServicesSchema>;
export type StepMarginInput = z.infer<typeof stepMarginSchema>;
export type CompleteSetupInput = z.infer<typeof completeSetupSchema>;
export type UpdateStepInput = z.infer<typeof updateStepSchema>;
export type WizardStateInput = z.infer<typeof wizardStateSchema>;
