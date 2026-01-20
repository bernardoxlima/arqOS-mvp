import { z } from "zod";

// Service types enum - core types plus extended
const serviceTypeEnum = z.enum([
  "decorexpress",
  "producao",
  "projetexpress",
  "arquitetonico",
  "interiores",
]);

// Project status enum
const projectStatusEnum = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
  "cancelled",
]);

// Modality enum
const modalityEnum = z.enum(["presencial", "online"]);

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido").optional(),
  serviceType: serviceTypeEnum,
  modality: modalityEnum.optional(),
  scope: z.array(z.string().min(1, "Item do escopo não pode ser vazio")).optional(),
  notes: z.string().max(2000, "Notas não podem exceder 2000 caracteres").optional(),
  schedule: z
    .object({
      startDate: z.string().datetime().optional(),
      estimatedEndDate: z.string().datetime().optional(),
      estimatedHours: z.number().positive("Horas estimadas devem ser positivas").optional(),
    })
    .optional(),
  team: z
    .object({
      leaderId: z.string().uuid("ID do líder deve ser um UUID válido").optional(),
      memberIds: z.array(z.string().uuid("IDs dos membros devem ser UUIDs válidos")).optional(),
    })
    .optional(),
});

export type CreateProjectSchemaType = z.infer<typeof createProjectSchema>;

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = z.object({
  status: projectStatusEnum.optional(),
  stage: z.string().optional(),
  notes: z.string().max(2000, "Notas não podem exceder 2000 caracteres").optional(),
  scope: z.array(z.string().min(1, "Item do escopo não pode ser vazio")).optional(),
  schedule: z.record(z.string(), z.unknown()).optional(),
  team: z.record(z.string(), z.unknown()).optional(),
  workflow: z.record(z.string(), z.unknown()).optional(),
  financials: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateProjectSchemaType = z.infer<typeof updateProjectSchema>;

/**
 * Schema for project filters (query params)
 */
export const projectFiltersSchema = z.object({
  status: projectStatusEnum.optional(),
  serviceType: serviceTypeEnum.optional(),
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido").optional(),
  search: z.string().optional(),
  stage: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().min(1, "Limite mínimo é 1").max(100, "Limite máximo é 100").default(20),
  offset: z.coerce.number().min(0, "Offset mínimo é 0").default(0),
});

export type ProjectFiltersSchemaType = z.infer<typeof projectFiltersSchema>;

/**
 * Schema for UUID param validation
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export type UUIDParamSchemaType = z.infer<typeof uuidParamSchema>;
