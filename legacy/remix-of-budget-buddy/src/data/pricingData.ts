import type { 
  EnvironmentTypeMultiplier, 
  SizeMultiplier, 
  DecorPricing, 
  ProducaoPricing, 
  ProjetPricing 
} from '@/types/budget';

export const HOUR_VALUE = 200;

export const environmentTypeMultipliers: Record<string, EnvironmentTypeMultiplier> = {
  standard: { 
    name: 'Sala, Quarto, Home Office', 
    shortName: 'Sala/Quarto/Home Office',
    multiplier: 1.0 
  },
  medium: { 
    name: 'Cozinha, Banheiro, Lavanderia', 
    shortName: 'Cozinha/Banheiro/Lavanderia',
    multiplier: 1.25 
  },
  high: { 
    name: 'Outros Ambientes (Complexidade)', 
    shortName: 'Outros (Complexidade)',
    multiplier: 1.4 
  }
};

export const sizeMultipliers: Record<string, SizeMultiplier> = {
  P: { name: 'P - Pequeno', multiplier: 1.0, description: 'Até 15m²' },
  M: { name: 'M - Médio', multiplier: 1.1, description: '15m² a 30m²' },
  G: { name: 'G - Grande', multiplier: 1.15, description: 'Acima de 30m²' }
};

export const decorExpressPricing: Record<string, DecorPricing> = {
  '1': {
    name: '1 Ambiente',
    baseRange: 'R$ 1.600 - 2.400',
    decor1: { price: 1600, hours: 8, description: 'Decoração Simples' },
    decor2: { price: 2000, hours: 10, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 2400, hours: 12, description: 'Decoração + Civil + Marcenaria + Iluminação' }
  },
  '2': {
    name: '2 Ambientes',
    baseRange: 'R$ 2.900 - 4.000',
    decor1: { price: 2900, hours: 14.5, description: 'Decoração Simples' },
    decor2: { price: 3450, hours: 17.25, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 4000, hours: 20, description: 'Decoração + Civil + Marcenaria + Iluminação' }
  },
  '3': {
    name: '3 Ambientes',
    baseRange: 'R$ 4.000 - 5.600',
    decor1: { price: 4000, hours: 20, description: 'Decoração Simples' },
    decor2: { price: 4800, hours: 24, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 5600, hours: 28, description: 'Decoração + Civil + Marcenaria + Iluminação' }
  }
};

export const producaoPricing: Record<string, ProducaoPricing> = {
  '1': {
    name: '1 Ambiente',
    baseRange: 'R$ 1.600 - 2.400',
    prod1: { price: 1600, hours: 8, description: 'Produção Simples' },
    prod3: { price: 2400, hours: 12, description: 'Produção Completa' }
  },
  '2': {
    name: '2 Ambientes',
    baseRange: 'R$ 2.900 - 4.000',
    prod1: { price: 2900, hours: 14.5, description: 'Produção Simples' },
    prod3: { price: 4000, hours: 20, description: 'Produção Completa' }
  },
  '3': {
    name: '3 Ambientes',
    baseRange: 'R$ 4.000 - 5.600',
    prod1: { price: 4000, hours: 20, description: 'Produção Simples' },
    prod3: { price: 5600, hours: 28, description: 'Produção Completa' }
  }
};

export const projetExpressPricing: Record<string, ProjetPricing> = {
  novo: {
    name: 'Apartamento NOVO',
    ranges: [
      { min: 20, max: 50, pricePerM2: 150, hours: 1.50 },
      { min: 50, max: 100, pricePerM2: 145, hours: 1.45 },
      { min: 100, max: 150, pricePerM2: 135, hours: 1.35 },
      { min: 150, max: 200, pricePerM2: 125, hours: 1.25 },
      { min: 200, max: 300, pricePerM2: 120, hours: 1.20 }
    ]
  },
  reforma: {
    name: 'Apartamento REFORMA',
    ranges: [
      { min: 20, max: 50, pricePerM2: 180, hours: 1.80 },
      { min: 50, max: 100, pricePerM2: 160, hours: 1.60 },
      { min: 100, max: 150, pricePerM2: 150, hours: 1.50 },
      { min: 150, max: 200, pricePerM2: 140, hours: 1.40 },
      { min: 200, max: 300, pricePerM2: 130, hours: 1.30 }
    ]
  }
};
