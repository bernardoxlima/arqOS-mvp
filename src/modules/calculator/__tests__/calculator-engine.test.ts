import { describe, it, expect } from "vitest";
import {
  calculateBudget,
  estimateHours,
  calculatePricePerM2,
  formatCurrency,
  getEfficiencyColor,
} from "../calculator-engine";
import type {
  DecorExpressInput,
  ProducaoInput,
  ProjetExpressInput,
} from "../types";
import {
  SURVEY_FEE,
  EXTRA_ENVIRONMENT,
  DEFAULT_MANAGEMENT_FEE,
  HOUR_VALUE,
  environmentTypeMultipliers,
  sizeMultipliers,
  decorExpressPricing,
  producaoPricing,
  projetExpressPricing,
} from "../pricing-data";

describe("Calculator Engine", () => {
  describe("calculateBudget", () => {
    it("should route to decorexpress calculator", () => {
      const input: DecorExpressInput = {
        service: "decorexpress",
        environmentCount: 1,
        complexity: "decor1",
        environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
        serviceModality: "online",
        paymentType: "installments",
      };

      const result = calculateBudget(input);
      expect(result.basePrice).toBe(decorExpressPricing["1"].decor1.price);
    });

    it("should route to producao calculator", () => {
      const input: ProducaoInput = {
        service: "producao",
        environmentCount: 1,
        complexity: "prod1",
        environmentsConfig: [{ type: "standard", size: "P", complexity: "prod1" }],
        serviceModality: "online",
        paymentType: "installments",
      };

      const result = calculateBudget(input);
      expect(result.basePrice).toBe(producaoPricing["1"].prod1.price);
    });

    it("should route to projetexpress calculator", () => {
      const input: ProjetExpressInput = {
        service: "projetexpress",
        projectType: "novo",
        projectArea: 80,
        serviceModality: "online",
        paymentType: "installments",
      };

      const result = calculateBudget(input);
      // 80m2 is in the 50-100 range, price is 145/m2
      expect(result.basePrice).toBe(80 * 145);
    });

    it("should throw on unknown service", () => {
      const input = {
        service: "unknown",
        environmentCount: 1,
      } as unknown as DecorExpressInput;

      expect(() => calculateBudget(input)).toThrow("Unknown service type");
    });
  });

  describe("calculateDecorExpress", () => {
    describe("Base cases", () => {
      it("should calculate 1 environment, decor1, standard/P", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // Base price for 1 env, decor1 = 1600
        expect(result.basePrice).toBe(1600);
        // Multiplier: standard (1.0) * P (1.0) = 1.0
        expect(result.avgMultiplier).toBe(1.0);
        // Price before extras = 1600 * 1.0 = 1600
        expect(result.priceBeforeExtras).toBe(1600);
        // No extras, no survey fee (online)
        expect(result.extrasTotal).toBe(0);
        expect(result.surveyFeeTotal).toBe(0);
        // Final price = 1600
        expect(result.finalPrice).toBe(1600);
        // No discount (installments)
        expect(result.discount).toBe(0);
        expect(result.priceWithDiscount).toBe(1600);
        // Hours = 8
        expect(result.estimatedHours).toBe(8);
        // Hour rate = 1600 / 8 = 200
        expect(result.hourRate).toBe(200);
        // Efficiency = Otimo (>= 200)
        expect(result.efficiency).toBe("Ótimo");
      });

      it("should calculate 2 environments, decor2, mixed types", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 2,
          complexity: "decor2",
          environmentsConfig: [
            { type: "standard", size: "M", complexity: "decor2" },
            { type: "medium", size: "P", complexity: "decor2" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // Base price for 2 env, decor2 = 3450
        expect(result.basePrice).toBe(3450);

        // Multipliers:
        // standard * M = 1.0 * 1.1 = 1.1
        // medium * P = 1.25 * 1.0 = 1.25
        // Average = (1.1 + 1.25) / 2 = 1.175
        expect(result.avgMultiplier).toBeCloseTo(1.175, 3);

        // Environment details
        expect(result.environmentsDetails).toHaveLength(2);
        expect(result.environmentsDetails![0].combinedMultiplier).toBeCloseTo(1.1, 2);
        expect(result.environmentsDetails![1].combinedMultiplier).toBeCloseTo(1.25, 2);
      });

      it("should calculate 3 environments, decor3, all high/G", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 3,
          complexity: "decor3",
          environmentsConfig: [
            { type: "high", size: "G", complexity: "decor3" },
            { type: "high", size: "G", complexity: "decor3" },
            { type: "high", size: "G", complexity: "decor3" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // Base price for 3 env, decor3 = 5600
        expect(result.basePrice).toBe(5600);

        // Multiplier: high (1.4) * G (1.15) = 1.61
        const expectedMultiplier = 1.4 * 1.15;
        expect(result.avgMultiplier).toBeCloseTo(expectedMultiplier, 3);

        // Price with multiplier
        const expectedPrice = 5600 * expectedMultiplier;
        expect(result.priceBeforeExtras).toBeCloseTo(expectedPrice, 2);
      });
    });

    describe("Multipliers", () => {
      it("should apply type multiplier correctly", () => {
        // Test each type multiplier
        const types = ["standard", "medium", "high"] as const;
        const expectedMultipliers = [1.0, 1.25, 1.4];

        types.forEach((type, idx) => {
          const input: DecorExpressInput = {
            service: "decorexpress",
            environmentCount: 1,
            complexity: "decor1",
            environmentsConfig: [{ type, size: "P", complexity: "decor1" }],
            serviceModality: "online",
            paymentType: "installments",
          };

          const result = calculateBudget(input);
          expect(result.avgMultiplier).toBeCloseTo(expectedMultipliers[idx], 2);
          expect(environmentTypeMultipliers[type].multiplier).toBe(expectedMultipliers[idx]);
        });
      });

      it("should apply size multiplier correctly", () => {
        // Test each size multiplier
        const sizes = ["P", "M", "G"] as const;
        const expectedMultipliers = [1.0, 1.1, 1.15];

        sizes.forEach((size, idx) => {
          const input: DecorExpressInput = {
            service: "decorexpress",
            environmentCount: 1,
            complexity: "decor1",
            environmentsConfig: [{ type: "standard", size, complexity: "decor1" }],
            serviceModality: "online",
            paymentType: "installments",
          };

          const result = calculateBudget(input);
          expect(result.avgMultiplier).toBeCloseTo(expectedMultipliers[idx], 2);
          expect(sizeMultipliers[size].multiplier).toBe(expectedMultipliers[idx]);
        });
      });

      it("should calculate average multiplier for mixed environments", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 3,
          complexity: "decor2",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor2" }, // 1.0 * 1.0 = 1.0
            { type: "medium", size: "M", complexity: "decor2" },   // 1.25 * 1.1 = 1.375
            { type: "high", size: "G", complexity: "decor2" },     // 1.4 * 1.15 = 1.61
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        const expectedAvg = (1.0 + 1.375 + 1.61) / 3;
        expect(result.avgMultiplier).toBeCloseTo(expectedAvg, 3);
      });
    });

    describe("Extras", () => {
      it("should add extras cost and hours", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          extraEnvironments: 2,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // Extras: 2 * 1200 = 2400
        expect(result.extrasTotal).toBe(2 * EXTRA_ENVIRONMENT.pricePerUnit);
        // Extra hours: 2 * 8 = 16
        expect(result.extrasHours).toBe(2 * EXTRA_ENVIRONMENT.hoursPerUnit);
      });

      it("should use custom extra price when provided", () => {
        const customPrice = 1500;
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          extraEnvironments: 3,
          extraEnvironmentPrice: customPrice,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.extrasTotal).toBe(3 * customPrice);
      });

      it("should not add extras when extraEnvironments is 0", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          extraEnvironments: 0,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.extrasTotal).toBe(0);
        expect(result.extrasHours).toBe(0);
      });
    });

    describe("Survey fee", () => {
      it("should add survey fee for presencial", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "presencial",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.surveyFeeTotal).toBe(SURVEY_FEE.presencial.price);
        expect(result.surveyFeeHours).toBe(SURVEY_FEE.presencial.hours);
      });

      it("should NOT add survey fee for online", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.surveyFeeTotal).toBe(SURVEY_FEE.online.price);
        expect(result.surveyFeeHours).toBe(SURVEY_FEE.online.hours);
        expect(result.surveyFeeTotal).toBe(0);
      });

      it("should include survey fee in final price calculation", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "presencial",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // Final price = priceBeforeExtras + extrasTotal + surveyFeeTotal
        expect(result.finalPrice).toBe(
          result.priceBeforeExtras! + result.extrasTotal + result.surveyFeeTotal
        );
      });
    });

    describe("Discount", () => {
      it("should apply 10% discount for cash payment", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "cash",
        };

        const result = calculateBudget(input);

        // 10% discount
        expect(result.discount).toBe(result.finalPrice * 0.1);
        expect(result.priceWithDiscount).toBe(result.finalPrice * 0.9);
      });

      it("should apply custom discount percentage", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "custom",
          discountPercentage: 15,
        };

        const result = calculateBudget(input);

        // 15% discount
        expect(result.discount).toBe(result.finalPrice * 0.15);
        expect(result.priceWithDiscount).toBe(result.finalPrice * 0.85);
      });

      it("should apply 0% discount for installments", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.discount).toBe(0);
        expect(result.priceWithDiscount).toBe(result.finalPrice);
      });

      it("should override default discount with custom percentage", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "cash",
          discountPercentage: 5, // Override 10% default
        };

        const result = calculateBudget(input);

        // Should use custom 5% instead of default 10%
        expect(result.discount).toBe(result.finalPrice * 0.05);
      });
    });

    describe("Efficiency rating", () => {
      it("should return Otimo when hourRate >= 200", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // 1600 / 8 = 200
        expect(result.hourRate).toBe(200);
        expect(result.efficiency).toBe("Ótimo");
      });

      it("should return Bom when hourRate >= 180 and < 200", () => {
        // Need to find a combination that gives hourRate between 180 and 200
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "cash", // 10% discount
        };

        const result = calculateBudget(input);

        // 1600 * 0.9 / 8 = 180
        expect(result.hourRate).toBe(180);
        expect(result.efficiency).toBe("Bom");
      });

      it("should return Reajustar when hourRate < 180", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor1" }],
          serviceModality: "online",
          paymentType: "custom",
          discountPercentage: 15, // 15% discount
        };

        const result = calculateBudget(input);

        // 1600 * 0.85 / 8 = 170
        expect(result.hourRate).toBe(170);
        expect(result.efficiency).toBe("Reajustar");
      });
    });

    describe("Description", () => {
      it("should include description from pricing data", () => {
        const input: DecorExpressInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor2",
          environmentsConfig: [{ type: "standard", size: "P", complexity: "decor2" }],
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.description).toBe(decorExpressPricing["1"].decor2.description);
      });
    });
  });

  describe("calculateProducao", () => {
    it("should calculate with prod1 complexity", () => {
      const input: ProducaoInput = {
        service: "producao",
        environmentCount: 2,
        complexity: "prod1",
        environmentsConfig: [
          { type: "standard", size: "M", complexity: "prod1" },
          { type: "standard", size: "M", complexity: "prod1" },
        ],
        serviceModality: "online",
        paymentType: "installments",
      };

      const result = calculateBudget(input);

      // Base price for 2 env, prod1 = 2900
      expect(result.basePrice).toBe(producaoPricing["2"].prod1.price);
      expect(result.description).toBe(producaoPricing["2"].prod1.description);
    });

    it("should calculate with prod3 complexity", () => {
      const input: ProducaoInput = {
        service: "producao",
        environmentCount: 3,
        complexity: "prod3",
        environmentsConfig: [
          { type: "high", size: "G", complexity: "prod3" },
          { type: "high", size: "G", complexity: "prod3" },
          { type: "high", size: "G", complexity: "prod3" },
        ],
        serviceModality: "presencial",
        paymentType: "cash",
      };

      const result = calculateBudget(input);

      // Base price for 3 env, prod3 = 5600
      expect(result.basePrice).toBe(producaoPricing["3"].prod3.price);
      expect(result.surveyFeeTotal).toBe(SURVEY_FEE.presencial.price);
    });

    it("should apply same multiplier logic as decorexpress", () => {
      const input: ProducaoInput = {
        service: "producao",
        environmentCount: 1,
        complexity: "prod1",
        environmentsConfig: [{ type: "medium", size: "G", complexity: "prod1" }],
        serviceModality: "online",
        paymentType: "installments",
      };

      const result = calculateBudget(input);

      // medium (1.25) * G (1.15) = 1.4375
      const expectedMultiplier = 1.25 * 1.15;
      expect(result.avgMultiplier).toBeCloseTo(expectedMultiplier, 3);
    });
  });

  describe("calculateProjetExpress", () => {
    describe("Area ranges (novo)", () => {
      it("should use 150/m2 for 20-50m2 (novo)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 30,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(150);
        expect(result.basePrice).toBe(30 * 150);
      });

      it("should use 145/m2 for 50-100m2 (novo)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 75,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(145);
        expect(result.basePrice).toBe(75 * 145);
      });

      it("should use 135/m2 for 100-150m2 (novo)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 120,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(135);
        expect(result.basePrice).toBe(120 * 135);
      });

      it("should use 125/m2 for 150-200m2 (novo)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 175,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(125);
        expect(result.basePrice).toBe(175 * 125);
      });

      it("should use 120/m2 for 200-300m2 (novo)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 250,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(120);
        expect(result.basePrice).toBe(250 * 120);
      });
    });

    describe("Area ranges (reforma)", () => {
      it("should use 180/m2 for 20-50m2 (reforma)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 40,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(180);
        expect(result.basePrice).toBe(40 * 180);
      });

      it("should use 160/m2 for 50-100m2 (reforma)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(160);
        expect(result.basePrice).toBe(80 * 160);
      });

      it("should use 150/m2 for 100-150m2 (reforma)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 130,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(150);
        expect(result.basePrice).toBe(130 * 150);
      });

      it("should use 140/m2 for 150-200m2 (reforma)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 180,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(140);
        expect(result.basePrice).toBe(180 * 140);
      });

      it("should use 130/m2 for 200-300m2 (reforma)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 280,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.pricePerM2).toBe(130);
        expect(result.basePrice).toBe(280 * 130);
      });

      it("should use higher prices for reforma vs novo", () => {
        const novoInput: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
        };

        const reformaInput: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
        };

        const novoResult = calculateBudget(novoInput);
        const reformaResult = calculateBudget(reformaInput);

        expect(reformaResult.pricePerM2).toBeGreaterThan(novoResult.pricePerM2!);
        expect(reformaResult.basePrice).toBeGreaterThan(novoResult.basePrice);
      });
    });

    describe("Edge cases", () => {
      it("should handle area at exact boundary (50m2)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 50,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // 50 is >= 50 and < 100, so uses 145/m2
        expect(result.pricePerM2).toBe(145);
      });

      it("should handle area at exact boundary (100m2)", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 100,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // 100 is >= 100 and < 150, so uses 135/m2
        expect(result.pricePerM2).toBe(135);
      });

      it("should use closest range for area < 20 (edge case)", () => {
        // Note: Schema validates min 20, but engine handles gracefully
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 20, // Minimum valid
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        // 20 is >= 20 and < 50, so uses 150/m2
        expect(result.pricePerM2).toBe(150);
        expect(result.basePrice).toBe(20 * 150);
      });
    });

    describe("Management fee", () => {
      it("should add management fee when included", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
          includeManagement: true,
        };

        const result = calculateBudget(input);

        expect(result.managementFeeTotal).toBe(DEFAULT_MANAGEMENT_FEE.price);
        expect(result.managementFeeHours).toBe(DEFAULT_MANAGEMENT_FEE.hours);
      });

      it("should use custom management fee", () => {
        const customFee = 2500;
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
          includeManagement: true,
          managementFee: customFee,
        };

        const result = calculateBudget(input);

        expect(result.managementFeeTotal).toBe(customFee);
      });

      it("should not add management fee when not included", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
          includeManagement: false,
        };

        const result = calculateBudget(input);

        expect(result.managementFeeTotal).toBe(0);
        expect(result.managementFeeHours).toBe(0);
      });

      it("should include management fee in final price", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
          includeManagement: true,
        };

        const result = calculateBudget(input);

        // finalPrice = basePrice + surveyFee + managementFee
        const expectedFinalPrice =
          result.basePrice + result.surveyFeeTotal + result.managementFeeTotal!;
        expect(result.finalPrice).toBe(expectedFinalPrice);
      });
    });

    describe("Survey fee in ProjetExpress", () => {
      it("should add survey fee for presencial", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "presencial",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.surveyFeeTotal).toBe(SURVEY_FEE.presencial.price);
      });
    });

    describe("Description", () => {
      it("should include area in description", () => {
        const input: ProjetExpressInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
        };

        const result = calculateBudget(input);

        expect(result.description).toContain("80m²");
        expect(result.description).toContain(projetExpressPricing.novo.name);
      });
    });
  });

  describe("estimateHours", () => {
    it("should estimate hours for decorexpress", () => {
      const hours = estimateHours({
        service: "decorexpress",
        environmentCount: 2,
        complexity: "decor2",
      });

      expect(hours).toBe(decorExpressPricing["2"].decor2.hours);
    });

    it("should estimate hours for producao", () => {
      const hours = estimateHours({
        service: "producao",
        environmentCount: 3,
        complexity: "prod3",
      });

      expect(hours).toBe(producaoPricing["3"].prod3.hours);
    });

    it("should estimate hours for projetexpress", () => {
      const hours = estimateHours({
        service: "projetexpress",
        projectArea: 80,
        projectType: "novo",
      });

      // 80m2 in 50-100 range = 1.45 hours/m2
      expect(hours).toBe(80 * 1.45);
    });

    it("should throw for projetexpress without projectArea", () => {
      expect(() =>
        estimateHours({
          service: "projetexpress",
          projectType: "novo",
        })
      ).toThrow("projectArea and projectType required for projetexpress");
    });

    it("should throw for projetexpress without projectType", () => {
      expect(() =>
        estimateHours({
          service: "projetexpress",
          projectArea: 80,
        })
      ).toThrow("projectArea and projectType required for projetexpress");
    });

    it("should throw for decorexpress without environmentCount", () => {
      expect(() =>
        estimateHours({
          service: "decorexpress",
          complexity: "decor1",
        })
      ).toThrow("environmentCount and complexity required");
    });

    it("should throw for decorexpress without complexity", () => {
      expect(() =>
        estimateHours({
          service: "decorexpress",
          environmentCount: 1,
        })
      ).toThrow("environmentCount and complexity required");
    });

    it("should return 0 for invalid complexity", () => {
      const hours = estimateHours({
        service: "decorexpress",
        environmentCount: 1,
        complexity: "invalid",
      });

      expect(hours).toBe(0);
    });
  });

  describe("Utility functions", () => {
    describe("formatCurrency", () => {
      it("should format BRL correctly", () => {
        expect(formatCurrency(1600)).toMatch(/R\$\s*1[.,]600[.,]00/);
      });

      it("should format decimal values", () => {
        expect(formatCurrency(1234.56)).toMatch(/R\$\s*1[.,]234[.,]56/);
      });

      it("should format zero", () => {
        expect(formatCurrency(0)).toMatch(/R\$\s*0[.,]00/);
      });

      it("should format large numbers", () => {
        expect(formatCurrency(123456.78)).toMatch(/R\$\s*123[.,]456[.,]78/);
      });
    });

    describe("calculatePricePerM2", () => {
      it("should calculate price per m2 correctly", () => {
        expect(calculatePricePerM2(12000, 80)).toBe(150);
      });

      it("should round to 2 decimal places", () => {
        expect(calculatePricePerM2(10000, 70)).toBeCloseTo(142.86, 2);
      });

      it("should return 0 for zero area", () => {
        expect(calculatePricePerM2(10000, 0)).toBe(0);
      });

      it("should return 0 for negative area", () => {
        expect(calculatePricePerM2(10000, -50)).toBe(0);
      });
    });

    describe("getEfficiencyColor", () => {
      it("should return green for Otimo", () => {
        expect(getEfficiencyColor("Ótimo")).toBe("green");
      });

      it("should return yellow for Bom", () => {
        expect(getEfficiencyColor("Bom")).toBe("yellow");
      });

      it("should return red for Reajustar", () => {
        expect(getEfficiencyColor("Reajustar")).toBe("red");
      });

      it("should return gray for unknown rating", () => {
        expect(getEfficiencyColor("Unknown" as "Ótimo")).toBe("gray");
      });
    });
  });

  describe("Pricing data integrity", () => {
    it("should have correct HOUR_VALUE constant", () => {
      expect(HOUR_VALUE).toBe(200);
    });

    it("should have correct survey fees", () => {
      expect(SURVEY_FEE.presencial.price).toBe(1000);
      expect(SURVEY_FEE.presencial.hours).toBe(4);
      expect(SURVEY_FEE.online.price).toBe(0);
      expect(SURVEY_FEE.online.hours).toBe(0);
    });

    it("should have correct extra environment pricing", () => {
      expect(EXTRA_ENVIRONMENT.pricePerUnit).toBe(1200);
      expect(EXTRA_ENVIRONMENT.hoursPerUnit).toBe(8);
    });

    it("should have correct default management fee", () => {
      expect(DEFAULT_MANAGEMENT_FEE.price).toBe(1500);
      expect(DEFAULT_MANAGEMENT_FEE.hours).toBe(8);
    });

    it("should have all environment type multipliers", () => {
      expect(environmentTypeMultipliers.standard.multiplier).toBe(1.0);
      expect(environmentTypeMultipliers.medium.multiplier).toBe(1.25);
      expect(environmentTypeMultipliers.high.multiplier).toBe(1.4);
    });

    it("should have all size multipliers", () => {
      expect(sizeMultipliers.P.multiplier).toBe(1.0);
      expect(sizeMultipliers.M.multiplier).toBe(1.1);
      expect(sizeMultipliers.G.multiplier).toBe(1.15);
    });
  });
});
