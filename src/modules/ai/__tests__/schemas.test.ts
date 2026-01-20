import { describe, it, expect } from "vitest";
import {
  briefingTypeSchema,
  briefingMemorialInputSchema,
  briefingMoodboardInputSchema,
  briefingReferenceInputSchema,
  briefingInputSchema,
  brandbookIdentitySchema,
  brandbookDifferentialsSchema,
  brandbookAudienceSchema,
  brandbookValuesSchema,
  brandbookCommunicationSchema,
  brandbookAnswersSchema,
  brandbookInputSchema,
  productExtractionInputSchema,
  extractedProductSchema,
} from "../schemas";

describe("AI Schemas", () => {
  describe("briefingTypeSchema", () => {
    it("should accept valid briefing types", () => {
      const types = ["memorial", "moodboard", "reference"];
      for (const type of types) {
        expect(briefingTypeSchema.safeParse(type).success).toBe(true);
      }
    });

    it("should reject invalid briefing type", () => {
      expect(briefingTypeSchema.safeParse("invalid").success).toBe(false);
      expect(briefingTypeSchema.safeParse("brandbook").success).toBe(false);
    });
  });

  describe("briefingMemorialInputSchema", () => {
    const validInput = {
      type: "memorial",
      transcription: "Esta é uma transcrição de briefing com mais de 10 caracteres.",
    };

    it("should validate correct memorial input", () => {
      const result = briefingMemorialInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate memorial with all optional fields", () => {
      const fullInput = {
        ...validInput,
        clientName: "João Silva",
        projectCode: "ARQ-2026001",
        architectName: "Maria Santos",
      };
      const result = briefingMemorialInputSchema.safeParse(fullInput);
      expect(result.success).toBe(true);
    });

    it("should reject transcription with less than 10 characters", () => {
      const invalid = {
        type: "memorial",
        transcription: "curto",
      };
      const result = briefingMemorialInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("10 caracteres");
      }
    });

    it("should reject wrong type literal", () => {
      const invalid = {
        type: "moodboard",
        transcription: "Esta é uma transcrição válida.",
      };
      const result = briefingMemorialInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject missing transcription", () => {
      const invalid = {
        type: "memorial",
      };
      const result = briefingMemorialInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("briefingMoodboardInputSchema", () => {
    const validInput = {
      type: "moodboard",
      memorial: "Este é um memorial de briefing completo com todas as informações necessárias para gerar um prompt de moodboard.",
    };

    it("should validate correct moodboard input", () => {
      const result = briefingMoodboardInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject memorial with less than 50 characters", () => {
      const invalid = {
        type: "moodboard",
        memorial: "Memorial muito curto",
      };
      const result = briefingMoodboardInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50 caracteres");
      }
    });

    it("should reject wrong type literal", () => {
      const invalid = {
        type: "memorial",
        memorial: "Este é um memorial válido com mais de cinquenta caracteres para passar na validação.",
      };
      const result = briefingMoodboardInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("briefingReferenceInputSchema", () => {
    const validInput = {
      type: "reference",
      memorial: "Este é um memorial de briefing completo com todas as informações necessárias para gerar um prompt de referência visual.",
    };

    it("should validate correct reference input", () => {
      const result = briefingReferenceInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject memorial with less than 50 characters", () => {
      const invalid = {
        type: "reference",
        memorial: "Muito curto",
      };
      const result = briefingReferenceInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("briefingInputSchema (discriminated union)", () => {
    it("should discriminate memorial input", () => {
      const input = {
        type: "memorial",
        transcription: "Esta é uma transcrição válida de briefing.",
      };
      const result = briefingInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("memorial");
      }
    });

    it("should discriminate moodboard input", () => {
      const input = {
        type: "moodboard",
        memorial: "Este é um memorial válido com mais de cinquenta caracteres para passar na validação.",
      };
      const result = briefingInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("moodboard");
      }
    });

    it("should discriminate reference input", () => {
      const input = {
        type: "reference",
        memorial: "Este é um memorial válido com mais de cinquenta caracteres para passar na validação.",
      };
      const result = briefingInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("reference");
      }
    });

    it("should reject unknown type", () => {
      const input = {
        type: "unknown",
        transcription: "Texto qualquer",
      };
      const result = briefingInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject mismatched type and fields", () => {
      // memorial type but with memorial field instead of transcription
      const input = {
        type: "memorial",
        memorial: "Este campo não deveria existir para tipo memorial.",
      };
      const result = briefingInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("brandbookIdentitySchema", () => {
    it("should validate correct identity", () => {
      const valid = {
        name: "Studio Arquitetura",
        foundingYear: 2020,
        location: "São Paulo, SP",
        teamSize: "5-10 pessoas",
      };
      const result = brandbookIdentitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate identity with only required fields", () => {
      const valid = {
        name: "Studio",
      };
      const result = brandbookIdentitySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalid = {
        name: "",
      };
      const result = brandbookIdentitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject founding year before 1900", () => {
      const invalid = {
        name: "Studio",
        foundingYear: 1899,
      };
      const result = brandbookIdentitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject founding year after 2100", () => {
      const invalid = {
        name: "Studio",
        foundingYear: 2101,
      };
      const result = brandbookIdentitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer founding year", () => {
      const invalid = {
        name: "Studio",
        foundingYear: 2020.5,
      };
      const result = brandbookIdentitySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("brandbookDifferentialsSchema", () => {
    it("should validate correct differentials", () => {
      const valid = {
        mainDifferential: "Atendimento personalizado",
        uniqueProcess: "Processo exclusivo de briefing",
        specialization: "Apartamentos compactos",
      };
      const result = brandbookDifferentialsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate empty differentials", () => {
      const valid = {};
      const result = brandbookDifferentialsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate partial differentials", () => {
      const valid = {
        mainDifferential: "Atendimento personalizado",
      };
      const result = brandbookDifferentialsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("brandbookAudienceSchema", () => {
    it("should validate correct audience", () => {
      const valid = {
        idealClient: "Jovens profissionais",
        clientProfile: "25-35 anos, renda alta",
        projectTypes: ["Apartamento", "Casa", "Escritório"],
      };
      const result = brandbookAudienceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate empty project types array", () => {
      const valid = {
        projectTypes: [],
      };
      const result = brandbookAudienceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("brandbookValuesSchema", () => {
    it("should validate correct values", () => {
      const valid = {
        coreValues: ["Excelência", "Inovação", "Transparência"],
        beliefs: "Acreditamos que design transforma vidas",
        purpose: "Criar espaços que inspiram",
      };
      const result = brandbookValuesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate empty values", () => {
      const valid = {};
      const result = brandbookValuesSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("brandbookCommunicationSchema", () => {
    it("should validate correct communication", () => {
      const valid = {
        toneOfVoice: "Profissional, acolhedor, inspirador",
        keywords: ["design", "transformação", "exclusivo"],
        avoidWords: ["barato", "rápido", "simples"],
      };
      const result = brandbookCommunicationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("brandbookAnswersSchema", () => {
    it("should validate complete answers", () => {
      const valid = {
        identity: {
          name: "Studio Design",
          foundingYear: 2020,
        },
        differentials: {
          mainDifferential: "Atendimento VIP",
        },
        audience: {
          idealClient: "Alto padrão",
        },
        values: {
          coreValues: ["Excelência"],
        },
        communication: {
          toneOfVoice: "Sofisticado",
        },
      };
      const result = brandbookAnswersSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate empty answers", () => {
      const valid = {};
      const result = brandbookAnswersSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate partial answers", () => {
      const valid = {
        identity: {
          name: "Studio",
        },
      };
      const result = brandbookAnswersSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("brandbookInputSchema", () => {
    it("should validate correct brandbook input", () => {
      const valid = {
        answers: {
          identity: {
            name: "Meu Escritório",
          },
        },
      };
      const result = brandbookInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate empty answers object", () => {
      const valid = {
        answers: {},
      };
      const result = brandbookInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject missing answers field", () => {
      const invalid = {};
      const result = brandbookInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("productExtractionInputSchema", () => {
    it("should validate correct product extraction input", () => {
      const valid = {
        url: "https://www.tokstok.com.br/produto/12345",
      };
      const result = productExtractionInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate with optional htmlContent", () => {
      const valid = {
        url: "https://www.example.com/product",
        htmlContent: "<html><body>Product page content</body></html>",
      };
      const result = productExtractionInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid URL", () => {
      const invalid = {
        url: "not-a-valid-url",
      };
      const result = productExtractionInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("URL");
      }
    });

    it("should reject missing URL", () => {
      const invalid = {};
      const result = productExtractionInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept various URL formats", () => {
      const urls = [
        "https://www.example.com",
        "http://localhost:3000/product",
        "https://store.com/product?id=123&color=red",
        "https://sub.domain.com/path/to/product",
      ];
      for (const url of urls) {
        const result = productExtractionInputSchema.safeParse({ url });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("extractedProductSchema", () => {
    it("should validate complete product", () => {
      const valid = {
        name: "Sofá 3 Lugares",
        price: 4599.90,
        currency: "BRL",
        supplier: "Tok&Stok",
        imageUrl: "https://example.com/sofa.jpg",
        description: "Sofá moderno com estrutura em madeira",
        category: "Sofá",
        dimensions: "L 220cm x P 95cm x A 80cm",
        material: "Linho",
        color: "Bege",
        sku: "SOF-12345",
        url: "https://tokstok.com.br/sofa",
      };
      const result = extractedProductSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate minimal product (name and url only)", () => {
      const valid = {
        name: "Produto Teste",
        url: "https://example.com/product",
      };
      const result = extractedProductSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const invalid = {
        url: "https://example.com/product",
        price: 100,
      };
      const result = extractedProductSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject missing url", () => {
      const invalid = {
        name: "Produto",
      };
      const result = extractedProductSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid imageUrl", () => {
      const invalid = {
        name: "Produto",
        url: "https://example.com",
        imageUrl: "not-a-url",
      };
      const result = extractedProductSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept price as number", () => {
      const valid = {
        name: "Produto",
        url: "https://example.com",
        price: 1234.56,
      };
      const result = extractedProductSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
