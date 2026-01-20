import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the presentations module
vi.mock("@/modules/presentations", () => ({
  getPresentationById: vi.fn(),
  getAllImages: vi.fn(),
  getItems: vi.fn(),
  getItemsByCategory: vi.fn(),
}));

// Mock the documents module generators
vi.mock("@/modules/documents", () => ({
  generatePresentationPPT: vi.fn(),
  generateShoppingListPPT: vi.fn(),
  generateBudgetPPT: vi.fn(),
  generateBudgetExcel: vi.fn(),
  generateTechnicalDetailingPPT: vi.fn(),
  generateProposalPDF: vi.fn(),
  generateProposalWord: vi.fn(),
  CATEGORY_COLORS: {
    moveis: "8B5CF6",
    iluminacao: "F59E0B",
    decoracao: "EC4899",
    revestimentos: "3B82F6",
    eletrodomesticos: "6B7280",
  },
}));

// Mock Supabase client
const mockUser = { id: "user-123" };
const mockSupabaseAuth = {
  getUser: vi.fn().mockResolvedValue({
    data: { user: mockUser },
    error: null,
  }),
};

vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}));

// Import route handlers after mocking
import { POST as POST_PPT } from "@/app/api/documents/presentations/[id]/ppt/route";
import { POST as POST_SHOPPING_LIST } from "@/app/api/documents/presentations/[id]/shopping-list/route";
import { POST as POST_BUDGET } from "@/app/api/documents/presentations/[id]/budget/route";
import { POST as POST_DETAILING } from "@/app/api/documents/presentations/[id]/detailing/route";
import { POST as POST_PROPOSAL } from "@/app/api/documents/proposals/route";

import * as presentationsModule from "@/modules/presentations";
import * as documentsModule from "@/modules/documents";

const mockPresentations = presentationsModule as unknown as {
  getPresentationById: ReturnType<typeof vi.fn>;
  getAllImages: ReturnType<typeof vi.fn>;
  getItems: ReturnType<typeof vi.fn>;
  getItemsByCategory: ReturnType<typeof vi.fn>;
};

const mockDocuments = documentsModule as unknown as {
  generatePresentationPPT: ReturnType<typeof vi.fn>;
  generateShoppingListPPT: ReturnType<typeof vi.fn>;
  generateBudgetPPT: ReturnType<typeof vi.fn>;
  generateBudgetExcel: ReturnType<typeof vi.fn>;
  generateTechnicalDetailingPPT: ReturnType<typeof vi.fn>;
  generateProposalPDF: ReturnType<typeof vi.fn>;
  generateProposalWord: ReturnType<typeof vi.fn>;
};

// Sample data
const samplePresentation = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  code: "APRES-25001",
  status: "active",
  client_data: {
    name: "Maria Silva",
    clientName: "Maria Silva",
    address: "Rua Test, 123",
    project_type: "Decoração Residencial",
  },
  created_at: "2025-01-15T10:00:00.000Z",
};

const sampleImages = {
  photos_before: [
    { id: "img-1", image_url: "https://example.com/before.jpg", display_order: 0 },
  ],
  moodboard: [
    { id: "img-2", image_url: "https://example.com/moodboard.jpg", display_order: 0 },
  ],
  renders: [
    { id: "img-3", image_url: "https://example.com/render.jpg", display_order: 0 },
  ],
};

const sampleItems = [
  {
    id: "item-1",
    name: "Sofá 3 lugares",
    category: "moveis",
    ambiente: "Sala",
    number: 1,
    product: {
      quantidade: 1,
      unidade: "un",
      valorProduto: 2500,
      fornecedor: "MadeiraMadeira",
      imagem: "https://example.com/sofa.jpg",
    },
  },
  {
    id: "item-2",
    name: "Luminária pendente",
    category: "iluminacao",
    ambiente: "Sala",
    number: 2,
    product: {
      quantidade: 3,
      unidade: "un",
      valorProduto: 450,
      fornecedor: "Lumini",
    },
  },
];

const sampleItemsByCategory = {
  moveis: [sampleItems[0]],
  iluminacao: [sampleItems[1]],
};

