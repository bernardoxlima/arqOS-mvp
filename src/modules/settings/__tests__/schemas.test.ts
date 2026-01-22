import { describe, it, expect } from "vitest";
import {
  updateOrganizationNameSchema,
  updateOrganizationSettingsSchema,
  updateOrganizationSchema,
  createTeamMemberSchema,
  updateTeamMemberSchema,
  officeFormSchema,
  teamMemberFormSchema,
  costsFormSchema,
  servicesFormSchema,
} from "../schemas";

describe("Settings Schemas", () => {
  // =========================================================================
  // updateOrganizationNameSchema
  // =========================================================================
  describe("updateOrganizationNameSchema", () => {
    it("should validate valid name", () => {
      const result = updateOrganizationNameSchema.safeParse({
        name: "Studio Arquitetura",
      });
      expect(result.success).toBe(true);
    });

    it("should reject name too short", () => {
      const result = updateOrganizationNameSchema.safeParse({
        name: "A",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("2 caracteres");
      }
    });

    it("should reject name too long", () => {
      const result = updateOrganizationNameSchema.safeParse({
        name: "A".repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("longo");
      }
    });
  });

  // =========================================================================
  // updateOrganizationSettingsSchema
  // =========================================================================
  describe("updateOrganizationSettingsSchema", () => {
    it("should validate empty settings", () => {
      const result = updateOrganizationSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate margin only", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        margin: 25,
      });
      expect(result.success).toBe(true);
    });

    it("should reject margin below minimum", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        margin: 5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject margin above maximum", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        margin: 150,
      });
      expect(result.success).toBe(false);
    });

    it("should validate hour_value", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        hour_value: 150,
      });
      expect(result.success).toBe(true);
    });

    it("should validate partial costs", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        costs: {
          rent: 2500,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate office settings", () => {
      const result = updateOrganizationSettingsSchema.safeParse({
        office: {
          size: "medium",
          margin: 30,
          services: ["decorexpress", "projetexpress"],
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // updateOrganizationSchema
  // =========================================================================
  describe("updateOrganizationSchema", () => {
    it("should validate empty update", () => {
      const result = updateOrganizationSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate name only", () => {
      const result = updateOrganizationSchema.safeParse({
        name: "New Studio Name",
      });
      expect(result.success).toBe(true);
    });

    it("should validate settings only", () => {
      const result = updateOrganizationSchema.safeParse({
        settings: {
          margin: 35,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate complete update", () => {
      const result = updateOrganizationSchema.safeParse({
        name: "Updated Studio",
        settings: {
          margin: 40,
          hour_value: 200,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // createTeamMemberSchema
  // =========================================================================
  describe("createTeamMemberSchema", () => {
    it("should validate valid team member", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthly_hours: 160,
      });
      expect(result.success).toBe(true);
    });

    it("should reject full_name too short", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "M",
        role: "architect",
        salary: 8000,
        monthly_hours: 160,
      });
      expect(result.success).toBe(false);
    });

    it("should reject full_name too long", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "M".repeat(101),
        role: "architect",
        salary: 8000,
        monthly_hours: 160,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative salary", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "Maria Silva",
        role: "architect",
        salary: -1000,
        monthly_hours: 160,
      });
      expect(result.success).toBe(false);
    });

    it("should reject monthly_hours too low", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthly_hours: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject monthly_hours too high", () => {
      const result = createTeamMemberSchema.safeParse({
        full_name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthly_hours: 750,
      });
      expect(result.success).toBe(false);
    });

    it("should validate all roles", () => {
      const roles = ["owner", "coordinator", "architect", "intern", "admin"];

      roles.forEach((role) => {
        const result = createTeamMemberSchema.safeParse({
          full_name: "Test User",
          role,
          salary: 5000,
          monthly_hours: 160,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  // =========================================================================
  // updateTeamMemberSchema
  // =========================================================================
  describe("updateTeamMemberSchema", () => {
    it("should validate empty update", () => {
      const result = updateTeamMemberSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate partial update", () => {
      const result = updateTeamMemberSchema.safeParse({
        salary: 9000,
      });
      expect(result.success).toBe(true);
    });

    it("should validate full update", () => {
      const result = updateTeamMemberSchema.safeParse({
        full_name: "Maria Silva Updated",
        role: "coordinator",
        salary: 10000,
        monthly_hours: 180,
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // officeFormSchema
  // =========================================================================
  describe("officeFormSchema", () => {
    it("should validate valid office form", () => {
      const result = officeFormSchema.safeParse({
        name: "Studio Arquitetura",
        size: "small",
        margin: 30,
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing fields", () => {
      const result = officeFormSchema.safeParse({
        name: "Studio",
      });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // teamMemberFormSchema
  // =========================================================================
  describe("teamMemberFormSchema", () => {
    it("should validate valid team member form", () => {
      const result = teamMemberFormSchema.safeParse({
        full_name: "Maria Silva",
        role: "architect",
        salary: 8000,
        monthly_hours: 160,
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // costsFormSchema
  // =========================================================================
  describe("costsFormSchema", () => {
    it("should validate complete costs form", () => {
      const result = costsFormSchema.safeParse({
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
      const result = costsFormSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // servicesFormSchema
  // =========================================================================
  describe("servicesFormSchema", () => {
    it("should validate services form", () => {
      const result = servicesFormSchema.safeParse({
        services: ["decorexpress", "projetexpress"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty services array", () => {
      const result = servicesFormSchema.safeParse({
        services: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("pelo menos um");
      }
    });

    it("should validate all service types", () => {
      const services = ["decorexpress", "projetexpress", "producao", "consultoria"];
      const result = servicesFormSchema.safeParse({ services });
      expect(result.success).toBe(true);
    });
  });
});
