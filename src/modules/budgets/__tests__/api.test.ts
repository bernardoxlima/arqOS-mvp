import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the service module
vi.mock("@/modules/budgets/services/budgets.service", () => ({
  listBudgets: vi.fn(),
  getBudgetById: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
  countBudgets: vi.fn(),
  addBudgetItem: vi.fn(),
  updateBudgetItem: vi.fn(),
  removeBudgetItem: vi.fn(),
}));

// Import route handlers after mocking
import { GET, POST } from "@/app/api/budgets/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/budgets/[id]/route";
import {
  POST as POST_ITEM,
  PUT as PUT_ITEM,
  DELETE as DELETE_ITEM,
} from "@/app/api/budgets/[id]/items/route";
import * as budgetsService from "@/modules/budgets/services/budgets.service";

const mockService = budgetsService as unknown as {
  listBudgets: ReturnType<typeof vi.fn>;
  getBudgetById: ReturnType<typeof vi.fn>;
  createBudget: ReturnType<typeof vi.fn>;
  updateBudget: ReturnType<typeof vi.fn>;
  deleteBudget: ReturnType<typeof vi.fn>;
  countBudgets: ReturnType<typeof vi.fn>;
  addBudgetItem: ReturnType<typeof vi.fn>;
  updateBudgetItem: ReturnType<typeof vi.fn>;
  removeBudgetItem: ReturnType<typeof vi.fn>;
};

// Sample budget data for testing
const sampleBudget = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  organization_id: "org-123",
  code: "PROP-25001",
  client_id: "client-123",
  service_type: "decorexpress",
  status: "draft",
  details: {
    area: 100,
    rooms: 2,
    room_list: ["Sala", "Quarto"],
    complexity: "padrao",
    finish: "padrao",
    modality: "presencial",
    project_type: "novo",
    items: [],
  },
  calculation: {
    base_price: 5000,
    multipliers: { complexity: 1.0, finish: 1.0 },
    extras_total: 0,
    survey_fee: 0,
    discount: 0,
    final_price: 5000,
    estimated_hours: 20,
    hour_rate: 250,
    efficiency: "Ótimo",
    price_per_m2: 50,
    items_total: 0,
  },
  payment_terms: {
    type: "30_30_40",
    installments: [
      { percent: 30, description: "Assinatura do contrato" },
      { percent: 30, description: "Entrega do anteprojeto" },
      { percent: 40, description: "Entrega do projeto final" },
    ],
    validity_days: 15,
  },
  scope: null,
  notes: null,
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:00:00.000Z",
  created_by: "profile-123",
  client: {
    id: "client-123",
    name: "Maria Silva",
    contact: { email: "maria@test.com", phone: "11999999999" },
  },
};