const mockGeneratorResult = {
  success: true,
  data: Buffer.from("mock-file-content"),
  filename: "test-document.pptx",
  mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

describe("Documents API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // POST /api/documents/presentations/[id]/ppt
  // ===========================================================================
  describe("POST /api/documents/presentations/[id]/ppt", () => {
    const createRequest = (id: string, body: unknown = {}) => {
      return new NextRequest(
        `http://localhost:3000/api/documents/presentations/${id}/ppt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    it("should generate presentation PPT successfully", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getAllImages.mockResolvedValue({
        data: sampleImages,
        error: null,
      });
      mockDocuments.generatePresentationPPT.mockResolvedValue(mockGeneratorResult);

      const response = await POST_PPT(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("presentationml.presentation");
      expect(response.headers.get("Content-Disposition")).toContain("attachment");
      expect(mockDocuments.generatePresentationPPT).toHaveBeenCalled();
    });

    it("should return 401 when not authenticated", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const response = await POST_PPT(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when presentation not found", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: null,
        error: "Presentation not found",
      });

      const response = await POST_PPT(
        createRequest("non-existent-id"),
        { params: Promise.resolve({ id: "non-existent-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });

    it("should return 400 when images fetch fails", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getAllImages.mockResolvedValue({
        data: null,
        error: "Images fetch failed",
      });

      const response = await POST_PPT(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Images fetch failed");
    });

    it("should return 500 when generator fails", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getAllImages.mockResolvedValue({
        data: sampleImages,
        error: null,
      });
      mockDocuments.generatePresentationPPT.mockResolvedValue({
        success: false,
        error: "Generator error",
      });

      const response = await POST_PPT(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Generator error");
    });

    it("should pass body options to generator", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getAllImages.mockResolvedValue({
        data: sampleImages,
        error: null,
      });
      mockDocuments.generatePresentationPPT.mockResolvedValue(mockGeneratorResult);

      const body = {
        includePhotosBefore: false,
        includeMoodboard: true,
        includeRenders: true,
        logoUrl: "https://example.com/logo.png",
      };

      await POST_PPT(
        createRequest(samplePresentation.id, body),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(mockDocuments.generatePresentationPPT).toHaveBeenCalledWith(
        expect.objectContaining({
          includePhotosBefore: false,
          includeMoodboard: true,
          includeRenders: true,
          logoUrl: "https://example.com/logo.png",
        })
      );
    });
  });

  // ===========================================================================
  // POST /api/documents/presentations/[id]/shopping-list
  // ===========================================================================
  describe("POST /api/documents/presentations/[id]/shopping-list", () => {
    const createRequest = (id: string, body: unknown = {}) => {
      return new NextRequest(
        `http://localhost:3000/api/documents/presentations/${id}/shopping-list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    it("should generate shopping list PPT successfully", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItems.mockResolvedValue({
        data: sampleItems,
        error: null,
      });
      mockDocuments.generateShoppingListPPT.mockResolvedValue(mockGeneratorResult);

      const response = await POST_SHOPPING_LIST(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("presentationml.presentation");
      expect(mockDocuments.generateShoppingListPPT).toHaveBeenCalled();
    });

    it("should return 401 when not authenticated", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const response = await POST_SHOPPING_LIST(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when presentation not found", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: null,
        error: "Presentation not found",
      });

      const response = await POST_SHOPPING_LIST(
        createRequest("non-existent-id"),
        { params: Promise.resolve({ id: "non-existent-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
    });

    it("should return 400 when items fetch fails", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItems.mockResolvedValue({
        data: null,
        error: "Items fetch failed",
      });

      const response = await POST_SHOPPING_LIST(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Items fetch failed");
    });

    it("should pass grouping options to generator", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItems.mockResolvedValue({
        data: sampleItems,
        error: null,
      });
      mockDocuments.generateShoppingListPPT.mockResolvedValue(mockGeneratorResult);

      const body = {
        groupByCategory: false,
        groupByAmbiente: true,
        includeImages: false,
        includePrices: true,
      };

      await POST_SHOPPING_LIST(
        createRequest(samplePresentation.id, body),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(mockDocuments.generateShoppingListPPT).toHaveBeenCalledWith(
        expect.objectContaining({
          groupByCategory: false,
          groupByAmbiente: true,
          includeImages: false,
          includePrices: true,
        })
      );
    });
  });

  // ===========================================================================
  // POST /api/documents/presentations/[id]/budget
  // ===========================================================================
  describe("POST /api/documents/presentations/[id]/budget", () => {
    const createRequest = (id: string, body: unknown = {}) => {
      return new NextRequest(
        `http://localhost:3000/api/documents/presentations/${id}/budget`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    it("should generate budget PPT by default", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItemsByCategory.mockResolvedValue({
        data: sampleItemsByCategory,
        error: null,
      });
      mockDocuments.generateBudgetPPT.mockResolvedValue(mockGeneratorResult);

      const response = await POST_BUDGET(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(response.status).toBe(200);
      expect(mockDocuments.generateBudgetPPT).toHaveBeenCalled();
      expect(mockDocuments.generateBudgetExcel).not.toHaveBeenCalled();
    });

    it("should generate budget Excel when format=xlsx", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItemsByCategory.mockResolvedValue({
        data: sampleItemsByCategory,
        error: null,
      });
      mockDocuments.generateBudgetExcel.mockResolvedValue({
        ...mockGeneratorResult,
        filename: "budget.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const response = await POST_BUDGET(
        createRequest(samplePresentation.id, { format: "xlsx" }),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("spreadsheetml.sheet");
      expect(mockDocuments.generateBudgetExcel).toHaveBeenCalled();
      expect(mockDocuments.generateBudgetPPT).not.toHaveBeenCalled();
    });

    it("should return 401 when not authenticated", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const response = await POST_BUDGET(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when presentation not found", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: null,
        error: "Presentation not found",
      });

      const response = await POST_BUDGET(
        createRequest("non-existent-id"),
        { params: Promise.resolve({ id: "non-existent-id" }) }
      );

      expect(response.status).toBe(404);
    });

    it("should return 400 when items fetch fails", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItemsByCategory.mockResolvedValue({
        data: null,
        error: "Items fetch failed",
      });

      const response = await POST_BUDGET(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Items fetch failed");
    });

    it("should calculate grand total correctly", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItemsByCategory.mockResolvedValue({
        data: sampleItemsByCategory,
        error: null,
      });
      mockDocuments.generateBudgetPPT.mockResolvedValue(mockGeneratorResult);

      await POST_BUDGET(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      // Item 1: 1 * 2500 = 2500
      // Item 2: 3 * 450 = 1350
      // Total: 3850
      expect(mockDocuments.generateBudgetPPT).toHaveBeenCalledWith(
        expect.objectContaining({
          grandTotal: 3850,
        })
      );
    });
  });

  // ===========================================================================
  // POST /api/documents/presentations/[id]/detailing
  // ===========================================================================
  describe("POST /api/documents/presentations/[id]/detailing", () => {
    const createRequest = (id: string, body: unknown = {}) => {
      return new NextRequest(
        `http://localhost:3000/api/documents/presentations/${id}/detailing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    it("should generate technical detailing PPT successfully", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItems.mockResolvedValue({
        data: sampleItems,
        error: null,
      });
      mockDocuments.generateTechnicalDetailingPPT.mockResolvedValue(mockGeneratorResult);

      const response = await POST_DETAILING(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("presentationml.presentation");
      expect(mockDocuments.generateTechnicalDetailingPPT).toHaveBeenCalled();
    });

    it("should return 401 when not authenticated", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const response = await POST_DETAILING(
        createRequest(samplePresentation.id),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when presentation not found", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: null,
        error: "Presentation not found",
      });

      const response = await POST_DETAILING(
        createRequest("non-existent-id"),
        { params: Promise.resolve({ id: "non-existent-id" }) }
      );

      expect(response.status).toBe(404);
    });

    it("should pass grouping options to generator", async () => {
      mockPresentations.getPresentationById.mockResolvedValue({
        data: samplePresentation,
        error: null,
      });
      mockPresentations.getItems.mockResolvedValue({
        data: sampleItems,
        error: null,
      });
      mockDocuments.generateTechnicalDetailingPPT.mockResolvedValue(mockGeneratorResult);

      const body = {
        groupByAmbiente: false,
        includeDrawings: false,
      };

      await POST_DETAILING(
        createRequest(samplePresentation.id, body),
        { params: Promise.resolve({ id: samplePresentation.id }) }
      );

      expect(mockDocuments.generateTechnicalDetailingPPT).toHaveBeenCalledWith(
        expect.objectContaining({
          groupByAmbiente: false,
          includeDrawings: false,
        })
      );
    });
  });

  // ===========================================================================
  // POST /api/documents/proposals
  // ===========================================================================
  describe("POST /api/documents/proposals", () => {
    const createRequest = (body: unknown) => {
      return new NextRequest("http://localhost:3000/api/documents/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };

    const validProposalData = {
      clientName: "Maria Silva",
      projectType: "Decoração Residencial",
      serviceType: "Consultoria de Decoração",
      totalValue: 15000,
    };

    it("should generate PDF proposal by default", async () => {
      mockDocuments.generateProposalPDF.mockResolvedValue({
        ...mockGeneratorResult,
        filename: "proposta.pdf",
        mimeType: "application/pdf",
      });

      const response = await POST_PROPOSAL(createRequest(validProposalData));

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(mockDocuments.generateProposalPDF).toHaveBeenCalled();
      expect(mockDocuments.generateProposalWord).not.toHaveBeenCalled();
    });

    it("should generate Word proposal when format=docx", async () => {
      mockDocuments.generateProposalWord.mockResolvedValue({
        ...mockGeneratorResult,
        filename: "proposta.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const response = await POST_PROPOSAL(
        createRequest({ ...validProposalData, format: "docx" })
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("wordprocessingml.document");
      expect(mockDocuments.generateProposalWord).toHaveBeenCalled();
      expect(mockDocuments.generateProposalPDF).not.toHaveBeenCalled();
    });

    it("should return 401 when not authenticated", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const response = await POST_PROPOSAL(createRequest(validProposalData));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 for missing required fields", async () => {
      const invalidData = {
        clientName: "Maria Silva",
        // missing projectType, serviceType, totalValue
      };

      const response = await POST_PROPOSAL(createRequest(invalidData));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("should return 400 for invalid email", async () => {
      const invalidData = {
        ...validProposalData,
        clientEmail: "invalid-email",
      };

      const response = await POST_PROPOSAL(createRequest(invalidData));
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should return 400 for negative totalValue", async () => {
      const invalidData = {
        ...validProposalData,
        totalValue: -1000,
      };

      const response = await POST_PROPOSAL(createRequest(invalidData));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("positive");
    });

    it("should return 500 when PDF generator fails", async () => {
      mockDocuments.generateProposalPDF.mockResolvedValue({
        success: false,
        error: "PDF generation failed",
      });

      const response = await POST_PROPOSAL(createRequest(validProposalData));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("PDF generation failed");
    });

    it("should return 500 when Word generator fails", async () => {
      mockDocuments.generateProposalWord.mockResolvedValue({
        success: false,
        error: "Word generation failed",
      });

      const response = await POST_PROPOSAL(
        createRequest({ ...validProposalData, format: "docx" })
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Word generation failed");
    });

    it("should pass all optional fields to generator", async () => {
      mockDocuments.generateProposalPDF.mockResolvedValue({
        ...mockGeneratorResult,
        filename: "proposta.pdf",
        mimeType: "application/pdf",
      });

      const fullData = {
        ...validProposalData,
        clientEmail: "maria@test.com",
        clientPhone: "11999999999",
        clientAddress: "Rua Test, 123",
        projectDescription: "Projeto completo de decoração",
        paymentTerms: "50% entrada + 50% na entrega",
        validUntil: "2025-02-15",
        sections: [
          { title: "Escopo", content: "Decoração completa" },
        ],
        includeTerms: true,
        includeSignatureLine: true,
        logoUrl: "https://example.com/logo.png",
        templateStyle: "formal" as const,
      };

      await POST_PROPOSAL(createRequest(fullData));

      expect(mockDocuments.generateProposalPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          clientName: "Maria Silva",
          clientEmail: "maria@test.com",
          clientPhone: "11999999999",
          clientAddress: "Rua Test, 123",
          projectType: "Decoração Residencial",
          projectDescription: "Projeto completo de decoração",
          serviceType: "Consultoria de Decoração",
          totalValue: 15000,
          paymentTerms: "50% entrada + 50% na entrega",
          includeTerms: true,
        })
      );
    });

    it("should validate templateStyle enum", async () => {
      const invalidData = {
        ...validProposalData,
        templateStyle: "invalid-style",
      };

      const response = await POST_PROPOSAL(createRequest(invalidData));
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });
});
