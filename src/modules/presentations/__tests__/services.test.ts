import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

// Import services
import {
  createPresentation,
  getPresentationById,
  updatePresentation,
  deletePresentation,
  listPresentations,
} from "../services/presentations.service";

import {
  deleteImage,
  updateImageOrder,
  getImagesBySection,
  getAllImages,
  isSectionFull,
} from "../services/images.service";

import {
  addItem,
  updateItem,
  deleteItem,
  getItems,
  getLayoutItems,
  getComplementaryItems,
  getItemsByCategory,
  getItemsByAmbiente,
  addBulkItems,
  updateItemPosition,
  renumberItems,
} from "../services/items.service";

import { IMAGE_SECTION_LIMITS } from "../types";

// Mock Supabase client factory
function createMockSupabase(overrides: Record<string, unknown> = {}) {
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();
  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } })),
      remove: vi.fn().mockResolvedValue({ error: null }),
    })),
  };

  return {
    from: mockFrom,
    rpc: mockRpc,
    storage: mockStorage,
    ...overrides,
  } as unknown as SupabaseClient;
}

// Sample data
const samplePresentation = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  organization_id: "org-123",
  name: "Apresentação Teste",
  code: "APRES-25001",
  project_id: null,
  phase: "Entrega Final",
  status: "draft",
  client_data: { clientName: "Maria Silva" },
  settings: null,
  created_by: "profile-123",
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:00:00.000Z",
};

const sampleImage = {
  id: "img-123",
  presentation_id: samplePresentation.id,
  organization_id: "org-123",
  section: "moodboard",
  image_url: "https://example.com/presentation-images/test.jpg",
  thumbnail_url: null,
  filename: "test.jpg",
  file_size: 1024,
  display_order: 1,
  metadata: { mimeType: "image/jpeg" },
  created_at: "2025-01-15T10:00:00.000Z",
};

const sampleItem = {
  id: "item-123",
  presentation_id: samplePresentation.id,
  organization_id: "org-123",
  name: "Sofá 3 lugares",
  number: 1,
  category: "mobiliario",
  item_type: "layout",
  ambiente: "Sala",
  position: { x: 100, y: 200 },
  product: { quantidade: 1, valorProduto: 2500 },
  status: "active",
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:00:00.000Z",
};

