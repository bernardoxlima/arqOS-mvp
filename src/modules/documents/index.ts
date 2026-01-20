/**
 * Documents Module
 * Exports all document generation functionality
 */

// Types
export type {
  // Slide types
  SlideConfig,
  LogoConfig,
  ImagePosition,
  TextStyle,
  // Presentation PPT
  PresentationSlideData,
  PresentationImageData,
  PresentationPPTInput,
  // Shopping List PPT
  ShoppingListItem,
  ShoppingListPPTInput,
  // Budget PPT
  BudgetItem,
  BudgetCategory,
  BudgetPPTInput,
  // Technical Detailing PPT
  TechnicalItem,
  TechnicalDetailingPPTInput,
  // Excel
  ExcelBudgetInput,
  ExcelColumn,
  // PDF Proposal
  ProposalSection,
  PDFProposalInput,
  // Word Proposal
  WordProposalInput,
  // Common
  GenerationResult,
  DocumentFormat,
  DocumentMetadata,
} from "./types";

// Constants
export { CATEGORY_COLORS, PPT_CONSTANTS } from "./types";

// PPT Helpers
export {
  createPresentation,
  fitImageInBounds,
  calculateImageGrid,
  imageUrlToBase64,
  addLogoToSlide,
  createCoverSlide,
  createSectionSlide,
  createFullImageSlide,
  createImageGridSlide,
  createTableSlide,
  formatCurrency,
  formatDate,
  truncateText,
} from "./utils/pptx-helpers";

// Generators
export { generatePresentationPPT } from "./generators/presentation-ppt";
export { generateShoppingListPPT } from "./generators/shopping-list-ppt";
export { generateBudgetPPT } from "./generators/budget-ppt";
export { generateTechnicalDetailingPPT } from "./generators/technical-detailing-ppt";
export { generateBudgetExcel, generateItemsListExcel } from "./generators/budget-excel";
export { generateProposalPDF } from "./generators/proposal-pdf";
export { generateProposalWord } from "./generators/proposal-word";
