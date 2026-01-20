import { describe, it, expect } from "vitest";
import { calculateItemTotal, recalculateItemsTotal } from "../utils/calculations";
import type { BudgetItem } from "../types";

describe("Budget Calculations Utils", () => {
  // ===========================================================================
  // calculateItemTotal
  // ===========================================================================
  describe("calculateItemTotal", () => {
    it("should calculate basic product * quantity", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 2,
      });
      expect(result).toBe(200);
    });

    it("should add valorInstalacao to total", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 1,
        valorInstalacao: 50,
      });
      expect(result).toBe(150);
    });

    it("should add valorFrete to total", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 1,
        valorFrete: 30,
      });
      expect(result).toBe(130);
    });

    it("should add valorExtras to total", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 1,
        valorExtras: 25,
      });
      expect(result).toBe(125);
    });

    it("should combine all values correctly", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 2,
        valorInstalacao: 50,
        valorFrete: 30,
        valorExtras: 20,
      });
      // (100 * 2) + 50 + 30 + 20 = 300
      expect(result).toBe(300);
    });

    it("should handle decimal quantities", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 2.5,
      });
      expect(result).toBe(250);
    });

    it("should handle zero values", () => {
      const result = calculateItemTotal({
        valorProduto: 0,
        quantidade: 5,
        valorInstalacao: 0,
        valorFrete: 0,
        valorExtras: 0,
      });
      expect(result).toBe(0);
    });

    it("should handle undefined optional values as 0", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 1,
        valorInstalacao: undefined,
        valorFrete: undefined,
        valorExtras: undefined,
      });
      expect(result).toBe(100);
    });

    it("should handle large numbers", () => {
      const result = calculateItemTotal({
        valorProduto: 10000,
        quantidade: 100,
        valorInstalacao: 5000,
        valorFrete: 2000,
        valorExtras: 1000,
      });
      // (10000 * 100) + 5000 + 2000 + 1000 = 1,008,000
      expect(result).toBe(1008000);
    });

    it("should handle fractional currency values", () => {
      const result = calculateItemTotal({
        valorProduto: 99.99,
        quantidade: 3,
        valorInstalacao: 49.50,
        valorFrete: 29.90,
        valorExtras: 10.00,
      });
      // (99.99 * 3) + 49.50 + 29.90 + 10.00 = 389.37
      expect(result).toBeCloseTo(389.37, 2);
    });

    it("should handle quantity of 0", () => {
      const result = calculateItemTotal({
        valorProduto: 100,
        quantidade: 0,
        valorInstalacao: 50,
        valorFrete: 30,
        valorExtras: 20,
      });
      // (100 * 0) + 50 + 30 + 20 = 100
      expect(result).toBe(100);
    });
  });

  // ===========================================================================
  // recalculateItemsTotal
  // ===========================================================================
  describe("recalculateItemsTotal", () => {
    it("should return 0 for empty array", () => {
      const result = recalculateItemsTotal([]);
      expect(result).toBe(0);
    });

    it("should calculate total for single item", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          fornecedor: "Fornecedor A",
          descricao: "Item A",
          quantidade: 1,
          unidade: "un",
          valorProduto: 100,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: 150,
        },
      ];
      const result = recalculateItemsTotal(items);
      expect(result).toBe(150);
    });

    it("should sum multiple items", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          fornecedor: "Fornecedor A",
          descricao: "Item A",
          quantidade: 1,
          unidade: "un",
          valorProduto: 100,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: 100,
        },
        {
          id: "2",
          fornecedor: "Fornecedor B",
          descricao: "Item B",
          quantidade: 2,
          unidade: "un",
          valorProduto: 200,
          valorInstalacao: 50,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: 450,
        },
        {
          id: "3",
          fornecedor: "Fornecedor C",
          descricao: "Item C",
          quantidade: 1,
          unidade: "m²",
          valorProduto: 300,
          valorInstalacao: 0,
          valorFrete: 30,
          valorExtras: 20,
          valorCompleto: 350,
        },
      ];
      const result = recalculateItemsTotal(items);
      // 100 + 450 + 350 = 900
      expect(result).toBe(900);
    });

    it("should correctly sum valorCompleto field", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          fornecedor: "Fornecedor",
          descricao: "Item",
          quantidade: 10,
          unidade: "un",
          valorProduto: 50,
          valorInstalacao: 100,
          valorFrete: 50,
          valorExtras: 25,
          valorCompleto: 675, // This is the pre-calculated total
        },
      ];
      const result = recalculateItemsTotal(items);
      expect(result).toBe(675);
    });

    it("should handle items with zero valorCompleto", () => {
      const items: BudgetItem[] = [
        {
          id: "1",
          fornecedor: "Fornecedor A",
          descricao: "Item A",
          quantidade: 1,
          unidade: "un",
          valorProduto: 0,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: 0,
        },
        {
          id: "2",
          fornecedor: "Fornecedor B",
          descricao: "Item B",
          quantidade: 1,
          unidade: "un",
          valorProduto: 100,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: 100,
        },
      ];
      const result = recalculateItemsTotal(items);
      expect(result).toBe(100);
    });
  });
});