// ===========================================================================
// PRESENTATIONS SERVICE TESTS
// ===========================================================================
describe("Presentations Service", () => {
  describe("createPresentation", () => {
    it("should create a presentation successfully", async () => {
      const supabase = createMockSupabase();

      // Mock profile lookup
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { organization_id: "org-123" },
              error: null,
            }),
          };
        }
        if (table === "presentations") {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: samplePresentation,
              error: null,
            }),
          };
        }
        return {};
      });

      // Mock code generation
      (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: "APRES-25001",
        error: null,
      });

      const result = await createPresentation(
        supabase,
        { name: "Apresentação Teste" },
        "profile-123"
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe("Apresentação Teste");
    });

    it("should return error when profile not found", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Profile not found" },
        }),
      });

      const result = await createPresentation(
        supabase,
        { name: "Test" },
        "invalid-profile"
      );

      expect(result.error).toBe("Profile not found");
      expect(result.data).toBeUndefined();
    });

    it("should return error when code generation fails", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { organization_id: "org-123" },
          error: null,
        }),
      });

      (supabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: { message: "Code generation failed" },
      });

      const result = await createPresentation(
        supabase,
        { name: "Test" },
        "profile-123"
      );

      expect(result.error).toBe("Code generation failed");
    });
  });

  describe("getPresentationById", () => {
    it("should return presentation with images and items", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "presentations") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: samplePresentation,
              error: null,
            }),
          };
        }
        if (table === "presentation_images") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            mockResolvedValue: vi.fn(),
          };
        }
        if (table === "presentation_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      // Need to properly mock the chain for images and items
      let callCount = 0;
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        const orderMock = vi.fn().mockImplementation(() => {
          if (table === "presentation_images") {
            return {
              order: vi.fn().mockResolvedValue({ data: [sampleImage], error: null }),
            };
          }
          if (table === "presentation_items") {
            return {
              order: vi.fn().mockResolvedValue({ data: [sampleItem], error: null }),
            };
          }
          return {};
        });

        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: orderMock,
          single: vi.fn().mockResolvedValue({
            data: samplePresentation,
            error: null,
          }),
        };
      });

      const result = await getPresentationById(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should return error when presentation not found", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      });

      const result = await getPresentationById(supabase, "non-existent");

      expect(result.error).toBe("Not found");
    });
  });

  describe("updatePresentation", () => {
    it("should update presentation successfully", async () => {
      const supabase = createMockSupabase();
      const updatedPresentation = { ...samplePresentation, name: "Updated Name" };

      let updateCalled = false;
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        const orderMock = vi.fn().mockImplementation(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }));

        return {
          update: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: orderMock,
          single: vi.fn().mockImplementation(() => {
            if (!updateCalled) {
              updateCalled = true;
              return Promise.resolve({ data: updatedPresentation, error: null });
            }
            return Promise.resolve({ data: updatedPresentation, error: null });
          }),
        };
      });

      const result = await updatePresentation(
        supabase,
        samplePresentation.id,
        { name: "Updated Name" }
      );

      expect(result.error).toBeUndefined();
    });

    it("should update status", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...samplePresentation, status: "approved" },
          error: null,
        }),
      }));

      const result = await updatePresentation(
        supabase,
        samplePresentation.id,
        { status: "approved" }
      );

      expect(result.error).toBeUndefined();
    });
  });

  describe("deletePresentation", () => {
    it("should delete presentation and clean up storage", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "presentation_images") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [sampleImage],
              error: null,
            }),
          };
        }
        if (table === "presentations") {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const result = await deletePresentation(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
    });

    it("should return error on delete failure", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "presentation_images") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        if (table === "presentations") {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
          };
        }
        return {};
      });

      const result = await deletePresentation(supabase, samplePresentation.id);

      expect(result.error).toBe("Delete failed");
    });
  });

  describe("listPresentations", () => {
    it("should list presentations with pagination", async () => {
      const supabase = createMockSupabase();

      const mockData = [{
        ...samplePresentation,
        presentation_images: [{ id: "img-1" }],
        presentation_items: [{ id: "item-1" }, { id: "item-2" }],
      }];

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
              count: 1,
            }),
          }),
        }),
      });

      const result = await listPresentations(supabase, { limit: 10, offset: 0 });

      expect(result.error).toBeUndefined();
      expect(result.data?.presentations).toHaveLength(1);
      expect(result.data?.total).toBe(1);
    });

    it("should filter by status", async () => {
      const supabase = createMockSupabase();
      const eqMock = vi.fn().mockReturnThis();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: eqMock,
        or: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      await listPresentations(supabase, { status: "draft" });

      expect(eqMock).toHaveBeenCalledWith("status", "draft");
    });

    it("should filter by search term", async () => {
      const supabase = createMockSupabase();
      const orMock = vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: orMock,
      });

      await listPresentations(supabase, { search: "test" });

      expect(orMock).toHaveBeenCalledWith("name.ilike.%test%,code.ilike.%test%");
    });
  });
});

// ===========================================================================
// IMAGES SERVICE TESTS
// ===========================================================================
describe("Images Service", () => {
  describe("deleteImage", () => {
    it("should delete image from storage and database", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: sampleImage,
          error: null,
        }),
        delete: vi.fn().mockReturnThis(),
      }));

      // Override delete to return success
      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
        const deleteChain = {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: sampleImage, error: null }),
          delete: vi.fn().mockReturnValue(deleteChain),
        };
      });

      const result = await deleteImage(supabase, sampleImage.id);

      expect(result.error).toBeUndefined();
    });

    it("should return error when image not found", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Image not found" },
        }),
      });

      const result = await deleteImage(supabase, "non-existent");

      expect(result.error).toBe("Image not found");
    });
  });

  describe("updateImageOrder", () => {
    it("should update display order for images", async () => {
      const supabase = createMockSupabase();

      // Need to chain: update().eq().eq().eq()
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      });

      const result = await updateImageOrder(
        supabase,
        samplePresentation.id,
        "moodboard",
        ["img-1", "img-2", "img-3"]
      );

      expect(result.error).toBeUndefined();
    });
  });

  describe("getImagesBySection", () => {
    it("should return images for a specific section", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [sampleImage],
          error: null,
        }),
      });

      const result = await getImagesBySection(
        supabase,
        samplePresentation.id,
        "moodboard"
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getAllImages", () => {
    it("should return images grouped by section", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      });

      // Make order return a Promise
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              { ...sampleImage, section: "moodboard" },
              { ...sampleImage, id: "img-2", section: "renders" },
            ],
            error: null,
          }),
        })),
      });

      const result = await getAllImages(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.moodboard).toBeDefined();
      expect(result.data?.renders).toBeDefined();
    });
  });

  describe("isSectionFull", () => {
    it("should return true when section is at limit", async () => {
      const supabase = createMockSupabase();

      // Chain: select().eq().eq()
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              count: IMAGE_SECTION_LIMITS.moodboard, // 1
              error: null,
            }),
          }),
        }),
      });

      const result = await isSectionFull(
        supabase,
        samplePresentation.id,
        "moodboard"
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toBe(true);
    });

    it("should return false when section has space", async () => {
      const supabase = createMockSupabase();

      // Chain: select().eq().eq()
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              count: 0,
              error: null,
            }),
          }),
        }),
      });

      const result = await isSectionFull(
        supabase,
        samplePresentation.id,
        "renders"
      );

      expect(result.error).toBeUndefined();
      expect(result.data).toBe(false);
    });
  });
});

