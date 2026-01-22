import { describe, it, expect } from "vitest";
import {
  officeSizeSchema,
  teamRoleSchema,
  serviceIdSchema,
  officeCostsSchema,
  teamMemberSchema,
  stepSizeSchema,
  stepNameSchema,
  stepTeamSchema,
  stepCostsSchema,
  stepServicesSchema,
  stepMarginSchema,
  completeSetupSchema,
  updateStepSchema,
  wizardStateSchema,
} from "../schemas";

describe("Onboarding Schemas", () => {
  // =========================================================================
  // officeSizeSchema
  // =========================================================================
  describe("officeSizeSchema", () => {
    it("should validate all office sizes", () => {
      const sizes = ["solo", "small", "medium", "large"];

      sizes.forEach((size) => {
        const result = officeSizeSchema.safeParse(size);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid size", () => {
      const result = officeSizeSchema.safeParse("huge");
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // teamRoleSchema
  // =========================================================================
  describe("teamRoleSchema", () => {
    it("should validate all team roles", () => {
      const roles = ["owner", "coordinator", "architect", "intern", "admin"];

      roles.forEach((role) => {
        const result = teamRoleSchema.safeParse(role);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid role", () => {
      const result = teamRoleSchema.safeParse("designer");
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // serviceIdSchema
  // =========================================================================
  describe("serviceIdSchema", () => {
    it("should validate all service ids", () => {
      const services = ["decorexpress", "projetexpress", "producao", "consultoria"];

      services.forEach((service) => {
        const result = serviceIdSchema.safeParse(service);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid service", () => {
      const result = serviceIdSchema.safeParse("arquitetonico");
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // officeCostsSchema
  // =========================================================================
  describe("officeCostsSchema", () => {
    it("should validate complete costs object", () => {
      const result = officeCostsSchema.safeParse({
        rent: 2000,
        utilities: 300,
        software: 500,
        marketing: 200,
        accountant: 400,
        internet: 150,
        others: 100,
      });
      expect(result.success).toBe(true);
    });

    it("should use defaults for missing values", () => {
      const result = officeCostsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rent).toBe(0);
        expect(result.data.utilities).toBe(0);
      }
    });

    it("should reject negative values", () => {
      const result = officeCostsSchema.safeParse({
        rent: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // teamMemberSchema
  // =========================================================================
  describe("teamMemberSchema", () => {
    it("should validate complete team member", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 160,
      });
      expect(result.success).toBe(true);
    });

    it("should validate team member with optional id", () => {
      const result = teamMemberSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 160,
      });
      expect(result.success).toBe(true);
    });

    it("should validate team member with optional email", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 160,
        email: "maria@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty string for email", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 160,
        email: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name too short", () => {
      const result = teamMemberSchema.safeParse({
        name: "M",
        role: "architect",
        salary: 8000,
        monthlyHours: 160,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative salary", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: -1000,
        monthlyHours: 160,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid monthlyHours", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject monthlyHours exceeding max", () => {
      const result = teamMemberSchema.safeParse({
        name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthlyHours: 750,
      });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // Step Schemas
  // =========================================================================
  describe("stepSizeSchema", () => {
    it("should validate valid office size", () => {
      const result = stepSizeSchema.safeParse({ officeSize: "small" });
      expect(result.success).toBe(true);
    });
  });

  describe("stepNameSchema", () => {
    it("should validate valid office name", () => {
      const result = stepNameSchema.safeParse({ officeName: "Studio Arquitetura" });
      expect(result.success).toBe(true);
    });

    it("should reject name too short", () => {
      const result = stepNameSchema.safeParse({ officeName: "A" });
      expect(result.success).toBe(false);
    });

    it("should reject name too long", () => {
      const result = stepNameSchema.safeParse({ officeName: "A".repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe("stepTeamSchema", () => {
    it("should validate team with members", () => {
      const result = stepTeamSchema.safeParse({
        team: [
          { name: "Owner", role: "owner", salary: 10000, monthlyHours: 160 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty team", () => {
      const result = stepTeamSchema.safeParse({ team: [] });
      expect(result.success).toBe(false);
    });
  });

  describe("stepCostsSchema", () => {
    it("should validate costs object", () => {
      const result = stepCostsSchema.safeParse({
        costs: { rent: 2000, utilities: 300, software: 500, marketing: 200, accountant: 400, internet: 150, others: 100 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("stepServicesSchema", () => {
    it("should validate services array", () => {
      const result = stepServicesSchema.safeParse({
        services: ["decorexpress", "projetexpress"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty services array", () => {
      const result = stepServicesSchema.safeParse({ services: [] });
      expect(result.success).toBe(false);
    });
  });

  describe("stepMarginSchema", () => {
    it("should validate valid margin", () => {
      const result = stepMarginSchema.safeParse({ margin: 30 });
      expect(result.success).toBe(true);
    });

    it("should reject margin below minimum", () => {
      const result = stepMarginSchema.safeParse({ margin: 5 });
      expect(result.success).toBe(false);
    });

    it("should reject margin above maximum", () => {
      const result = stepMarginSchema.safeParse({ margin: 150 });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // completeSetupSchema
  // =========================================================================
  describe("completeSetupSchema", () => {
    it("should validate complete setup data", () => {
      const result = completeSetupSchema.safeParse({
        office: {
          size: "small",
          margin: 30,
          services: ["decorexpress"],
          costs: { rent: 2000, utilities: 300, software: 500, marketing: 200, accountant: 400, internet: 150, others: 100 },
        },
        team: [{ name: "Owner", role: "owner", salary: 10000, monthlyHours: 160 }],
        organizationName: "Studio Arquitetura",
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // updateStepSchema
  // =========================================================================
  describe("updateStepSchema", () => {
    it("should validate valid step numbers", () => {
      for (let step = 1; step <= 6; step++) {
        const result = updateStepSchema.safeParse({ step });
        expect(result.success).toBe(true);
      }
    });

    it("should reject step 0", () => {
      const result = updateStepSchema.safeParse({ step: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject step 7", () => {
      const result = updateStepSchema.safeParse({ step: 7 });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // wizardStateSchema
  // =========================================================================
  describe("wizardStateSchema", () => {
    it("should validate empty state with defaults", () => {
      const result = wizardStateSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentStep).toBe(1);
        expect(result.data.officeSize).toBe(null);
        expect(result.data.officeName).toBe("");
        expect(result.data.team).toEqual([]);
        expect(result.data.services).toEqual([]);
        expect(result.data.margin).toBe(30);
      }
    });

    it("should validate complete wizard state", () => {
      const result = wizardStateSchema.safeParse({
        currentStep: 3,
        officeSize: "medium",
        officeName: "Studio",
        team: [{ name: "Owner", role: "owner", salary: 10000, monthlyHours: 160 }],
        costs: { rent: 2000, utilities: 300, software: 500, marketing: 200, accountant: 400, internet: 150, others: 100 },
        services: ["decorexpress", "projetexpress"],
        margin: 35,
      });
      expect(result.success).toBe(true);
    });
  });
});
