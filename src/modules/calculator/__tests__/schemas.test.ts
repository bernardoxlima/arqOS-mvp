import { describe, it, expect } from "vitest";
import {
  environmentTypeSchema,
  environmentSizeSchema,
  complexityLevelSchema,
  finishLevelSchema,
  decorComplexitySchema,
  producaoComplexitySchema,
  projectTypeSchema,
  serviceTypeSchema,
  serviceModalitySchema,
  paymentTypeSchema,
  efficiencyRatingSchema,
  environmentConfigSchema,
  decorExpressInputSchema,
  producaoInputSchema,
  projetExpressInputSchema,
  calculatorInputSchema,
  calculationResultSchema,
  environmentDetailSchema,
} from "../schemas";

describe("Calculator Schemas", () => {
  describe("Enum schemas", () => {
    describe("environmentTypeSchema", () => {
      it("should accept valid environment types", () => {
        const types = ["standard", "medium", "high"];
        for (const type of types) {
          expect(environmentTypeSchema.safeParse(type).success).toBe(true);
        }
      });

      it("should reject invalid environment type", () => {
        const result = environmentTypeSchema.safeParse("invalid");
        expect(result.success).toBe(false);
      });
    });

    describe("environmentSizeSchema", () => {
      it("should accept valid sizes (P, M, G)", () => {
        const sizes = ["P", "M", "G"];
        for (const size of sizes) {
          expect(environmentSizeSchema.safeParse(size).success).toBe(true);
        }
      });

      it("should reject invalid size", () => {
        expect(environmentSizeSchema.safeParse("XL").success).toBe(false);
        expect(environmentSizeSchema.safeParse("pequeno").success).toBe(false);
      });
    });

    describe("complexityLevelSchema", () => {
      it("should accept valid complexity levels", () => {
        const levels = ["simples", "padrao", "complexo", "muito_complexo"];
        for (const level of levels) {
          expect(complexityLevelSchema.safeParse(level).success).toBe(true);
        }
      });

      it("should reject invalid complexity", () => {
        expect(complexityLevelSchema.safeParse("extremo").success).toBe(false);
      });
    });

    describe("finishLevelSchema", () => {
      it("should accept valid finish levels", () => {
        const levels = ["economico", "padrao", "alto_padrao", "luxo"];
        for (const level of levels) {
          expect(finishLevelSchema.safeParse(level).success).toBe(true);
        }
      });

      it("should reject invalid finish level", () => {
        expect(finishLevelSchema.safeParse("premium").success).toBe(false);
      });
    });

    describe("decorComplexitySchema", () => {
      it("should accept valid decor complexity (decor1, decor2, decor3)", () => {
        const complexities = ["decor1", "decor2", "decor3"];
        for (const complexity of complexities) {
          expect(decorComplexitySchema.safeParse(complexity).success).toBe(true);
        }
      });

      it("should reject invalid decor complexity", () => {
        expect(decorComplexitySchema.safeParse("decor4").success).toBe(false);
        expect(decorComplexitySchema.safeParse("prod1").success).toBe(false);
      });
    });

    describe("producaoComplexitySchema", () => {
      it("should accept valid producao complexity (prod1, prod3)", () => {
        const complexities = ["prod1", "prod3"];
        for (const complexity of complexities) {
          expect(producaoComplexitySchema.safeParse(complexity).success).toBe(true);
        }
      });

      it("should reject invalid producao complexity", () => {
        expect(producaoComplexitySchema.safeParse("prod2").success).toBe(false);
        expect(producaoComplexitySchema.safeParse("decor1").success).toBe(false);
      });
    });

    describe("projectTypeSchema", () => {
      it("should accept valid project types (novo, reforma)", () => {
        expect(projectTypeSchema.safeParse("novo").success).toBe(true);
        expect(projectTypeSchema.safeParse("reforma").success).toBe(true);
      });

      it("should reject invalid project type", () => {
        expect(projectTypeSchema.safeParse("ampliacao").success).toBe(false);
      });
    });

    describe("serviceTypeSchema", () => {
      it("should accept valid service types", () => {
        const services = ["decorexpress", "producao", "projetexpress"];
        for (const service of services) {
          expect(serviceTypeSchema.safeParse(service).success).toBe(true);
        }
      });

      it("should reject invalid service type", () => {
        expect(serviceTypeSchema.safeParse("consultoria").success).toBe(false);
      });
    });

    describe("serviceModalitySchema", () => {
      it("should accept valid modalities (online, presencial)", () => {
        expect(serviceModalitySchema.safeParse("online").success).toBe(true);
        expect(serviceModalitySchema.safeParse("presencial").success).toBe(true);
      });

      it("should reject invalid modality", () => {
        expect(serviceModalitySchema.safeParse("hibrido").success).toBe(false);
      });
    });

    describe("paymentTypeSchema", () => {
      it("should accept valid payment types", () => {
        const types = ["cash", "installments", "custom"];
        for (const type of types) {
          expect(paymentTypeSchema.safeParse(type).success).toBe(true);
        }
      });

      it("should reject invalid payment type", () => {
        expect(paymentTypeSchema.safeParse("pix").success).toBe(false);
      });
    });

    describe("efficiencyRatingSchema", () => {
      it("should accept valid efficiency ratings", () => {
        const ratings = ["Ótimo", "Bom", "Reajustar"];
        for (const rating of ratings) {
          expect(efficiencyRatingSchema.safeParse(rating).success).toBe(true);
        }
      });

      it("should reject invalid efficiency rating", () => {
        expect(efficiencyRatingSchema.safeParse("Excelente").success).toBe(false);
      });
    });
  });

  describe("environmentConfigSchema", () => {
    it("should validate correct environment config", () => {
      const validConfig = {
        type: "standard",
        size: "M",
        complexity: "decor2",
      };

      const result = environmentConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("should accept producao complexity", () => {
      const validConfig = {
        type: "medium",
        size: "G",
        complexity: "prod1",
      };

      const result = environmentConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("should reject invalid type in config", () => {
      const invalidConfig = {
        type: "invalid",
        size: "M",
        complexity: "decor1",
      };

      const result = environmentConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const incompleteConfig = {
        type: "standard",
      };

      const result = environmentConfigSchema.safeParse(incompleteConfig);
      expect(result.success).toBe(false);
    });
  });

  describe("decorExpressInputSchema", () => {
    const validDecorExpressInput = {
      service: "decorexpress",
      environmentCount: 1,
      complexity: "decor1",
      environmentsConfig: [
        { type: "standard", size: "P", complexity: "decor1" },
      ],
      serviceModality: "online",
      paymentType: "cash",
    };

    it("should validate correct DecorExpress input", () => {
      const result = decorExpressInputSchema.safeParse(validDecorExpressInput);
      expect(result.success).toBe(true);
    });

    it("should validate DecorExpress with all optional fields", () => {
      const fullInput = {
        ...validDecorExpressInput,
        extraEnvironments: 2,
        extraEnvironmentPrice: 1500,
        discountPercentage: 10,
      };

      const result = decorExpressInputSchema.safeParse(fullInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid service type for DecorExpress", () => {
      const invalid = {
        ...validDecorExpressInput,
        service: "producao",
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid environment count (0)", () => {
      const invalid = {
        ...validDecorExpressInput,
        environmentCount: 0,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid environment count (4)", () => {
      const invalid = {
        ...validDecorExpressInput,
        environmentCount: 4,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept environment count 1, 2, or 3", () => {
      for (const count of [1, 2, 3]) {
        const input = {
          ...validDecorExpressInput,
          environmentCount: count,
        };
        const result = decorExpressInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid complexity for DecorExpress", () => {
      const invalid = {
        ...validDecorExpressInput,
        complexity: "prod1",
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject empty environments config", () => {
      const invalid = {
        ...validDecorExpressInput,
        environmentsConfig: [],
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject environments config with more than 3 items", () => {
      const invalid = {
        ...validDecorExpressInput,
        environmentsConfig: [
          { type: "standard", size: "P", complexity: "decor1" },
          { type: "standard", size: "M", complexity: "decor1" },
          { type: "standard", size: "G", complexity: "decor1" },
          { type: "medium", size: "P", complexity: "decor1" },
        ],
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject discount greater than 100%", () => {
      const invalid = {
        ...validDecorExpressInput,
        discountPercentage: 101,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject negative discount", () => {
      const invalid = {
        ...validDecorExpressInput,
        discountPercentage: -5,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept 0% discount", () => {
      const input = {
        ...validDecorExpressInput,
        discountPercentage: 0,
      };

      const result = decorExpressInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept 100% discount", () => {
      const input = {
        ...validDecorExpressInput,
        discountPercentage: 100,
      };

      const result = decorExpressInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject negative extra environments", () => {
      const invalid = {
        ...validDecorExpressInput,
        extraEnvironments: -1,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject negative extra environment price", () => {
      const invalid = {
        ...validDecorExpressInput,
        extraEnvironmentPrice: -100,
      };

      const result = decorExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("producaoInputSchema", () => {
    const validProducaoInput = {
      service: "producao",
      environmentCount: 2,
      complexity: "prod1",
      environmentsConfig: [
        { type: "standard", size: "M", complexity: "prod1" },
        { type: "medium", size: "P", complexity: "prod1" },
      ],
      serviceModality: "presencial",
      paymentType: "installments",
    };

    it("should validate correct Producao input", () => {
      const result = producaoInputSchema.safeParse(validProducaoInput);
      expect(result.success).toBe(true);
    });

    it("should reject decor complexity for Producao", () => {
      const invalid = {
        ...validProducaoInput,
        complexity: "decor2",
      };

      const result = producaoInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept prod3 complexity", () => {
      const input = {
        ...validProducaoInput,
        complexity: "prod3",
      };

      const result = producaoInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("projetExpressInputSchema", () => {
    const validProjetExpressInput = {
      service: "projetexpress",
      projectType: "novo",
      projectArea: 80,
      serviceModality: "online",
      paymentType: "cash",
    };

    it("should validate correct ProjetExpress input", () => {
      const result = projetExpressInputSchema.safeParse(validProjetExpressInput);
      expect(result.success).toBe(true);
    });

    it("should validate ProjetExpress with management fee", () => {
      const fullInput = {
        ...validProjetExpressInput,
        includeManagement: true,
        managementFee: 2000,
        discountPercentage: 5,
      };

      const result = projetExpressInputSchema.safeParse(fullInput);
      expect(result.success).toBe(true);
    });

    it("should reject area below 20m2", () => {
      const invalid = {
        ...validProjetExpressInput,
        projectArea: 19,
      };

      const result = projetExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject area above 300m2", () => {
      const invalid = {
        ...validProjetExpressInput,
        projectArea: 301,
      };

      const result = projetExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept area at minimum boundary (20m2)", () => {
      const input = {
        ...validProjetExpressInput,
        projectArea: 20,
      };

      const result = projetExpressInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept area at maximum boundary (300m2)", () => {
      const input = {
        ...validProjetExpressInput,
        projectArea: 300,
      };

      const result = projetExpressInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid project type", () => {
      const invalid = {
        ...validProjetExpressInput,
        projectType: "ampliacao",
      };

      const result = projetExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept reforma project type", () => {
      const input = {
        ...validProjetExpressInput,
        projectType: "reforma",
      };

      const result = projetExpressInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject negative management fee", () => {
      const invalid = {
        ...validProjetExpressInput,
        includeManagement: true,
        managementFee: -500,
      };

      const result = projetExpressInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("calculatorInputSchema (discriminated union)", () => {
    it("should discriminate DecorExpress by service type", () => {
      const input = {
        service: "decorexpress",
        environmentCount: 1,
        complexity: "decor1",
        environmentsConfig: [
          { type: "standard", size: "P", complexity: "decor1" },
        ],
        serviceModality: "online",
        paymentType: "cash",
      };

      const result = calculatorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.service).toBe("decorexpress");
      }
    });

    it("should discriminate Producao by service type", () => {
      const input = {
        service: "producao",
        environmentCount: 1,
        complexity: "prod1",
        environmentsConfig: [
          { type: "standard", size: "M", complexity: "prod1" },
        ],
        serviceModality: "presencial",
        paymentType: "installments",
      };

      const result = calculatorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.service).toBe("producao");
      }
    });

    it("should discriminate ProjetExpress by service type", () => {
      const input = {
        service: "projetexpress",
        projectType: "novo",
        projectArea: 100,
        serviceModality: "online",
        paymentType: "cash",
      };

      const result = calculatorInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.service).toBe("projetexpress");
      }
    });

    it("should reject unknown service type", () => {
      const input = {
        service: "consultoria",
        projectArea: 100,
      };

      const result = calculatorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject mismatched service and fields", () => {
      // DecorExpress fields with projetexpress service
      const input = {
        service: "projetexpress",
        environmentCount: 1,
        complexity: "decor1",
        environmentsConfig: [
          { type: "standard", size: "P", complexity: "decor1" },
        ],
        serviceModality: "online",
        paymentType: "cash",
      };

      const result = calculatorInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("environmentDetailSchema", () => {
    it("should validate correct environment detail", () => {
      const detail = {
        index: 0,
        type: "standard",
        size: "M",
        typeMultiplier: 1.0,
        sizeMultiplier: 1.1,
        combinedMultiplier: 1.1,
      };

      const result = environmentDetailSchema.safeParse(detail);
      expect(result.success).toBe(true);
    });

    it("should reject negative index", () => {
      const detail = {
        index: -1,
        type: "standard",
        size: "M",
        typeMultiplier: 1.0,
        sizeMultiplier: 1.1,
        combinedMultiplier: 1.1,
      };

      const result = environmentDetailSchema.safeParse(detail);
      expect(result.success).toBe(false);
    });

    it("should reject zero or negative multipliers", () => {
      const detail = {
        index: 0,
        type: "standard",
        size: "M",
        typeMultiplier: 0,
        sizeMultiplier: 1.1,
        combinedMultiplier: 0,
      };

      const result = environmentDetailSchema.safeParse(detail);
      expect(result.success).toBe(false);
    });
  });

  describe("calculationResultSchema", () => {
    it("should validate a complete calculation result", () => {
      const result = {
        basePrice: 1600,
        avgMultiplier: 1.1,
        environmentsDetails: [
          {
            index: 0,
            type: "standard",
            size: "M",
            typeMultiplier: 1.0,
            sizeMultiplier: 1.1,
            combinedMultiplier: 1.1,
          },
        ],
        priceBeforeExtras: 1760,
        extrasTotal: 0,
        extrasHours: 0,
        surveyFeeTotal: 0,
        surveyFeeHours: 0,
        finalPrice: 1760,
        priceWithDiscount: 1584,
        discount: 176,
        estimatedHours: 8,
        hourRate: 198,
        description: "Decoracao Simples",
        efficiency: "Bom",
      };

      const parsed = calculationResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it("should validate a minimal calculation result (ProjetExpress style)", () => {
      const result = {
        basePrice: 12000,
        pricePerM2: 150,
        extrasTotal: 0,
        extrasHours: 0,
        surveyFeeTotal: 0,
        surveyFeeHours: 0,
        managementFeeTotal: 1500,
        managementFeeHours: 8,
        finalPrice: 13500,
        priceWithDiscount: 12150,
        discount: 1350,
        estimatedHours: 128,
        hourRate: 94.92,
        efficiency: "Reajustar",
      };

      const parsed = calculationResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const result = {
        basePrice: -100,
        extrasTotal: 0,
        extrasHours: 0,
        surveyFeeTotal: 0,
        surveyFeeHours: 0,
        finalPrice: 100,
        priceWithDiscount: 90,
        discount: 10,
        estimatedHours: 8,
        hourRate: 11.25,
        efficiency: "Reajustar",
      };

      const parsed = calculationResultSchema.safeParse(result);
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid efficiency rating", () => {
      const result = {
        basePrice: 1600,
        extrasTotal: 0,
        extrasHours: 0,
        surveyFeeTotal: 0,
        surveyFeeHours: 0,
        finalPrice: 1600,
        priceWithDiscount: 1440,
        discount: 160,
        estimatedHours: 8,
        hourRate: 180,
        efficiency: "Excelente",
      };

      const parsed = calculationResultSchema.safeParse(result);
      expect(parsed.success).toBe(false);
    });
  });
});
