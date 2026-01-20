import { describe, it, expect } from "vitest";
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetFiltersSchema,
  addBudgetItemSchema,
  updateBudgetItemSchema,
  uuidParamSchema,
  itemIdSchema,
} from "../schemas";

describe("Budget Schemas", () => {
  // =========================================================================
  // createBudgetSchema
  // =========================================================================
  describe("createBudgetSchema", () => {
    it("should validate minimal valid budget (only serviceType)", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
      });
      expect(result.success).toBe(true);
    });

    it("should validate all service types", () => {
      const serviceTypes = [
        "arquitetonico",
        "interiores",
        "decoracao",
        "reforma",
        "comercial",
        "decorexpress",
        "producao",
        "projetexpress",
      ];

      serviceTypes.forEach((type) => {
        const result = createBudgetSchema.safeParse({ serviceType: type });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid service type", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "invalid_type",
      });
      expect(result.success).toBe(false);
    });

    it("should validate budget with clientId", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        clientId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid clientId format", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        clientId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should validate budget with details", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        details: {
          area: 100,
          rooms: 3,
          room_list: ["Sala", "Quarto", "Cozinha"],
          complexity: "padrao",
          finish: "alto_padrao",
          modality: "presencial",
          project_type: "novo",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate budget with calculation", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        calculation: {
          base_price: 5000,
          multipliers: { complexity: 1.2, finish: 1.1 },
          final_price: 6600,
          estimated_hours: 40,
          hour_rate: 165,
          efficiency: "Ótimo",
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate budget with payment terms", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        paymentTerms: {
          type: "30_30_40",
          installments: [
            { percent: 30, description: "Assinatura" },
            { percent: 30, description: "Anteprojeto" },
            { percent: 40, description: "Entrega" },
          ],
          validity_days: 15,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate budget with scope", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        scope: ["Design de interiores", "Mobiliário", "Iluminação"],
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty scope items", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        scope: ["Design", "", "Iluminação"],
      });
      expect(result.success).toBe(false);
    });

    it("should validate budget with notes", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        notes: "Observações do orçamento",
      });
      expect(result.success).toBe(true);
    });

    it("should reject notes exceeding 2000 characters", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "decorexpress",
        notes: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("should validate full budget creation data", () => {
      const result = createBudgetSchema.safeParse({
        serviceType: "interiores",
        clientId: "550e8400-e29b-41d4-a716-446655440000",
        details: {
          area: 150,
          rooms: 5,
          complexity: "complexo",
          finish: "alto_padrao",
        },
        calculation: {
          base_price: 15000,
          final_price: 22500,
        },
        paymentTerms: {
          type: "50_50",
          validity_days: 30,
        },
        scope: ["Projeto completo", "Execução"],
        notes: "Cliente VIP",
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // updateBudgetSchema
  // =========================================================================
  describe("updateBudgetSchema", () => {
    it("should validate empty update (all optional)", () => {
      const result = updateBudgetSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const statuses = ["draft", "sent", "approved", "rejected"];

      statuses.forEach((status) => {
        const result = updateBudgetSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid status", () => {
      const result = updateBudgetSchema.safeParse({
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("should validate clientId update", () => {
      const result = updateBudgetSchema.safeParse({
        clientId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should allow null clientId", () => {
      const result = updateBudgetSchema.safeParse({
        clientId: null,
      });
      expect(result.success).toBe(true);
    });

    it("should validate partial details update", () => {
      const result = updateBudgetSchema.safeParse({
        details: {
          area: 200,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should validate partial calculation update", () => {
      const result = updateBudgetSchema.safeParse({
        calculation: {
          final_price: 10000,
          discount: 500,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should allow null notes", () => {
      const result = updateBudgetSchema.safeParse({
        notes: null,
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // budgetFiltersSchema
  // =========================================================================
  describe("budgetFiltersSchema", () => {
    it("should validate empty filters with defaults", () => {
      const result = budgetFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });

    it("should validate status filter", () => {
      const result = budgetFiltersSchema.safeParse({
        status: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("should validate serviceType filter", () => {
      const result = budgetFiltersSchema.safeParse({
        serviceType: "decorexpress",
      });
      expect(result.success).toBe(true);
    });

    it("should validate clientId filter", () => {
      const result = budgetFiltersSchema.safeParse({
        clientId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should validate search filter", () => {
      const result = budgetFiltersSchema.safeParse({
        search: "PROP-2024",
      });
      expect(result.success).toBe(true);
    });

    it("should validate date filters", () => {
      const result = budgetFiltersSchema.safeParse({
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      });
      expect(result.success).toBe(true);
    });

    it("should coerce limit from string", () => {
      const result = budgetFiltersSchema.safeParse({
        limit: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should coerce offset from string", () => {
      const result = budgetFiltersSchema.safeParse({
        offset: "20",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(20);
      }
    });

    it("should reject limit below 1", () => {
      const result = budgetFiltersSchema.safeParse({
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should reject limit above 100", () => {
      const result = budgetFiltersSchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const result = budgetFiltersSchema.safeParse({
        offset: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should validate all filters combined", () => {
      const result = budgetFiltersSchema.safeParse({
        status: "draft",
        serviceType: "interiores",
        clientId: "550e8400-e29b-41d4-a716-446655440000",
        search: "projeto",
        dateFrom: "2024-01-01",
        dateTo: "2024-06-30",
        limit: "25",
        offset: "10",
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // addBudgetItemSchema
  // =========================================================================
  describe("addBudgetItemSchema", () => {
    it("should validate minimal item (required fields only)", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Tok Stok",
        descricao: "Sofá 3 lugares",
        quantidade: 1,
        valorProduto: 3500,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.unidade).toBe("Qt.");
        expect(result.data.valorInstalacao).toBe(0);
        expect(result.data.valorFrete).toBe(0);
        expect(result.data.valorExtras).toBe(0);
      }
    });

    it("should validate all unit types", () => {
      const units = ["Qt.", "m²", "m", "un", "pç", "cx", "kg", "L"];

      units.forEach((unidade) => {
        const result = addBudgetItemSchema.safeParse({
          fornecedor: "Fornecedor",
          descricao: "Descrição",
          quantidade: 1,
          valorProduto: 100,
          unidade,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject empty fornecedor", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "",
        descricao: "Descrição",
        quantidade: 1,
        valorProduto: 100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty descricao", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Fornecedor",
        descricao: "",
        quantidade: 1,
        valorProduto: 100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero quantidade", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Fornecedor",
        descricao: "Descrição",
        quantidade: 0,
        valorProduto: 100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative valorProduto", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Fornecedor",
        descricao: "Descrição",
        quantidade: 1,
        valorProduto: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should validate item with all optional fields", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Tok Stok",
        descricao: "Mesa de jantar",
        quantidade: 1,
        unidade: "un",
        valorProduto: 2500,
        valorInstalacao: 200,
        valorFrete: 150,
        valorExtras: 50,
        link: "https://tokstok.com.br/mesa",
        subcategoria: "Mesas",
        ambiente: "Sala de Jantar",
        category: "Mobiliário",
      });
      expect(result.success).toBe(true);
    });

    it("should validate item with valid URL link", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Loja",
        descricao: "Produto",
        quantidade: 1,
        valorProduto: 100,
        link: "https://example.com/product",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URL link", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Loja",
        descricao: "Produto",
        quantidade: 1,
        valorProduto: 100,
        link: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("should allow empty string link", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Loja",
        descricao: "Produto",
        quantidade: 1,
        valorProduto: 100,
        link: "",
      });
      expect(result.success).toBe(true);
    });

    it("should validate decimal quantidade", () => {
      const result = addBudgetItemSchema.safeParse({
        fornecedor: "Loja",
        descricao: "Tecido",
        quantidade: 2.5,
        unidade: "m",
        valorProduto: 150,
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // updateBudgetItemSchema
  // =========================================================================
  describe("updateBudgetItemSchema", () => {
    it("should validate update with only id", () => {
      const result = updateBudgetItemSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const result = updateBudgetItemSchema.safeParse({
        valorProduto: 100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid id format", () => {
      const result = updateBudgetItemSchema.safeParse({
        id: "invalid-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should validate partial update", () => {
      const result = updateBudgetItemSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        valorProduto: 5000,
        quantidade: 2,
      });
      expect(result.success).toBe(true);
    });

    it("should validate full update", () => {
      const result = updateBudgetItemSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        fornecedor: "Novo Fornecedor",
        descricao: "Nova descrição",
        quantidade: 3,
        unidade: "m²",
        valorProduto: 200,
        valorInstalacao: 50,
        valorFrete: 30,
        valorExtras: 20,
        link: "https://example.com",
        subcategoria: "Nova Sub",
        ambiente: "Novo Ambiente",
        category: "Nova Categoria",
      });
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // uuidParamSchema
  // =========================================================================
  describe("uuidParamSchema", () => {
    it("should validate valid UUID", () => {
      const result = uuidParamSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const result = uuidParamSchema.safeParse({
        id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const result = uuidParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // =========================================================================
  // itemIdSchema
  // =========================================================================
  describe("itemIdSchema", () => {
    it("should validate valid itemId", () => {
      const result = itemIdSchema.safeParse({
        itemId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid itemId", () => {
      const result = itemIdSchema.safeParse({
        itemId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing itemId", () => {
      const result = itemIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