describe("Budgets API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // GET /api/budgets
  // ===========================================================================
  describe("GET /api/budgets", () => {
    const createRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL("http://localhost:3000/api/budgets");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return new NextRequest(url);
    };

    it("should return empty list when no budgets", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it("should return budgets with pagination", async () => {
      const budgets = [sampleBudget];
      mockService.listBudgets.mockResolvedValue({ data: budgets, error: null });
      mockService.countBudgets.mockResolvedValue({ data: 1, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(1);
    });

    it("should filter by status", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ status: "approved" }));

      expect(mockService.listBudgets).toHaveBeenCalledWith(
        expect.objectContaining({ status: "approved" })
      );
    });

    it("should filter by serviceType", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ serviceType: "decorexpress" }));

      expect(mockService.listBudgets).toHaveBeenCalledWith(
        expect.objectContaining({ serviceType: "decorexpress" })
      );
    });

    it("should filter by clientId", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      await GET(
        createRequest({ clientId: "550e8400-e29b-41d4-a716-446655440000" })
      );

      expect(mockService.listBudgets).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: "550e8400-e29b-41d4-a716-446655440000",
        })
      );
    });

    it("should filter by search term", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ search: "PROP-25001" }));

      expect(mockService.listBudgets).toHaveBeenCalledWith(
        expect.objectContaining({ search: "PROP-25001" })
      );
    });

    it("should return 400 for invalid status filter", async () => {
      const response = await GET(createRequest({ status: "invalid_status" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Filtros inválidos");
    });

    it("should return 400 for invalid serviceType filter", async () => {
      const response = await GET(
        createRequest({ serviceType: "invalid_service" })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Filtros inválidos");
    });

    it("should return 500 when service returns error", async () => {
      mockService.listBudgets.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database error");
    });

    it("should apply pagination parameters", async () => {
      mockService.listBudgets.mockResolvedValue({ data: [], error: null });
      mockService.countBudgets.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ limit: "10", offset: "20" }));

      expect(mockService.listBudgets).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 })
      );
    });

    it("should calculate hasMore correctly", async () => {
      mockService.listBudgets.mockResolvedValue({
        data: [sampleBudget],
        error: null,
      });
      mockService.countBudgets.mockResolvedValue({ data: 50, error: null });

      const response = await GET(createRequest({ limit: "10", offset: "0" }));
      const data = await response.json();

      expect(data.pagination.hasMore).toBe(true);
    });
  });

  // ===========================================================================
  // POST /api/budgets
  // ===========================================================================
  describe("POST /api/budgets", () => {
    const createRequest = (body: unknown) => {
      return new NextRequest("http://localhost:3000/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };

    it("should create budget with minimal data", async () => {
      mockService.createBudget.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const response = await POST(
        createRequest({ serviceType: "decorexpress" })
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.code).toBe("PROP-25001");
      expect(mockService.createBudget).toHaveBeenCalled();
    });

    it("should create budget with all fields", async () => {
      mockService.createBudget.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const fullData = {
        serviceType: "decorexpress",
        clientId: "550e8400-e29b-41d4-a716-446655440000",
        details: {
          area: 100,
          rooms: 2,
          room_list: ["Sala", "Quarto"],
          complexity: "padrao",
          finish: "alto_padrao",
        },
        calculation: {
          base_price: 5000,
        },
        notes: "Test notes",
      };

      const response = await POST(createRequest(fullData));

      expect(response.status).toBe(201);
      expect(mockService.createBudget).toHaveBeenCalledWith(fullData);
    });

    it("should return 400 for invalid serviceType", async () => {
      const response = await POST(
        createRequest({ serviceType: "invalid_type" })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });

    it("should return 400 for invalid clientId format", async () => {
      const response = await POST(
        createRequest({
          serviceType: "decorexpress",
          clientId: "invalid-uuid",
        })
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });

    it("should return 401 when not authenticated", async () => {
      mockService.createBudget.mockResolvedValue({
        data: null,
        error: { message: "Usuário não autenticado", code: "UNAUTHENTICATED" },
      });

      const response = await POST(
        createRequest({ serviceType: "decorexpress" })
      );
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Usuário não autenticado");
    });

    it("should return 400 for missing serviceType", async () => {
      const response = await POST(createRequest({}));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });

    it("should validate all service types", async () => {
      const validServiceTypes = [
        "arquitetonico",
        "interiores",
        "decoracao",
        "reforma",
        "comercial",
        "decorexpress",
        "producao",
        "projetexpress",
      ];

      for (const serviceType of validServiceTypes) {
        vi.clearAllMocks();
        mockService.createBudget.mockResolvedValue({
          data: { ...sampleBudget, service_type: serviceType },
          error: null,
        });

        const response = await POST(createRequest({ serviceType }));
        expect(response.status).toBe(201);
      }
    });
  });

  // ===========================================================================
  // GET /api/budgets/[id]
  // ===========================================================================
  describe("GET /api/budgets/[id]", () => {
    const createRequest = (id: string) => {
      return new NextRequest(`http://localhost:3000/api/budgets/${id}`);
    };

    it("should return budget by ID", async () => {
      mockService.getBudgetById.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const response = await GET_BY_ID(
        createRequest(sampleBudget.id),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(sampleBudget.id);
      expect(data.client).toBeDefined();
    });

    it("should return 404 for non-existent budget", async () => {
      mockService.getBudgetById.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      const response = await GET_BY_ID(
        createRequest("550e8400-e29b-41d4-a716-446655440001"),
        { params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Orçamento não encontrado");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await GET_BY_ID(
        createRequest("invalid-id"),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID inválido");
    });
  });

  // ===========================================================================
  // PUT /api/budgets/[id]
  // ===========================================================================
  describe("PUT /api/budgets/[id]", () => {
    const createRequest = (id: string, body: unknown) => {
      return new NextRequest(`http://localhost:3000/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };

    it("should update budget status", async () => {
      const updatedBudget = { ...sampleBudget, status: "sent" };
      mockService.updateBudget.mockResolvedValue({
        data: updatedBudget,
        error: null,
      });

      const response = await PUT(
        createRequest(sampleBudget.id, { status: "sent" }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("sent");
    });

    it("should update budget details (merge JSONB)", async () => {
      mockService.updateBudget.mockResolvedValue({
        data: { ...sampleBudget, details: { ...sampleBudget.details, area: 150 } },
        error: null,
      });

      const response = await PUT(
        createRequest(sampleBudget.id, { details: { area: 150 } }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(response.status).toBe(200);
      expect(mockService.updateBudget).toHaveBeenCalledWith(
        sampleBudget.id,
        { details: { area: 150 } }
      );
    });

    it("should update budget calculation", async () => {
      mockService.updateBudget.mockResolvedValue({
        data: { ...sampleBudget, calculation: { ...sampleBudget.calculation, final_price: 6000 } },
        error: null,
      });

      const response = await PUT(
        createRequest(sampleBudget.id, { calculation: { final_price: 6000 } }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent budget", async () => {
      mockService.updateBudget.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      const response = await PUT(
        createRequest("550e8400-e29b-41d4-a716-446655440001", { status: "sent" }),
        { params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Orçamento não encontrado");
    });

    it("should return 400 for invalid status value", async () => {
      const response = await PUT(
        createRequest(sampleBudget.id, { status: "invalid_status" }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });
  });

  // ===========================================================================
  // DELETE /api/budgets/[id]
  // ===========================================================================
  describe("DELETE /api/budgets/[id]", () => {
    const createRequest = (id: string) => {
      return new NextRequest(`http://localhost:3000/api/budgets/${id}`, {
        method: "DELETE",
      });
    };

    it("should delete existing budget", async () => {
      mockService.deleteBudget.mockResolvedValue({ data: null, error: null });

      const response = await DELETE(
        createRequest(sampleBudget.id),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 500 when delete fails", async () => {
      mockService.deleteBudget.mockResolvedValue({
        data: null,
        error: { message: "Delete failed" },
      });

      const response = await DELETE(
        createRequest(sampleBudget.id),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Delete failed");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await DELETE(
        createRequest("invalid-id"),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID inválido");
    });
  });

  // ===========================================================================
  // POST /api/budgets/[id]/items
  // ===========================================================================
  describe("POST /api/budgets/[id]/items", () => {
    const createRequest = (budgetId: string, body: unknown) => {
      return new NextRequest(
        `http://localhost:3000/api/budgets/${budgetId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    const validItemData = {
      fornecedor: "Loja ABC",
      descricao: "Sofá 3 lugares",
      quantidade: 1,
      valorProduto: 2500,
    };

    // Data after schema transformation (with defaults)
    const transformedItemData = {
      ...validItemData,
      unidade: "Qt.",
      valorInstalacao: 0,
      valorFrete: 0,
      valorExtras: 0,
    };

    const validItemId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

    it("should add item with valid data", async () => {
      const budgetWithItem = {
        ...sampleBudget,
        details: {
          ...sampleBudget.details,
          items: [{ ...transformedItemData, id: validItemId, valorCompleto: 2500 }],
        },
      };
      mockService.addBudgetItem.mockResolvedValue({
        data: budgetWithItem,
        error: null,
      });

      const response = await POST_ITEM(
        createRequest(sampleBudget.id, validItemData),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockService.addBudgetItem).toHaveBeenCalledWith(
        sampleBudget.id,
        transformedItemData
      );
    });

    it("should calculate valorCompleto automatically", async () => {
      mockService.addBudgetItem.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const itemWithExtras = {
        fornecedor: "Loja ABC",
        descricao: "Sofá 3 lugares",
        quantidade: 2,
        valorProduto: 1000,
        valorInstalacao: 100,
        valorFrete: 50,
      };

      // Expected data after schema transformation
      const expectedData = {
        ...itemWithExtras,
        unidade: "Qt.",
        valorExtras: 0,
      };

      await POST_ITEM(
        createRequest(sampleBudget.id, itemWithExtras),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(mockService.addBudgetItem).toHaveBeenCalledWith(
        sampleBudget.id,
        expectedData
      );
    });

    it("should update items_total in calculation", async () => {
      const budgetWithItemTotal = {
        ...sampleBudget,
        calculation: { ...sampleBudget.calculation, items_total: 2500 },
      };
      mockService.addBudgetItem.mockResolvedValue({
        data: budgetWithItemTotal,
        error: null,
      });

      const response = await POST_ITEM(
        createRequest(sampleBudget.id, validItemData),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(data.calculation.items_total).toBe(2500);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await POST_ITEM(
        createRequest(sampleBudget.id, { fornecedor: "Loja" }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados do item inválidos");
    });

    it("should return 404 for non-existent budget", async () => {
      mockService.addBudgetItem.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      const response = await POST_ITEM(
        createRequest("550e8400-e29b-41d4-a716-446655440001", validItemData),
        { params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Orçamento não encontrado");
    });

    it("should return 400 for invalid budget ID", async () => {
      const response = await POST_ITEM(
        createRequest("invalid-id", validItemData),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID do orçamento inválido");
    });
  });

  // ===========================================================================
  // PUT /api/budgets/[id]/items
  // ===========================================================================
  describe("PUT /api/budgets/[id]/items", () => {
    const createRequest = (budgetId: string, body: unknown) => {
      return new NextRequest(
        `http://localhost:3000/api/budgets/${budgetId}/items`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    // Valid UUID v4 for item tests
    const validItemId = "123e4567-e89b-42d3-a456-426614174000";

    it("should update existing item", async () => {
      mockService.updateBudgetItem.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const updateData = {
        id: validItemId,
        quantidade: 3,
        valorProduto: 1500,
      };

      const response = await PUT_ITEM(
        createRequest(sampleBudget.id, updateData),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(response.status).toBe(200);
      expect(mockService.updateBudgetItem).toHaveBeenCalledWith(
        sampleBudget.id,
        updateData
      );
    });

    it("should recalculate valorCompleto on update", async () => {
      mockService.updateBudgetItem.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      await PUT_ITEM(
        createRequest(sampleBudget.id, { id: validItemId, quantidade: 5 }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(mockService.updateBudgetItem).toHaveBeenCalled();
    });

    it("should return 404 for non-existent item", async () => {
      mockService.updateBudgetItem.mockResolvedValue({
        data: null,
        error: { message: "Item não encontrado", code: "NOT_FOUND" },
      });

      const nonExistentId = "223e4567-e89b-42d3-a456-426614174001";
      const response = await PUT_ITEM(
        createRequest(sampleBudget.id, { id: nonExistentId, quantidade: 1 }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Item não encontrado");
    });

    it("should return 400 for missing item id", async () => {
      const response = await PUT_ITEM(
        createRequest(sampleBudget.id, { quantidade: 5 }),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados do item inválidos");
    });
  });

  // ===========================================================================
  // DELETE /api/budgets/[id]/items
  // ===========================================================================
  describe("DELETE /api/budgets/[id]/items", () => {
    // Valid UUID v4 for delete tests
    const validItemId = "323e4567-e89b-42d3-a456-426614174002";

    const createRequest = (budgetId: string, itemId: string) => {
      const url = new URL(
        `http://localhost:3000/api/budgets/${budgetId}/items`
      );
      url.searchParams.set("itemId", itemId);
      return new NextRequest(url, { method: "DELETE" });
    };

    it("should remove existing item", async () => {
      mockService.removeBudgetItem.mockResolvedValue({
        data: sampleBudget,
        error: null,
      });

      const response = await DELETE_ITEM(
        createRequest(sampleBudget.id, validItemId),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should recalculate items_total after removal", async () => {
      mockService.removeBudgetItem.mockResolvedValue({
        data: { ...sampleBudget, calculation: { ...sampleBudget.calculation, items_total: 0 } },
        error: null,
      });

      await DELETE_ITEM(
        createRequest(sampleBudget.id, validItemId),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );

      expect(mockService.removeBudgetItem).toHaveBeenCalledWith(
        sampleBudget.id,
        validItemId
      );
    });

    it("should return 404 for non-existent item", async () => {
      mockService.removeBudgetItem.mockResolvedValue({
        data: null,
        error: { message: "Item não encontrado", code: "NOT_FOUND" },
      });

      const nonExistentId = "423e4567-e89b-42d3-a456-426614174003";
      const response = await DELETE_ITEM(
        createRequest(sampleBudget.id, nonExistentId),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Item não encontrado");
    });

    it("should return 400 for missing itemId query param", async () => {
      const url = new URL(
        `http://localhost:3000/api/budgets/${sampleBudget.id}/items`
      );
      const request = new NextRequest(url, { method: "DELETE" });

      const response = await DELETE_ITEM(
        request,
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID do item inválido");
    });

    it("should return 400 for invalid budget ID", async () => {
      const response = await DELETE_ITEM(
        createRequest("invalid-id", validItemId),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID do orçamento inválido");
    });

    it("should return 400 for invalid item ID format", async () => {
      const response = await DELETE_ITEM(
        createRequest(sampleBudget.id, "invalid-item-id"),
        { params: Promise.resolve({ id: sampleBudget.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID do item inválido");
    });
  });
});
