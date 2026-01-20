import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  updateProjectSchema,
  projectFiltersSchema,
  uuidParamSchema,
} from "../schemas";

describe("Projects Schemas", () => {
  describe("createProjectSchema", () => {
    it("should validate a minimal project creation", () => {
      const data = {
        serviceType: "decorexpress",
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.serviceType).toBe("decorexpress");
      }
    });

    it("should validate a complete project creation", () => {
      const data = {
        clientId: "123e4567-e89b-12d3-a456-426614174000",
        serviceType: "projetexpress",
        modality: "online",
        scope: ["Sala de estar", "Cozinha"],
        notes: "Projeto urgente",
        schedule: {
          startDate: "2026-02-01T00:00:00.000Z",
          estimatedEndDate: "2026-03-01T00:00:00.000Z",
          estimatedHours: 40,
        },
        team: {
          leaderId: "123e4567-e89b-12d3-a456-426614174001",
          memberIds: ["123e4567-e89b-12d3-a456-426614174002"],
        },
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.serviceType).toBe("projetexpress");
        expect(result.data.modality).toBe("online");
        expect(result.data.scope).toHaveLength(2);
      }
    });

    it("should reject invalid service types", () => {
      const data = {
        serviceType: "invalid_type",
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid clientId (non-UUID)", () => {
      const data = {
        clientId: "not-a-uuid",
        serviceType: "decorexpress",
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject notes exceeding 2000 characters", () => {
      const data = {
        serviceType: "decorexpress",
        notes: "a".repeat(2001),
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid service types", () => {
      const serviceTypes = [
        "decorexpress",
        "producao",
        "projetexpress",
        "arquitetonico",
        "interiores",
      ];

      for (const type of serviceTypes) {
        const result = createProjectSchema.safeParse({ serviceType: type });
        expect(result.success).toBe(true);
      }
    });

    it("should accept both modality types", () => {
      const modalities = ["presencial", "online"];

      for (const modality of modalities) {
        const result = createProjectSchema.safeParse({
          serviceType: "decorexpress",
          modality,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject negative estimated hours", () => {
      const data = {
        serviceType: "decorexpress",
        schedule: {
          estimatedHours: -10,
        },
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProjectSchema", () => {
    it("should validate an empty update (no changes)", () => {
      const data = {};
      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const data = {
        status: "active",
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate all status values", () => {
      const statuses = ["draft", "active", "paused", "completed", "cancelled"];

      for (const status of statuses) {
        const result = updateProjectSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid status", () => {
      const data = {
        status: "invalid_status",
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should validate stage update", () => {
      const data = {
        stage: "moodboard",
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate notes update", () => {
      const data = {
        notes: "Updated project notes",
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate scope update", () => {
      const data = {
        scope: ["Novo ambiente"],
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate workflow update with any object", () => {
      const data = {
        workflow: {
          custom_field: "value",
          stages: [],
        },
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate financials update with any object", () => {
      const data = {
        financials: {
          value: 15000,
          paid: 5000,
        },
      };

      const result = updateProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("projectFiltersSchema", () => {
    it("should validate empty filters with defaults", () => {
      const data = {};
      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("should validate status filter", () => {
      const data = {
        status: "active",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate service type filter", () => {
      const data = {
        serviceType: "decorexpress",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate client ID filter", () => {
      const data = {
        clientId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid client ID", () => {
      const data = {
        clientId: "not-a-uuid",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should validate search filter", () => {
      const data = {
        search: "ARQ-2026",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate date range filters", () => {
      const data = {
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should coerce and validate limit", () => {
      const data = {
        limit: "50",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit below minimum", () => {
      const data = {
        limit: "0",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject limit above maximum", () => {
      const data = {
        limit: "101",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should coerce and validate offset", () => {
      const data = {
        offset: "10",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(10);
      }
    });

    it("should reject negative offset", () => {
      const data = {
        offset: "-1",
      };

      const result = projectFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("uuidParamSchema", () => {
    it("should validate a valid UUID", () => {
      const data = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = uuidParamSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject an invalid UUID", () => {
      const data = {
        id: "not-a-uuid",
      };

      const result = uuidParamSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty ID", () => {
      const data = {
        id: "",
      };

      const result = uuidParamSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing ID", () => {
      const data = {};

      const result = uuidParamSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
