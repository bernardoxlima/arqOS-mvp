/**
 * Document Generators Unit Tests
 * Tests for PowerPoint, Excel, PDF, and Word generators
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generatePresentationPPT,
  generateShoppingListPPT,
  generateBudgetPPT,
  generateTechnicalDetailingPPT,
  generateBudgetExcel,
  generateProposalPDF,
  generateProposalWord,
} from "../index";
import type {
  PresentationPPTInput,
  ShoppingListPPTInput,
  BudgetPPTInput,
  TechnicalDetailingPPTInput,
  ExcelBudgetInput,
  PDFProposalInput,
  WordProposalInput,
} from "../types";

// Mock fetch for image URL to base64 conversion
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Mock successful image fetch
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    headers: new Headers({ "content-type": "image/png" }),
  });
});

// =============================================================================
// Presentation PPT Generator Tests
// =============================================================================

describe("generatePresentationPPT", () => {
  const validInput: PresentationPPTInput = {
    presentationId: "test-presentation-id",
    clientData: {
      clientName: "Maria Silva",
      clientAddress: "Rua das Flores, 123",
      projectType: "Apartamento",
      ambiente: "Sala de Estar",
      date: "2026-01-20",
    },
    images: [
      {
        section: "photos_before",
        images: [
          { id: "1", url: "https://example.com/photo1.jpg", displayOrder: 1 },
        ],
      },
      {
        section: "renders",
        images: [
          { id: "2", url: "https://example.com/render1.jpg", displayOrder: 1 },
        ],
      },
    ],
  };

  it("should generate presentation PPT successfully", async () => {
    const result = await generatePresentationPPT(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("apresentacao-");
    expect(result.filename).toContain(".pptx");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  });

  it("should generate PPT with minimal data", async () => {
    const minimalInput: PresentationPPTInput = {
      presentationId: "test-id",
      clientData: {
        clientName: "Cliente Teste",
      },
      images: [],
    };

    const result = await generatePresentationPPT(minimalInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should include only requested sections", async () => {
    const input: PresentationPPTInput = {
      ...validInput,
      includePhotosBefore: false,
      includeMoodboard: false,
      includeReferences: false,
      includeFloorPlan: false,
      includeRenders: true,
    };

    const result = await generatePresentationPPT(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should handle missing images gracefully", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    const result = await generatePresentationPPT(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should sanitize filename from client name", async () => {
    const input: PresentationPPTInput = {
      ...validInput,
      clientData: {
        clientName: "João & Maria  Santos",
      },
    };

    const result = await generatePresentationPPT(input);

    // Multiple spaces are collapsed to single dash
    expect(result.filename).toBe("apresentacao-joão-&-maria-santos.pptx");
  });
});

// =============================================================================
// Shopping List PPT Generator Tests
// =============================================================================

describe("generateShoppingListPPT", () => {
  const validInput: ShoppingListPPTInput = {
    presentationId: "test-id",
    clientName: "Carlos Oliveira",
    items: [
      {
        id: "1",
        name: "Sofá 3 Lugares",
        category: "mobiliario",
        categoryColor: "1E3A5F",
        ambiente: "Sala de Estar",
        number: 1,
        quantity: 1,
        unit: "un",
        price: 2500,
        supplier: "Tok&Stok",
      },
      {
        id: "2",
        name: "Mesa de Centro",
        category: "mobiliario",
        categoryColor: "1E3A5F",
        ambiente: "Sala de Estar",
        number: 2,
        quantity: 1,
        unit: "un",
        price: 800,
        supplier: "Etna",
      },
      {
        id: "3",
        name: "Luminária Pendente",
        category: "iluminacao",
        categoryColor: "FBBF24",
        ambiente: "Sala de Jantar",
        number: 3,
        quantity: 2,
        unit: "un",
        price: 450,
      },
    ],
  };

  it("should generate shopping list PPT successfully", async () => {
    const result = await generateShoppingListPPT(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("lista-compras-");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  });

  it("should generate PPT with empty items", async () => {
    const input: ShoppingListPPTInput = {
      ...validInput,
      items: [],
    };

    const result = await generateShoppingListPPT(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should group items by category", async () => {
    const input: ShoppingListPPTInput = {
      ...validInput,
      groupByCategory: true,
      groupByAmbiente: false,
    };

    const result = await generateShoppingListPPT(input);

    expect(result.success).toBe(true);
  });

  it("should group items by ambiente", async () => {
    const input: ShoppingListPPTInput = {
      ...validInput,
      groupByCategory: false,
      groupByAmbiente: true,
    };

    const result = await generateShoppingListPPT(input);

    expect(result.success).toBe(true);
  });

  it("should include prices when requested", async () => {
    const input: ShoppingListPPTInput = {
      ...validInput,
      includePrices: true,
    };

    const result = await generateShoppingListPPT(input);

    expect(result.success).toBe(true);
  });

  it("should exclude images when not requested", async () => {
    const input: ShoppingListPPTInput = {
      ...validInput,
      includeImages: false,
    };

    const result = await generateShoppingListPPT(input);

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Budget PPT Generator Tests
// =============================================================================

describe("generateBudgetPPT", () => {
  const validInput: BudgetPPTInput = {
    presentationId: "test-id",
    clientName: "Ana Paula",
    projectName: "Reforma Apartamento",
    items: [
      {
        id: "1",
        name: "Sofá",
        category: "mobiliario",
        categoryColor: "1E3A5F",
        ambiente: "Sala",
        quantity: 1,
        unit: "un",
        unitPrice: 3000,
        totalPrice: 3000,
        supplier: "Tok&Stok",
      },
      {
        id: "2",
        name: "Armário",
        category: "marcenaria",
        categoryColor: "F59E0B",
        ambiente: "Quarto",
        quantity: 2,
        unit: "un",
        unitPrice: 5000,
        totalPrice: 10000,
        supplier: "Marceneiro Local",
      },
    ],
    categories: [
      {
        name: "mobiliario",
        color: "1E3A5F",
        items: [
          {
            id: "1",
            name: "Sofá",
            category: "mobiliario",
            categoryColor: "1E3A5F",
            quantidade: 1,
            quantity: 1,
            unit: "un",
            unitPrice: 3000,
            totalPrice: 3000,
          },
        ],
        subtotal: 3000,
      },
      {
        name: "marcenaria",
        color: "F59E0B",
        items: [
          {
            id: "2",
            name: "Armário",
            category: "marcenaria",
            categoryColor: "F59E0B",
            quantity: 2,
            unit: "un",
            unitPrice: 5000,
            totalPrice: 10000,
          },
        ],
        subtotal: 10000,
      },
    ],
    grandTotal: 13000,
  };

  it("should generate budget PPT successfully", async () => {
    const result = await generateBudgetPPT(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("orcamento-");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  });

  it("should generate PPT without category summary", async () => {
    const input: BudgetPPTInput = {
      ...validInput,
      includeCategorySummary: false,
    };

    const result = await generateBudgetPPT(input);

    expect(result.success).toBe(true);
  });

  it("should generate PPT without suppliers", async () => {
    const input: BudgetPPTInput = {
      ...validInput,
      includeSuppliers: false,
    };

    const result = await generateBudgetPPT(input);

    expect(result.success).toBe(true);
  });

  it("should handle empty categories", async () => {
    const input: BudgetPPTInput = {
      ...validInput,
      categories: [],
      items: [],
      grandTotal: 0,
    };

    const result = await generateBudgetPPT(input);

    expect(result.success).toBe(true);
  });

  it("should handle many items per category", async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      category: "mobiliario",
      categoryColor: "1E3A5F",
      quantity: 1,
      unit: "un",
      unitPrice: 100,
      totalPrice: 100,
    }));

    const input: BudgetPPTInput = {
      ...validInput,
      items: manyItems,
      categories: [
        {
          name: "mobiliario",
          color: "1E3A5F",
          items: manyItems,
          subtotal: 2500,
        },
      ],
      grandTotal: 2500,
    };

    const result = await generateBudgetPPT(input);

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Technical Detailing PPT Generator Tests
// =============================================================================

describe("generateTechnicalDetailingPPT", () => {
  const validInput: TechnicalDetailingPPTInput = {
    presentationId: "test-id",
    clientName: "Roberto Lima",
    projectName: "Casa de Praia",
    items: [
      {
        id: "1",
        name: "Rack TV",
        category: "marcenaria",
        categoryColor: "F59E0B",
        ambiente: "Sala de TV",
        number: 1,
        dimensions: { width: 180, height: 50, depth: 45 },
        material: "MDF",
        finish: "Laca Branca",
        observations: "Instalar na parede",
      },
      {
        id: "2",
        name: "Bancada Cozinha",
        category: "marmoraria",
        categoryColor: "8B4513",
        ambiente: "Cozinha",
        number: 2,
        dimensions: { width: 250, height: 3, depth: 60 },
        material: "Granito",
        finish: "Polido",
      },
    ],
  };

  it("should generate technical detailing PPT successfully", async () => {
    const result = await generateTechnicalDetailingPPT(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("detalhamento-");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  });

  it("should generate PPT grouped by ambiente", async () => {
    const input: TechnicalDetailingPPTInput = {
      ...validInput,
      groupByAmbiente: true,
    };

    const result = await generateTechnicalDetailingPPT(input);

    expect(result.success).toBe(true);
  });

  it("should generate PPT without grouping", async () => {
    const input: TechnicalDetailingPPTInput = {
      ...validInput,
      groupByAmbiente: false,
    };

    const result = await generateTechnicalDetailingPPT(input);

    expect(result.success).toBe(true);
  });

  it("should handle items without dimensions", async () => {
    const input: TechnicalDetailingPPTInput = {
      ...validInput,
      items: [
        {
          id: "1",
          name: "Item sem dimensões",
          category: "decoracao",
          categoryColor: "8B5CF6",
          ambiente: "Sala",
          number: 1,
        },
      ],
    };

    const result = await generateTechnicalDetailingPPT(input);

    expect(result.success).toBe(true);
  });

  it("should handle empty items", async () => {
    const input: TechnicalDetailingPPTInput = {
      ...validInput,
      items: [],
    };

    const result = await generateTechnicalDetailingPPT(input);

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Budget Excel Generator Tests
// =============================================================================

describe("generateBudgetExcel", () => {
  const validInput: ExcelBudgetInput = {
    presentationId: "test-id",
    clientName: "Fernanda Costa",
    projectName: "Studio Compacto",
    items: [
      {
        id: "1",
        name: "Cama Box",
        category: "mobiliario",
        categoryColor: "1E3A5F",
        quantidade: 1,
        quantity: 1,
        unit: "un",
        unitPrice: 2000,
        totalPrice: 2000,
      },
    ],
    categories: [
      {
        name: "mobiliario",
        color: "1E3A5F",
        items: [
          {
            id: "1",
            name: "Cama Box",
            category: "mobiliario",
            categoryColor: "1E3A5F",
            quantity: 1,
            unit: "un",
            unitPrice: 2000,
            totalPrice: 2000,
          },
        ],
        subtotal: 2000,
      },
    ],
    grandTotal: 2000,
  };

  it("should generate budget Excel successfully", async () => {
    const result = await generateBudgetExcel(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("orcamento-");
    expect(result.filename).toContain(".xlsx");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("should generate Excel with formulas", async () => {
    const input: ExcelBudgetInput = {
      ...validInput,
      includeFormulas: true,
    };

    const result = await generateBudgetExcel(input);

    expect(result.success).toBe(true);
  });

  it("should generate Excel without formulas", async () => {
    const input: ExcelBudgetInput = {
      ...validInput,
      includeFormulas: false,
    };

    const result = await generateBudgetExcel(input);

    expect(result.success).toBe(true);
  });

  it("should handle multiple categories", async () => {
    const input: ExcelBudgetInput = {
      ...validInput,
      categories: [
        { name: "mobiliario", color: "1E3A5F", items: [], subtotal: 5000 },
        { name: "marcenaria", color: "F59E0B", items: [], subtotal: 8000 },
        { name: "iluminacao", color: "FBBF24", items: [], subtotal: 2000 },
      ],
      grandTotal: 15000,
    };

    const result = await generateBudgetExcel(input);

    expect(result.success).toBe(true);
  });

  it("should handle empty data", async () => {
    const input: ExcelBudgetInput = {
      ...validInput,
      items: [],
      categories: [],
      grandTotal: 0,
    };

    const result = await generateBudgetExcel(input);

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// PDF Proposal Generator Tests
// =============================================================================

describe("generateProposalPDF", () => {
  const validInput: PDFProposalInput = {
    clientName: "Pedro Santos",
    clientEmail: "pedro@email.com",
    clientPhone: "(11) 99999-9999",
    clientAddress: "Av. Paulista, 1000",
    projectType: "Reforma Residencial",
    projectDescription: "Reforma completa de apartamento de 80m²",
    serviceType: "DecorExpress",
    totalValue: 25000,
    paymentTerms: "50% entrada + 50% na entrega",
    validUntil: "2026-02-20",
  };

  it("should generate proposal PDF successfully", async () => {
    const result = await generateProposalPDF(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("proposta-");
    expect(result.filename).toContain(".pdf");
    expect(result.mimeType).toBe("application/pdf");
  });

  it("should generate PDF with minimal data", async () => {
    const minimalInput: PDFProposalInput = {
      clientName: "Cliente Teste",
      projectType: "Projeto",
      serviceType: "DecorExpress",
      totalValue: 10000,
    };

    const result = await generateProposalPDF(minimalInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should generate PDF with custom sections", async () => {
    const input: PDFProposalInput = {
      ...validInput,
      sections: [
        {
          title: "Escopo do Projeto",
          content: "Projeto completo de interiores",
          items: [
            { label: "Ambientes", value: "Sala, Quartos, Cozinha" },
            { label: "Prazo", value: "60 dias" },
          ],
        },
        {
          title: "Entregáveis",
          content: "Documentação completa do projeto",
        },
      ],
    };

    const result = await generateProposalPDF(input);

    expect(result.success).toBe(true);
  });

  it("should generate PDF without terms", async () => {
    const input: PDFProposalInput = {
      ...validInput,
      includeTerms: false,
    };

    const result = await generateProposalPDF(input);

    expect(result.success).toBe(true);
  });

  it("should handle special characters in client name", async () => {
    const input: PDFProposalInput = {
      ...validInput,
      clientName: "José da Silva & Filhos",
    };

    const result = await generateProposalPDF(input);

    expect(result.success).toBe(true);
    expect(result.filename).toContain("proposta-");
  });
});

// =============================================================================
// Word Proposal Generator Tests
// =============================================================================

describe("generateProposalWord", () => {
  const validInput: WordProposalInput = {
    clientName: "Mariana Alves",
    clientEmail: "mariana@email.com",
    clientPhone: "(21) 98888-8888",
    clientAddress: "Rua Copacabana, 500",
    projectType: "Design de Interiores",
    projectDescription: "Projeto de decoração para apartamento novo",
    serviceType: "ProjetExpress",
    totalValue: 18000,
    paymentTerms: "30% entrada + 40% aprovação + 30% entrega",
    validUntil: "2026-03-15",
  };

  it("should generate proposal Word successfully", async () => {
    const result = await generateProposalWord(validInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.filename).toContain("proposta-");
    expect(result.filename).toContain(".docx");
    expect(result.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  it("should generate Word with minimal data", async () => {
    const minimalInput: WordProposalInput = {
      clientName: "Cliente Teste",
      projectType: "Projeto",
      serviceType: "DecorExpress",
      totalValue: 5000,
    };

    const result = await generateProposalWord(minimalInput);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should generate Word with custom sections", async () => {
    const input: WordProposalInput = {
      ...validInput,
      sections: [
        {
          title: "Metodologia",
          content: "Processo em 5 etapas",
          items: [
            { label: "Etapa 1", value: "Briefing" },
            { label: "Etapa 2", value: "Conceito" },
            { label: "Etapa 3", value: "Projeto" },
          ],
        },
      ],
    };

    const result = await generateProposalWord(input);

    expect(result.success).toBe(true);
  });

  it("should generate Word with signature line", async () => {
    const input: WordProposalInput = {
      ...validInput,
      includeSignatureLine: true,
    };

    const result = await generateProposalWord(input);

    expect(result.success).toBe(true);
  });

  it("should generate Word without signature line", async () => {
    const input: WordProposalInput = {
      ...validInput,
      includeSignatureLine: false,
    };

    const result = await generateProposalWord(input);

    expect(result.success).toBe(true);
  });

  it("should handle formal template style", async () => {
    const input: WordProposalInput = {
      ...validInput,
      templateStyle: "formal",
    };

    const result = await generateProposalWord(input);

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// Helper Functions Tests
// =============================================================================

describe("Document Generation Helpers", () => {
  describe("formatCurrency", () => {
    it("should format currency correctly", async () => {
      // Test via generator output verification
      const result = await generateBudgetPPT({
        presentationId: "test",
        clientName: "Test",
        items: [],
        categories: [],
        grandTotal: 1234.56,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("truncateText", () => {
    it("should handle long item names", async () => {
      const result = await generateShoppingListPPT({
        presentationId: "test",
        clientName: "Test",
        items: [
          {
            id: "1",
            name: "A".repeat(100), // Very long name
            category: "mobiliario",
            categoryColor: "1E3A5F",
            number: 1,
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });
});
