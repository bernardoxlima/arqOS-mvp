import { describe, it, expect } from "vitest";
import {
  expenseCategorySchema,
  expenseStatusSchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseFiltersSchema,
  expenseIdSchema,
} from "../schemas";

describe("Finance Schemas", () => {
  // =========================================================================
  // expenseCategorySchema
  // =========================================================================
  describe("expenseCategorySchema", () => {
    it("should validate all expense categories", () => {
      const categories = ["fixo", "variavel", "salario", "imposto"];

      categories.forEach((category) => {
        const result = expenseCategorySchema.safeParse(category);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid category", () => {
      const result = expenseCategorySchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // expenseStatusSchema
  // =========================================================================
  describe("expenseStatusSchema", () => {
    it("should validate all expense statuses", () => {
      const statuses = ["pending", "paid", "overdue"];

      statuses.forEach((status) => {
        const result = expenseStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid status", () => {
      const result = expenseStatusSchema.safeParse("completed");
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // createExpenseSchema
  // =========================================================================
  describe("createExpenseSchema", () => {
    it("should validate minimal valid expense", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Aluguel",
        value: 2500,
      });
      expect(result.success).toBe(true);
    });

    it("should validate expense with all fields", () => {
      const result = createExpenseSchema.safeParse({
        category: "variavel",
        description: "Compra de material",
        value: 500.5,
        date: "2024-01-15",
        due_date: "2024-01-30",
        status: "pending",
      });
      expect(result.success).toBe(true);
    });

    it("should reject description too short", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "A",
        value: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("2 caracteres");
      }
    });

    it("should reject description too long", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "A".repeat(201),
        value: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 caracteres");
      }
    });

    it("should reject zero value", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative value", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: 100,
        date: "15/01/2024",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid due_date format", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: 100,
        due_date: "2024-1-15",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid date formats", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: 100,
        date: "2024-01-15",
        due_date: "2024-02-15",
      });
      expect(result.success).toBe(true);
    });

    it("should reject status 'overdue' on create", () => {
      const result = createExpenseSchema.safeParse({
        category: "fixo",
        description: "Test",
        value: 100,
        status: "overdue",
      });
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // updateExpenseSchema
  // =========================================================================
  describe("updateExpenseSchema", () => {
    it("should validate empty update (no fields)", () => {
      const result = updateExpenseSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate partial update", () => {
      const result = updateExpenseSchema.safeParse({
        value: 300,
        status: "paid",
      });
      expect(result.success).toBe(true);
    });

    it("should validate full update", () => {
      const result = updateExpenseSchema.safeParse({
        category: "salario",
        description: "Updated description",
        value: 5000,
        date: "2024-02-01",
        due_date: "2024-02-28",
        status: "paid",
      });
      expect(result.success).toBe(true);
    });

    it("should accept 'overdue' status on update", () => {
      const result = updateExpenseSchema.safeParse({
        status: "overdue",
      });
      expect(result.success).toBe(true);
    });

    it("should allow null due_date", () => {
      const result = updateExpenseSchema.safeParse({
        due_date: null,
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // expenseFiltersSchema
  // =========================================================================
  describe("expenseFiltersSchema", () => {
    it("should validate empty filters", () => {
      const result = expenseFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate 'all' category filter", () => {
      const result = expenseFiltersSchema.safeParse({
        category: "all",
      });
      expect(result.success).toBe(true);
    });

    it("should validate specific category filter", () => {
      const result = expenseFiltersSchema.safeParse({
        category: "fixo",
      });
      expect(result.success).toBe(true);
    });

    it("should validate 'all' status filter", () => {
      const result = expenseFiltersSchema.safeParse({
        status: "all",
      });
      expect(result.success).toBe(true);
    });

    it("should validate date range filters", () => {
      const result = expenseFiltersSchema.safeParse({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(result.success).toBe(true);
    });

    it("should validate all filters combined", () => {
      const result = expenseFiltersSchema.safeParse({
        category: "variavel",
        status: "pending",
        startDate: "2024-01-01",
        endDate: "2024-06-30",
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // expenseIdSchema
  // =========================================================================
  describe("expenseIdSchema", () => {
    it("should validate valid UUID", () => {
      const result = expenseIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000");
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = expenseIdSchema.safeParse("invalid-id");
      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = expenseIdSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });
});