// ===========================================================================
// ITEMS SERVICE TESTS
// ===========================================================================
describe("Items Service", () => {
  describe("addItem", () => {
    it("should add item to presentation", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "presentations") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: samplePresentation.id, organization_id: "org-123" },
              error: null,
            }),
          };
        }
        if (table === "presentation_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: sampleItem, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await addItem(supabase, samplePresentation.id, {
        name: "Sofá 3 lugares",
        category: "mobiliario",
        itemType: "layout",
        ambiente: "Sala",
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it("should return error when presentation not found", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Presentation not found" },
        }),
      });

      const result = await addItem(supabase, "non-existent", {
        name: "Test",
        category: "mobiliario",
        itemType: "layout",
      });

      expect(result.error).toBe("Presentation not found");
    });
  });

  describe("updateItem", () => {
    it("should update item successfully", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...sampleItem, name: "Updated Name" },
          error: null,
        }),
      });

      const result = await updateItem(supabase, sampleItem.id, {
        name: "Updated Name",
      });

      expect(result.error).toBeUndefined();
      expect(result.data?.name).toBe("Updated Name");
    });

    it("should update product details", async () => {
      const supabase = createMockSupabase();
      const newProduct = { quantidade: 2, valorProduto: 3000 };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...sampleItem, product: newProduct },
          error: null,
        }),
      });

      const result = await updateItem(supabase, sampleItem.id, {
        product: newProduct,
      });

      expect(result.error).toBeUndefined();
    });
  });

  describe("deleteItem", () => {
    it("should delete item successfully", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteItem(supabase, sampleItem.id);

      expect(result.error).toBeUndefined();
    });

    it("should return error on delete failure", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
      });

      const result = await deleteItem(supabase, sampleItem.id);

      expect(result.error).toBe("Delete failed");
    });
  });

  describe("getItems", () => {
    it("should return all items for presentation", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => ({
          order: vi.fn().mockResolvedValue({
            data: [sampleItem],
            error: null,
          }),
        })),
      });

      const result = await getItems(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
    });

    it("should filter by item type", async () => {
      const supabase = createMockSupabase();

      // Create a chainable mock that supports query reassignment
      const createChainableMock = () => {
        const mock: Record<string, unknown> = {};
        mock.select = vi.fn().mockReturnValue(mock);
        mock.eq = vi.fn().mockReturnValue(mock);
        mock.order = vi.fn().mockReturnValue(mock);
        mock.then = vi.fn().mockImplementation((resolve) =>
          resolve({ data: [sampleItem], error: null })
        );
        return mock;
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(createChainableMock());

      const result = await getItems(supabase, samplePresentation.id, { itemType: "layout" });

      expect(result.error).toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith("presentation_items");
    });

    it("should filter by category", async () => {
      const supabase = createMockSupabase();

      // Create a chainable mock that supports query reassignment
      const createChainableMock = () => {
        const mock: Record<string, unknown> = {};
        mock.select = vi.fn().mockReturnValue(mock);
        mock.eq = vi.fn().mockReturnValue(mock);
        mock.order = vi.fn().mockReturnValue(mock);
        mock.then = vi.fn().mockImplementation((resolve) =>
          resolve({ data: [], error: null })
        );
        return mock;
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(createChainableMock());

      const result = await getItems(supabase, samplePresentation.id, { category: "mobiliario" });

      expect(result.error).toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith("presentation_items");
    });
  });

  describe("getLayoutItems", () => {
    it("should return only layout items", async () => {
      const supabase = createMockSupabase();

      // Create a chainable mock
      const createChainableMock = () => {
        const mock: Record<string, unknown> = {};
        mock.select = vi.fn().mockReturnValue(mock);
        mock.eq = vi.fn().mockReturnValue(mock);
        mock.order = vi.fn().mockReturnValue(mock);
        mock.then = vi.fn().mockImplementation((resolve) =>
          resolve({ data: [sampleItem], error: null })
        );
        return mock;
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(createChainableMock());

      const result = await getLayoutItems(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(1);
    });
  });

  describe("getComplementaryItems", () => {
    it("should return only complementary items", async () => {
      const supabase = createMockSupabase();

      // Create a chainable mock
      const createChainableMock = () => {
        const mock: Record<string, unknown> = {};
        mock.select = vi.fn().mockReturnValue(mock);
        mock.eq = vi.fn().mockReturnValue(mock);
        mock.order = vi.fn().mockReturnValue(mock);
        mock.then = vi.fn().mockImplementation((resolve) =>
          resolve({ data: [], error: null })
        );
        return mock;
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(createChainableMock());

      const result = await getComplementaryItems(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(0);
    });
  });

  describe("getItemsByCategory", () => {
    it("should return items grouped by category", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              sampleItem,
              { ...sampleItem, id: "item-2", category: "iluminacao" },
            ],
            error: null,
          }),
        })),
      });

      const result = await getItemsByCategory(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });
  });

  describe("getItemsByAmbiente", () => {
    it("should return items grouped by ambiente", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => ({
          order: vi.fn().mockResolvedValue({
            data: [
              sampleItem,
              { ...sampleItem, id: "item-2", ambiente: "Quarto" },
              { ...sampleItem, id: "item-3", ambiente: null },
            ],
            error: null,
          }),
        })),
      });

      const result = await getItemsByAmbiente(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
      expect(result.data?.["Sala"]).toBeDefined();
      expect(result.data?.["Quarto"]).toBeDefined();
      expect(result.data?.["Sem ambiente"]).toBeDefined();
    });
  });

  describe("addBulkItems", () => {
    it("should add multiple items at once", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === "presentations") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: samplePresentation.id, organization_id: "org-123" },
              error: null,
            }),
          };
        }
        if (table === "presentation_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue({
                data: [sampleItem, { ...sampleItem, id: "item-2", number: 2 }],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      const result = await addBulkItems(supabase, samplePresentation.id, [
        { name: "Item 1", category: "mobiliario", itemType: "layout" },
        { name: "Item 2", category: "iluminacao", itemType: "layout" },
      ]);

      expect(result.error).toBeUndefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe("updateItemPosition", () => {
    it("should update item position on floor plan", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...sampleItem, position: { x: 150, y: 250 } },
          error: null,
        }),
      });

      const result = await updateItemPosition(
        supabase,
        sampleItem.id,
        { x: 150, y: 250 }
      );

      expect(result.error).toBeUndefined();
      expect(result.data?.position).toEqual({ x: 150, y: 250 });
    });
  });

  describe("renumberItems", () => {
    it("should renumber items sequentially", async () => {
      const supabase = createMockSupabase();

      (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            { id: "item-1", number: 1 },
            { id: "item-2", number: 5 },
            { id: "item-3", number: 10 },
          ],
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }));

      const result = await renumberItems(supabase, samplePresentation.id);

      expect(result.error).toBeUndefined();
    });
  });
});

// ===========================================================================
// TYPES TESTS
// ===========================================================================
describe("Presentations Types", () => {
  describe("IMAGE_SECTION_LIMITS", () => {
    it("should have correct limits for each section", () => {
      expect(IMAGE_SECTION_LIMITS.photos_before).toBe(4);
      expect(IMAGE_SECTION_LIMITS.moodboard).toBe(1);
      expect(IMAGE_SECTION_LIMITS.references).toBe(6);
      expect(IMAGE_SECTION_LIMITS.floor_plan).toBe(1);
      expect(IMAGE_SECTION_LIMITS.renders).toBe(10);
    });
  });
});
