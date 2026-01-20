import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the openrouter module
vi.mock("@/shared/lib/openrouter", () => ({
  generateCompletion: vi.fn(),
  AI_MODELS: {
    TEXT_GENERATION: "anthropic/claude-3.5-sonnet",
    IMAGE_PROMPTS: "openai/gpt-4o",
    FAST: "google/gemini-2.0-flash-exp",
    FALLBACK: "google/gemini-2.0-flash-exp",
  },
  AIError: class AIError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500
    ) {
      super(message);
      this.name = "AIError";
    }
  },
}));

import { generateCompletion, AIError } from "@/shared/lib/openrouter";
import { generateBriefing } from "../services/briefing.service";
import { generateBrandbook } from "../services/brandbook.service";
import { extractProduct } from "../services/product-extraction.service";
import type {
  BriefingMemorialInput,
  BriefingMoodboardInput,
  BriefingReferenceInput,
  BrandbookInput,
  ProductExtractionInput,
} from "../types";

const mockGenerateCompletion = vi.mocked(generateCompletion);

describe("AI Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateBriefing", () => {
    describe("memorial generation", () => {
      const memorialInput: BriefingMemorialInput = {
        type: "memorial",
        transcription: "O cliente quer uma sala moderna com sofá cinza e madeira natural.",
        clientName: "João Silva",
        projectCode: "ARQ-2026001",
        architectName: "Maria Santos",
      };

      it("should generate memorial from transcription", async () => {
        const mockMemorial = `# BRIEFING DE PROJETO
## ARQ-2026001 - SALA DE ESTAR
**CLIENTE:** João Silva
...`;
        mockGenerateCompletion.mockResolvedValueOnce({
          content: mockMemorial,
          model: "anthropic/claude-3.5-sonnet",
        });

        const result = await generateBriefing(memorialInput);

        expect(result.type).toBe("memorial");
        expect(result).toHaveProperty("memorial");
        if (result.type === "memorial") {
          expect(result.memorial).toBe(mockMemorial);
        }
      });

      it("should call generateCompletion with correct parameters", async () => {
        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Generated memorial",
          model: "anthropic/claude-3.5-sonnet",
        });

        await generateBriefing(memorialInput);

        expect(mockGenerateCompletion).toHaveBeenCalledTimes(1);
        expect(mockGenerateCompletion).toHaveBeenCalledWith(
          expect.objectContaining({
            model: "anthropic/claude-3.5-sonnet",
            userPrompt: expect.stringContaining(memorialInput.transcription),
            temperature: 0.7,
            maxTokens: 4096,
          })
        );
      });

      it("should include client info in system prompt", async () => {
        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Generated memorial",
          model: "anthropic/claude-3.5-sonnet",
        });

        await generateBriefing(memorialInput);

        const callArgs = mockGenerateCompletion.mock.calls[0][0];
        expect(callArgs.systemPrompt).toContain("João Silva");
        expect(callArgs.systemPrompt).toContain("ARQ-2026001");
        expect(callArgs.systemPrompt).toContain("Maria Santos");
      });

      it("should work without optional fields", async () => {
        const minimalInput: BriefingMemorialInput = {
          type: "memorial",
          transcription: "O cliente quer uma sala moderna.",
        };

        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Generated memorial",
          model: "anthropic/claude-3.5-sonnet",
        });

        const result = await generateBriefing(minimalInput);

        expect(result.type).toBe("memorial");
      });
    });

    describe("moodboard generation", () => {
      const moodboardInput: BriefingMoodboardInput = {
        type: "moodboard",
        memorial: `# BRIEFING DE PROJETO
## SALA DE ESTAR
### Estilo: CONTEMPORÂNEO
- Cores: bege, cinza, madeira
- Materiais: linho, mármore, carvalho`,
      };

      it("should generate moodboard prompt from memorial", async () => {
        const mockPrompt =
          "Flat lay moodboard, editorial minimalist style, featuring oak wood, beige linen...";
        mockGenerateCompletion.mockResolvedValueOnce({
          content: mockPrompt,
          model: "openai/gpt-4o",
        });

        const result = await generateBriefing(moodboardInput);

        expect(result.type).toBe("moodboard");
        expect(result).toHaveProperty("prompt");
        if (result.type === "moodboard") {
          expect(result.prompt).toBe(mockPrompt);
        }
      });

      it("should use IMAGE_PROMPTS model for moodboard", async () => {
        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Moodboard prompt",
          model: "openai/gpt-4o",
        });

        await generateBriefing(moodboardInput);

        expect(mockGenerateCompletion).toHaveBeenCalledWith(
          expect.objectContaining({
            model: "openai/gpt-4o",
            temperature: 0.8,
            maxTokens: 1024,
          })
        );
      });

      it("should include memorial in user prompt", async () => {
        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Moodboard prompt",
          model: "openai/gpt-4o",
        });

        await generateBriefing(moodboardInput);

        const callArgs = mockGenerateCompletion.mock.calls[0][0];
        expect(callArgs.userPrompt).toContain(moodboardInput.memorial);
      });
    });

    describe("reference generation", () => {
      const referenceInput: BriefingReferenceInput = {
        type: "reference",
        memorial: `# BRIEFING DE PROJETO
## SALA DE ESTAR
### Estilo: MINIMALISTA
- Sofá em L cinza
- Mesa de centro mármore`,
      };

      it("should generate reference prompt from memorial", async () => {
        const mockPrompt =
          "Contemporary living room interior design, minimalist style, featuring L-shaped gray sofa...";
        mockGenerateCompletion.mockResolvedValueOnce({
          content: mockPrompt,
          model: "openai/gpt-4o",
        });

        const result = await generateBriefing(referenceInput);

        expect(result.type).toBe("reference");
        expect(result).toHaveProperty("prompt");
        if (result.type === "reference") {
          expect(result.prompt).toBe(mockPrompt);
        }
      });

      it("should use IMAGE_PROMPTS model for reference", async () => {
        mockGenerateCompletion.mockResolvedValueOnce({
          content: "Reference prompt",
          model: "openai/gpt-4o",
        });

        await generateBriefing(referenceInput);

        expect(mockGenerateCompletion).toHaveBeenCalledWith(
          expect.objectContaining({
            model: "openai/gpt-4o",
          })
        );
      });
    });

    describe("error handling", () => {
      it("should propagate AIError from generateCompletion", async () => {
        const error = new AIError("Rate limit exceeded", "RATE_LIMIT", 429);
        mockGenerateCompletion.mockRejectedValueOnce(error);

        const input: BriefingMemorialInput = {
          type: "memorial",
          transcription: "Test transcription",
        };

        await expect(generateBriefing(input)).rejects.toThrow("Rate limit exceeded");
      });
    });
  });

  describe("generateBrandbook", () => {
    const brandbookInput: BrandbookInput = {
      answers: {
        identity: {
          name: "Studio Arquitetura",
          foundingYear: 2020,
          location: "São Paulo",
        },
        differentials: {
          mainDifferential: "Atendimento personalizado",
        },
        values: {
          coreValues: ["Excelência", "Inovação"],
          purpose: "Transformar espaços em experiências",
        },
      },
    };

    it("should generate brandbook from answers", async () => {
      const mockBrandbook = `# BRANDBOOK STUDIO ARQUITETURA

## PARTE 1: FUNDAMENTOS
### TESE
Transformar espaços em experiências únicas...`;

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockBrandbook,
        model: "anthropic/claude-3.5-sonnet",
      });

      const result = await generateBrandbook(brandbookInput);

      expect(result.brandbook).toBe(mockBrandbook);
    });

    it("should use TEXT_GENERATION model", async () => {
      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Brandbook content",
        model: "anthropic/claude-3.5-sonnet",
      });

      await generateBrandbook(brandbookInput);

      expect(mockGenerateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "anthropic/claude-3.5-sonnet",
          temperature: 0.7,
          maxTokens: 6000,
        })
      );
    });

    it("should include answers in prompt", async () => {
      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Brandbook content",
        model: "anthropic/claude-3.5-sonnet",
      });

      await generateBrandbook(brandbookInput);

      const callArgs = mockGenerateCompletion.mock.calls[0][0];
      expect(callArgs.userPrompt).toContain("Studio Arquitetura");
      expect(callArgs.userPrompt).toContain("Atendimento personalizado");
    });

    it("should work with minimal answers", async () => {
      const minimalInput: BrandbookInput = {
        answers: {
          identity: {
            name: "Meu Studio",
          },
        },
      };

      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Brandbook content",
        model: "anthropic/claude-3.5-sonnet",
      });

      const result = await generateBrandbook(minimalInput);

      expect(result.brandbook).toBeDefined();
    });
  });

  describe("extractProduct", () => {
    const productInput: ProductExtractionInput = {
      url: "https://www.tokstok.com.br/sofa-12345",
      htmlContent: "<html><body><h1>Sofá 3 Lugares</h1><span>R$ 4.599,90</span></body></html>",
    };

    it("should extract product from HTML content", async () => {
      const mockResponse = JSON.stringify({
        name: "Sofá 3 Lugares",
        price: 4599.9,
        currency: "BRL",
        supplier: "Tok&Stok",
        category: "Sofá",
      });

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockResponse,
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product?.name).toBe("Sofá 3 Lugares");
      expect(result.product?.price).toBe(4599.9);
      expect(result.product?.url).toBe(productInput.url);
    });

    it("should use FAST model for extraction", async () => {
      mockGenerateCompletion.mockResolvedValueOnce({
        content: JSON.stringify({ name: "Produto", url: productInput.url }),
        model: "google/gemini-2.0-flash-exp",
      });

      await extractProduct(productInput);

      expect(mockGenerateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "google/gemini-2.0-flash-exp",
          temperature: 0.3,
          maxTokens: 1024,
        })
      );
    });

    it("should handle JSON wrapped in markdown code blocks", async () => {
      const mockResponse = "```json\n" + JSON.stringify({
        name: "Poltrona Design",
        price: 2500,
      }) + "\n```";

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockResponse,
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(true);
      expect(result.product?.name).toBe("Poltrona Design");
    });

    it("should return error when AI returns error object", async () => {
      const mockResponse = JSON.stringify({
        error: "Não foi possível extrair informações do produto",
      });

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockResponse,
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não foi possível extrair informações do produto");
    });

    it("should return error when product name is missing", async () => {
      const mockResponse = JSON.stringify({
        price: 1000,
        supplier: "Loja",
      });

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockResponse,
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nome do produto não encontrado");
    });

    it("should return error on invalid JSON response", async () => {
      mockGenerateCompletion.mockResolvedValueOnce({
        content: "This is not valid JSON",
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Não foi possível processar a resposta da IA");
    });

    it("should extract all optional fields when present", async () => {
      const mockResponse = JSON.stringify({
        name: "Mesa de Jantar",
        price: 3200,
        currency: "BRL",
        supplier: "MadeiraMadeira",
        imageUrl: "https://example.com/mesa.jpg",
        description: "Mesa de jantar em madeira maciça",
        category: "Mesa",
        dimensions: "L 180cm x P 90cm x A 75cm",
        material: "Madeira",
        color: "Natural",
        sku: "MESA-001",
      });

      mockGenerateCompletion.mockResolvedValueOnce({
        content: mockResponse,
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(productInput);

      expect(result.success).toBe(true);
      expect(result.product).toMatchObject({
        name: "Mesa de Jantar",
        price: 3200,
        currency: "BRL",
        supplier: "MadeiraMadeira",
        imageUrl: "https://example.com/mesa.jpg",
        description: "Mesa de jantar em madeira maciça",
        category: "Mesa",
        dimensions: "L 180cm x P 90cm x A 75cm",
        material: "Madeira",
        color: "Natural",
        sku: "MESA-001",
        url: productInput.url,
      });
    });

    it("should work without htmlContent", async () => {
      const inputWithoutHtml: ProductExtractionInput = {
        url: "https://www.example.com/product/123",
      };

      mockGenerateCompletion.mockResolvedValueOnce({
        content: JSON.stringify({ name: "Produto Inferido" }),
        model: "google/gemini-2.0-flash-exp",
      });

      const result = await extractProduct(inputWithoutHtml);

      expect(result.success).toBe(true);
      expect(result.product?.name).toBe("Produto Inferido");
    });
  });

  describe("prompts", () => {
    it("should generate memorial system prompt with custom parameters", async () => {
      const input: BriefingMemorialInput = {
        type: "memorial",
        transcription: "Test",
        clientName: "Cliente Teste",
        projectCode: "PROJ-001",
        architectName: "Arquiteto Teste",
      };

      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Memorial",
        model: "anthropic/claude-3.5-sonnet",
      });

      await generateBriefing(input);

      const callArgs = mockGenerateCompletion.mock.calls[0][0];
      expect(callArgs.systemPrompt).toContain("Cliente Teste");
      expect(callArgs.systemPrompt).toContain("PROJ-001");
      expect(callArgs.systemPrompt).toContain("Arquiteto Teste");
    });

    it("should use moodboard-specific system prompt", async () => {
      const input: BriefingMoodboardInput = {
        type: "moodboard",
        memorial: "Test memorial with more than fifty characters to pass validation test.",
      };

      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Prompt",
        model: "openai/gpt-4o",
      });

      await generateBriefing(input);

      const callArgs = mockGenerateCompletion.mock.calls[0][0];
      expect(callArgs.systemPrompt).toContain("Flat lay moodboard");
      expect(callArgs.systemPrompt).toContain("INGLÊS");
    });

    it("should use reference-specific system prompt", async () => {
      const input: BriefingReferenceInput = {
        type: "reference",
        memorial: "Test memorial with more than fifty characters to pass validation test.",
      };

      mockGenerateCompletion.mockResolvedValueOnce({
        content: "Prompt",
        model: "openai/gpt-4o",
      });

      await generateBriefing(input);

      const callArgs = mockGenerateCompletion.mock.calls[0][0];
      expect(callArgs.systemPrompt).toContain("REFERÊNCIA VISUAL");
      expect(callArgs.systemPrompt).toContain("ultra-realistic");
    });
  });
});
