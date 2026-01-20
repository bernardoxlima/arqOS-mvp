// Types
export type {
  Presentation,
  PresentationImage,
  PresentationItem,
  PresentationStatus,
  PresentationPhase,
  ImageSection,
  ItemCategory,
  ItemType,
  ClientData,
  PresentationSettings,
  ItemPosition,
  ProductDetails,
  ImageMetadata,
  CreatePresentationInput,
  UpdatePresentationInput,
  UploadImageInput,
  AddItemInput,
  UpdateItemInput,
  PresentationWithRelations,
  PresentationSummary,
  ServiceResult,
  CategoryConfig,
} from "./types";

// Constants
export {
  IMAGE_SECTION_LIMITS,
  CATEGORY_CONFIGS,
  getCategoryConfig,
  getLayoutCategories,
  getComplementaryCategories,
} from "./types";

// Presentation service
export {
  createPresentation,
  getPresentationById,
  updatePresentation,
  deletePresentation,
  listPresentations,
  getPresentationProgress,
} from "./services/presentations.service";

// Image service
export {
  uploadImage,
  deleteImage,
  updateImageOrder,
  getImagesBySection,
  getAllImages,
  isSectionFull,
} from "./services/images.service";

// Items service
export {
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
} from "./services/items.service";
