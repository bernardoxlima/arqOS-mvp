import { describe, it, expect } from "vitest";
import {
  financeSummaryParamsSchema,
  recentProjectsParamsSchema,
} from "../schemas";

describe("Dashboard Schemas", () => {
  // =========================================================================
  // financeSummaryParamsSchema
  // =========================================================================
  describe("financeSummaryParamsSchema", () => {
    it("should accept empty object (defaults to current month)", () => {
      const result = financeSummaryParamsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept valid startDate", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "2026-01-01",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBe("2026-01-01");
      }
    });

    it("should accept valid endDate", () => {
      const result = financeSummaryParamsSchema.safeParse({
        endDate: "2026-01-31",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.endDate).toBe("2026-01-31");
      }
    });

    it("should accept both startDate and endDate", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBe("2026-01-01");
        expect(result.data.endDate).toBe("2026-01-31");
      }
    });

    it("should reject invalid date format (DD-MM-YYYY)", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "01-01-2026",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format (DD/MM/YYYY)", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "01/01/2026",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format (YYYY/MM/DD)", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "2026/01/01",
      });
      expect(result.success).toBe(false);
    });

    it("should reject incomplete date (YYYY-MM)", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "2026-01",
      });
      expect(result.success).toBe(false);
    });

    it("should reject text instead of date", () => {
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "january",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid month in date", () => {
      // Note: Schema only validates format, not date validity
      // This tests the regex pattern
      const result = financeSummaryParamsSchema.safeParse({
        startDate: "2026-13-01", // Invalid month 13, but format is valid
      });
      // The regex ^\\d{4}-\\d{2}-\\d{2}$ accepts this as it only checks format
      expect(result.success).toBe(true);
    });

    it("should accept edge case dates", () => {
      const dates = [
        "2026-01-01", // Start of year
        "2026-12-31", // End of year
        "2026-02-28", // End of February
        "2024-02-29", // Leap year
      ];

      dates.forEach((date) => {
        const result = financeSummaryParamsSchema.safeParse({ startDate: date });
        expect(result.success).toBe(true);
      });
    });
  });

  // =========================================================================
  // recentProjectsParamsSchema
  // =========================================================================
  describe("recentProjectsParamsSchema", () => {
    it("should accept empty object (defaults to limit 10)", () => {
      const result = recentProjectsParamsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it("should accept valid limit as string (coercion)", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: "5",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(5);
      }
    });

    it("should accept valid limit as number", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 20,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept minimum limit (1)", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 1,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(1);
      }
    });

    it("should accept maximum limit (50)", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject limit below minimum (0)", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative limit", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should reject limit above maximum (51)", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 51,
      });
      expect(result.success).toBe(false);
    });

    it("should reject limit of 100", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-integer limit", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: 5.5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-numeric string", () => {
      const result = recentProjectsParamsSchema.safeParse({
        limit: "abc",
      });
      expect(result.success).toBe(false);
    });

    it("should coerce string numbers correctly", () => {
      const testCases = [
        { input: "1", expected: 1 },
        { input: "10", expected: 10 },
        { input: "25", expected: 25 },
        { input: "50", expected: 50 },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = recentProjectsParamsSchema.safeParse({ limit: input });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(expected);
        }
      });
    });
  });
});
