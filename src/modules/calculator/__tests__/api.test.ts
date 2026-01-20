import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock the module imports
vi.mock("@/modules/calculator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/calculator")>();
  return {
    ...actual,
  };
});

// Import after mocking
import { POST } from "@/app/api/calculator/calculate/route";
import { GET } from "@/app/api/calculator/config/route";

describe("Calculator API", () => {
  describe("POST /api/calculator/calculate", () => {
    const createRequest = (body: unknown) => {
      return new NextRequest("http://localhost:3000/api/calculator/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    };

    describe("DecorExpress calculations", () => {
      it("should return calculated result for valid DecorExpress input", async () => {
        const validInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor1" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(validInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.input.service).toBe("decorexpress");
        expect(data.data.result.basePrice).toBe(1600);
        expect(data.data.result.efficiency).toBeDefined();
        expect(data.data.timestamp).toBeDefined();
      });

      it("should calculate with extras and discount", async () => {
        const input = {
          service: "decorexpress",
          environmentCount: 2,
          complexity: "decor2",
          environmentsConfig: [
            { type: "standard", size: "M", complexity: "decor2" },
            { type: "medium", size: "P", complexity: "decor2" },
          ],
          extraEnvironments: 1,
          serviceModality: "presencial",
          paymentType: "cash",
        };

        const request = createRequest(input);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.result.extrasTotal).toBeGreaterThan(0);
        expect(data.data.result.surveyFeeTotal).toBe(1000); // presencial fee
        expect(data.data.result.discount).toBeGreaterThan(0); // cash discount
      });
    });

    describe("ProjetExpress calculations", () => {
      it("should return calculated result for valid ProjetExpress input", async () => {
        const validInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 80,
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(validInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.input.service).toBe("projetexpress");
        expect(data.data.result.basePrice).toBe(80 * 145); // 50-100m2 range
        expect(data.data.result.pricePerM2).toBe(145);
      });

      it("should calculate with management fee", async () => {
        const input = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 100,
          serviceModality: "online",
          paymentType: "cash",
          includeManagement: true,
          managementFee: 2000,
        };

        const request = createRequest(input);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.result.managementFeeTotal).toBe(2000);
        expect(data.data.result.discount).toBeGreaterThan(0);
      });
    });

    describe("Producao calculations", () => {
      it("should return calculated result for valid Producao input", async () => {
        const validInput = {
          service: "producao",
          environmentCount: 2,
          complexity: "prod1",
          environmentsConfig: [
            { type: "standard", size: "M", complexity: "prod1" },
            { type: "medium", size: "P", complexity: "prod1" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(validInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.input.service).toBe("producao");
        expect(data.data.result.basePrice).toBe(2900);
      });
    });

    describe("Validation errors", () => {
      it("should return 400 for missing required fields", async () => {
        const invalidInput = {
          service: "decorexpress",
          // Missing required fields
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Validation error");
      });

      it("should return 400 for invalid service type", async () => {
        const invalidInput = {
          service: "invalid_service",
          environmentCount: 1,
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Validation error");
      });

      it("should return 400 for invalid environment count", async () => {
        const invalidInput = {
          service: "decorexpress",
          environmentCount: 5, // Invalid: max is 3
          complexity: "decor1",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor1" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it("should return 400 for empty environments config", async () => {
        const invalidInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [], // Empty array
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it("should return 400 for area out of range (ProjetExpress)", async () => {
        const invalidInput = {
          service: "projetexpress",
          projectType: "novo",
          projectArea: 500, // Max is 300
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it("should return 400 for discount greater than 100%", async () => {
        const invalidInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor1" },
          ],
          serviceModality: "online",
          paymentType: "custom",
          discountPercentage: 150, // Invalid: max is 100
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      it("should return detailed error messages", async () => {
        const invalidInput = {
          service: "decorexpress",
          environmentCount: "invalid", // Should be number
          complexity: "decor1",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor1" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(invalidInput);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBeDefined();
        expect(typeof data.error).toBe("string");
      });
    });

    describe("Response format", () => {
      it("should include timestamp in response", async () => {
        const validInput = {
          service: "decorexpress",
          environmentCount: 1,
          complexity: "decor1",
          environmentsConfig: [
            { type: "standard", size: "P", complexity: "decor1" },
          ],
          serviceModality: "online",
          paymentType: "installments",
        };

        const request = createRequest(validInput);
        const response = await POST(request);
        const data = await response.json();

        expect(data.data.timestamp).toBeDefined();
        // Should be valid ISO date
        expect(new Date(data.data.timestamp).toISOString()).toBe(data.data.timestamp);
      });

      it("should echo input in response", async () => {
        const validInput = {
          service: "projetexpress",
          projectType: "reforma",
          projectArea: 150,
          serviceModality: "presencial",
          paymentType: "cash",
        };

        const request = createRequest(validInput);
        const response = await POST(request);
        const data = await response.json();

        expect(data.data.input.service).toBe("projetexpress");
        expect(data.data.input.projectType).toBe("reforma");
        expect(data.data.input.projectArea).toBe(150);
      });
    });
  });

  describe("GET /api/calculator/config", () => {
    it("should return pricing configuration", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it("should include hour value", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.hourValue).toBe(200);
    });

    it("should include survey fee configuration", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.surveyFee).toBeDefined();
      expect(data.data.surveyFee.presencial.price).toBe(1000);
      expect(data.data.surveyFee.presencial.hours).toBe(4);
      expect(data.data.surveyFee.online.price).toBe(0);
    });

    it("should include all multipliers", async () => {
      const response = await GET();
      const data = await response.json();

      // Environment type multipliers
      expect(data.data.environmentTypeMultipliers).toBeDefined();
      expect(data.data.environmentTypeMultipliers.standard.multiplier).toBe(1.0);
      expect(data.data.environmentTypeMultipliers.medium.multiplier).toBe(1.25);
      expect(data.data.environmentTypeMultipliers.high.multiplier).toBe(1.4);

      // Size multipliers
      expect(data.data.sizeMultipliers).toBeDefined();
      expect(data.data.sizeMultipliers.P.multiplier).toBe(1.0);
      expect(data.data.sizeMultipliers.M.multiplier).toBe(1.1);
      expect(data.data.sizeMultipliers.G.multiplier).toBe(1.15);

      // Complexity multipliers
      expect(data.data.complexityMultipliers).toBeDefined();
      expect(data.data.complexityMultipliers.simples.multiplier).toBe(0.8);
      expect(data.data.complexityMultipliers.padrao.multiplier).toBe(1.0);

      // Finish multipliers
      expect(data.data.finishMultipliers).toBeDefined();
      expect(data.data.finishMultipliers.economico.multiplier).toBe(0.9);
      expect(data.data.finishMultipliers.luxo.multiplier).toBe(1.4);
    });

    it("should include all pricing tiers", async () => {
      const response = await GET();
      const data = await response.json();

      // DecorExpress pricing
      expect(data.data.decorExpressPricing).toBeDefined();
      expect(data.data.decorExpressPricing["1"]).toBeDefined();
      expect(data.data.decorExpressPricing["2"]).toBeDefined();
      expect(data.data.decorExpressPricing["3"]).toBeDefined();

      // Producao pricing
      expect(data.data.producaoPricing).toBeDefined();
      expect(data.data.producaoPricing["1"]).toBeDefined();
      expect(data.data.producaoPricing["2"]).toBeDefined();
      expect(data.data.producaoPricing["3"]).toBeDefined();

      // ProjetExpress pricing
      expect(data.data.projetExpressPricing).toBeDefined();
      expect(data.data.projetExpressPricing.novo).toBeDefined();
      expect(data.data.projetExpressPricing.reforma).toBeDefined();
    });

    it("should include extra environment pricing", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.extraEnvironment).toBeDefined();
      expect(data.data.extraEnvironment.pricePerUnit).toBe(1200);
      expect(data.data.extraEnvironment.hoursPerUnit).toBe(8);
    });

    it("should include default management fee", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.defaultManagementFee).toBeDefined();
      expect(data.data.defaultManagementFee.price).toBe(1500);
      expect(data.data.defaultManagementFee.hours).toBe(8);
    });

    it("should include cash discount configuration", async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.data.cashDiscount).toBeDefined();
      expect(data.data.cashDiscount.min).toBe(5);
      expect(data.data.cashDiscount.max).toBe(15);
      expect(data.data.cashDiscount.default).toBe(10);
    });

    it("should include ProjetExpress area ranges", async () => {
      const response = await GET();
      const data = await response.json();

      const novoRanges = data.data.projetExpressPricing.novo.ranges;
      expect(novoRanges).toHaveLength(5);

      // Check first range
      expect(novoRanges[0].min).toBe(20);
      expect(novoRanges[0].max).toBe(50);
      expect(novoRanges[0].pricePerM2).toBe(150);

      // Check reforma has higher prices
      const reformaRanges = data.data.projetExpressPricing.reforma.ranges;
      expect(reformaRanges[0].pricePerM2).toBe(180);
    });
  });
});
