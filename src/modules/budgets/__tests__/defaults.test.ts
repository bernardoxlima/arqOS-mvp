import { describe, it, expect } from "vitest";
import {
  DEFAULT_CALCULATION,
  DEFAULT_DETAILS,
  DEFAULT_PAYMENT_TERMS,
  DEFAULT_VALIDITY_DAYS,
  PAYMENT_INSTALLMENTS,
  COMPLEXITY_MULTIPLIERS,
  FINISH_MULTIPLIERS,
  EFFICIENCY_THRESHOLDS,
  getEfficiencyRating,
  SERVICE_TYPE_LABELS,
  STATUS_LABELS,
  UNIT_LABELS,
} from "../constants/defaults";

describe("Budget Defaults & Constants", () => {
  // ===========================================================================
  // getEfficiencyRating
  // ===========================================================================
  describe("getEfficiencyRating", () => {
    it("should return 'Ótimo' for hourRate >= 150", () => {
      expect(getEfficiencyRating(150)).toBe("Ótimo");
      expect(getEfficiencyRating(200)).toBe("Ótimo");
      expect(getEfficiencyRating(1000)).toBe("Ótimo");
    });

    it("should return 'Bom' for hourRate >= 100 and < 150", () => {
      expect(getEfficiencyRating(100)).toBe("Bom");
      expect(getEfficiencyRating(125)).toBe("Bom");
      expect(getEfficiencyRating(149)).toBe("Bom");
      expect(getEfficiencyRating(149.99)).toBe("Bom");
    });

    it("should return 'Reajustar' for hourRate < 100", () => {
      expect(getEfficiencyRating(99)).toBe("Reajustar");
      expect(getEfficiencyRating(50)).toBe("Reajustar");
      expect(getEfficiencyRating(0)).toBe("Reajustar");
      expect(getEfficiencyRating(99.99)).toBe("Reajustar");
    });

    it("should handle boundary value 150 as 'Ótimo'", () => {
      expect(getEfficiencyRating(150)).toBe("Ótimo");
    });

    it("should handle boundary value 100 as 'Bom'", () => {
      expect(getEfficiencyRating(100)).toBe("Bom");
    });

    it("should handle negative values as 'Reajustar'", () => {
      expect(getEfficiencyRating(-50)).toBe("Reajustar");
    });
  });

  // ===========================================================================
  // DEFAULT_CALCULATION
  // ===========================================================================
  describe("DEFAULT_CALCULATION", () => {
    it("should have all required fields", () => {
      expect(DEFAULT_CALCULATION).toHaveProperty("base_price");
      expect(DEFAULT_CALCULATION).toHaveProperty("multipliers");
      expect(DEFAULT_CALCULATION).toHaveProperty("extras_total");
      expect(DEFAULT_CALCULATION).toHaveProperty("survey_fee");
      expect(DEFAULT_CALCULATION).toHaveProperty("discount");
      expect(DEFAULT_CALCULATION).toHaveProperty("final_price");
      expect(DEFAULT_CALCULATION).toHaveProperty("estimated_hours");
      expect(DEFAULT_CALCULATION).toHaveProperty("hour_rate");
      expect(DEFAULT_CALCULATION).toHaveProperty("efficiency");
      expect(DEFAULT_CALCULATION).toHaveProperty("price_per_m2");
      expect(DEFAULT_CALCULATION).toHaveProperty("items_total");
    });

    it("should have zero values for numeric fields", () => {
      expect(DEFAULT_CALCULATION.base_price).toBe(0);
      expect(DEFAULT_CALCULATION.extras_total).toBe(0);
      expect(DEFAULT_CALCULATION.survey_fee).toBe(0);
      expect(DEFAULT_CALCULATION.discount).toBe(0);
      expect(DEFAULT_CALCULATION.final_price).toBe(0);
      expect(DEFAULT_CALCULATION.estimated_hours).toBe(0);
      expect(DEFAULT_CALCULATION.hour_rate).toBe(0);
      expect(DEFAULT_CALCULATION.price_per_m2).toBe(0);
      expect(DEFAULT_CALCULATION.items_total).toBe(0);
    });

    it("should have multipliers with default 1.0 values", () => {
      expect(DEFAULT_CALCULATION.multipliers).toEqual({
        complexity: 1.0,
        finish: 1.0,
      });
    });

    it("should have efficiency as null", () => {
      expect(DEFAULT_CALCULATION.efficiency).toBeNull();
    });
  });

  // ===========================================================================
  // DEFAULT_DETAILS
  // ===========================================================================
  describe("DEFAULT_DETAILS", () => {
    it("should have all required fields", () => {
      expect(DEFAULT_DETAILS).toHaveProperty("area");
      expect(DEFAULT_DETAILS).toHaveProperty("rooms");
      expect(DEFAULT_DETAILS).toHaveProperty("room_list");
      expect(DEFAULT_DETAILS).toHaveProperty("complexity");
      expect(DEFAULT_DETAILS).toHaveProperty("finish");
      expect(DEFAULT_DETAILS).toHaveProperty("modality");
      expect(DEFAULT_DETAILS).toHaveProperty("project_type");
      expect(DEFAULT_DETAILS).toHaveProperty("items");
    });

    it("should have correct default values", () => {
      expect(DEFAULT_DETAILS.area).toBe(0);
      expect(DEFAULT_DETAILS.rooms).toBe(0);
      expect(DEFAULT_DETAILS.room_list).toEqual([]);
      expect(DEFAULT_DETAILS.complexity).toBe("padrao");
      expect(DEFAULT_DETAILS.finish).toBe("padrao");
      expect(DEFAULT_DETAILS.modality).toBe("presencial");
      expect(DEFAULT_DETAILS.project_type).toBe("novo");
      expect(DEFAULT_DETAILS.items).toEqual([]);
    });
  });

  // ===========================================================================
  // DEFAULT_PAYMENT_TERMS
  // ===========================================================================
  describe("DEFAULT_PAYMENT_TERMS", () => {
    it("should have correct structure", () => {
      expect(DEFAULT_PAYMENT_TERMS).toHaveProperty("type");
      expect(DEFAULT_PAYMENT_TERMS).toHaveProperty("installments");
      expect(DEFAULT_PAYMENT_TERMS).toHaveProperty("validity_days");
    });

    it("should use 30_30_40 payment type", () => {
      expect(DEFAULT_PAYMENT_TERMS.type).toBe("30_30_40");
    });

    it("should have correct installments", () => {
      expect(DEFAULT_PAYMENT_TERMS.installments).toHaveLength(3);
      expect(DEFAULT_PAYMENT_TERMS.installments[0].percent).toBe(30);
      expect(DEFAULT_PAYMENT_TERMS.installments[1].percent).toBe(30);
      expect(DEFAULT_PAYMENT_TERMS.installments[2].percent).toBe(40);
    });

    it("should have default validity days", () => {
      expect(DEFAULT_PAYMENT_TERMS.validity_days).toBe(DEFAULT_VALIDITY_DAYS);
    });
  });

  // ===========================================================================
  // PAYMENT_INSTALLMENTS
  // ===========================================================================
  describe("PAYMENT_INSTALLMENTS", () => {
    it("should have cash option summing to 100%", () => {
      const total = PAYMENT_INSTALLMENTS.cash.reduce((sum, i) => sum + i.percent, 0);
      expect(total).toBe(100);
    });

    it("should have 30_30_40 option summing to 100%", () => {
      const total = PAYMENT_INSTALLMENTS["30_30_40"].reduce((sum, i) => sum + i.percent, 0);
      expect(total).toBe(100);
    });

    it("should have 50_50 option summing to 100%", () => {
      const total = PAYMENT_INSTALLMENTS["50_50"].reduce((sum, i) => sum + i.percent, 0);
      expect(total).toBe(100);
    });

    it("should have custom option as empty array", () => {
      expect(PAYMENT_INSTALLMENTS.custom).toEqual([]);
    });

    it("should have descriptions for all installments", () => {
      Object.entries(PAYMENT_INSTALLMENTS).forEach(([key, installments]) => {
        if (key !== "custom") {
          installments.forEach((installment) => {
            expect(installment.description).toBeDefined();
            expect(installment.description.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  // ===========================================================================
  // COMPLEXITY_MULTIPLIERS
  // ===========================================================================
  describe("COMPLEXITY_MULTIPLIERS", () => {
    it("should have all complexity levels", () => {
      expect(COMPLEXITY_MULTIPLIERS).toHaveProperty("simples");
      expect(COMPLEXITY_MULTIPLIERS).toHaveProperty("padrao");
      expect(COMPLEXITY_MULTIPLIERS).toHaveProperty("complexo");
    });

    it("should have correct multiplier values", () => {
      expect(COMPLEXITY_MULTIPLIERS.simples).toBe(0.8);
      expect(COMPLEXITY_MULTIPLIERS.padrao).toBe(1.0);
      expect(COMPLEXITY_MULTIPLIERS.complexo).toBe(1.5);
    });

    it("should have simples < padrao < complexo", () => {
      expect(COMPLEXITY_MULTIPLIERS.simples).toBeLessThan(COMPLEXITY_MULTIPLIERS.padrao);
      expect(COMPLEXITY_MULTIPLIERS.padrao).toBeLessThan(COMPLEXITY_MULTIPLIERS.complexo);
    });
  });

  // ===========================================================================
  // FINISH_MULTIPLIERS
  // ===========================================================================
  describe("FINISH_MULTIPLIERS", () => {
    it("should have all finish levels", () => {
      expect(FINISH_MULTIPLIERS).toHaveProperty("simples");
      expect(FINISH_MULTIPLIERS).toHaveProperty("padrao");
      expect(FINISH_MULTIPLIERS).toHaveProperty("alto_padrao");
    });

    it("should have correct multiplier values", () => {
      expect(FINISH_MULTIPLIERS.simples).toBe(0.9);
      expect(FINISH_MULTIPLIERS.padrao).toBe(1.0);
      expect(FINISH_MULTIPLIERS.alto_padrao).toBe(1.4);
    });

    it("should have simples < padrao < alto_padrao", () => {
      expect(FINISH_MULTIPLIERS.simples).toBeLessThan(FINISH_MULTIPLIERS.padrao);
      expect(FINISH_MULTIPLIERS.padrao).toBeLessThan(FINISH_MULTIPLIERS.alto_padrao);
    });
  });

  // ===========================================================================
  // EFFICIENCY_THRESHOLDS
  // ===========================================================================
  describe("EFFICIENCY_THRESHOLDS", () => {
    it("should have optimal_min threshold", () => {
      expect(EFFICIENCY_THRESHOLDS.optimal_min).toBe(150);
    });

    it("should have good_min threshold", () => {
      expect(EFFICIENCY_THRESHOLDS.good_min).toBe(100);
    });

    it("should have good_min < optimal_min", () => {
      expect(EFFICIENCY_THRESHOLDS.good_min).toBeLessThan(EFFICIENCY_THRESHOLDS.optimal_min);
    });
  });

  // ===========================================================================
  // SERVICE_TYPE_LABELS
  // ===========================================================================
  describe("SERVICE_TYPE_LABELS", () => {
    it("should have labels for all service types", () => {
      const expectedTypes = [
        "arquitetonico",
        "interiores",
        "decoracao",
        "reforma",
        "comercial",
        "decorexpress",
        "producao",
        "projetexpress",
      ];

      expectedTypes.forEach((type) => {
        expect(SERVICE_TYPE_LABELS).toHaveProperty(type);
        expect(typeof SERVICE_TYPE_LABELS[type]).toBe("string");
      });
    });
  });

  // ===========================================================================
  // STATUS_LABELS
  // ===========================================================================
  describe("STATUS_LABELS", () => {
    it("should have labels for all statuses", () => {
      expect(STATUS_LABELS.draft).toBe("Rascunho");
      expect(STATUS_LABELS.sent).toBe("Enviado");
      expect(STATUS_LABELS.approved).toBe("Aprovado");
      expect(STATUS_LABELS.rejected).toBe("Rejeitado");
    });
  });

  // ===========================================================================
  // UNIT_LABELS
  // ===========================================================================
  describe("UNIT_LABELS", () => {
    it("should have labels for common units", () => {
      expect(UNIT_LABELS["Qt."]).toBe("Quantidade");
      expect(UNIT_LABELS["m²"]).toBe("Metro quadrado");
      expect(UNIT_LABELS["m"]).toBe("Metro linear");
      expect(UNIT_LABELS["un"]).toBe("Unidade");
    });
  });
});
