export interface EnvironmentConfig {
  type: 'standard' | 'medium' | 'high';
  size: 'P' | 'M' | 'G';
  complexity: string; // decor1, decor2, decor3 for decorexpress | prod1, prod3 for producao
}

export interface EnvironmentTypeMultiplier {
  name: string;
  shortName: string;
  multiplier: number;
}

export interface SizeMultiplier {
  name: string;
  multiplier: number;
  description: string;
}

export interface PricingTier {
  price: number;
  hours: number;
  description: string;
}

export interface DecorPricing {
  name: string;
  baseRange: string;
  decor1: PricingTier;
  decor2: PricingTier;
  decor3: PricingTier;
}

export interface ProducaoPricing {
  name: string;
  baseRange: string;
  prod1: PricingTier;
  prod3: PricingTier;
}

export interface ProjetRange {
  min: number;
  max: number;
  pricePerM2: number;
  hours: number;
}

export interface ProjetPricing {
  name: string;
  ranges: ProjetRange[];
}

export interface EnvironmentDetail {
  index: number;
  type: 'standard' | 'medium' | 'high';
  size: 'P' | 'M' | 'G';
  typeMultiplier: number;
  sizeMultiplier: number;
  combinedMultiplier: number;
}

export interface Calculation {
  basePrice: number;
  avgMultiplier?: number;
  environmentsDetails?: EnvironmentDetail[];
  priceBeforeExtras?: number;
  extrasTotal: number;
  extrasHours: number;
  surveyFeeTotal: number;
  surveyFeeHours: number;
  finalPrice: number;
  priceWithDiscount: number;
  discount: number;
  estimatedHours: number;
  hourRate: number;
  description?: string;
  efficiency: 'Ótimo' | 'Bom' | 'Reajustar';
  pricePerM2?: number;
}

export interface ServiceDetails {
  projectType?: 'novo' | 'reforma';
  projectArea?: number;
  size?: string;
  complexity?: string;
  environmentsConfig?: EnvironmentConfig[];
  extraEnvironments?: number;
  extraEnvironmentPrice?: number;
  serviceModality: 'online' | 'presencial';
  surveyFee: number;
  paymentType: 'cash' | 'installments';
  discountPercentage: number;
  includeManagement?: boolean;
  managementFee?: number;
}

export interface SavedBudget {
  id: number;
  date: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectNotes: string;
  service: 'decorexpress' | 'producao' | 'projetexpress';
  serviceDetails: ServiceDetails;
  calculation: Calculation;
}
