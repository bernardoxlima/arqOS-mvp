import { describe, it, expect } from 'vitest';
import {
  BRAND_QUESTIONS,
  BLOCK_ORDER,
  DEFAULT_BRAND_ARCHITECTURE,
  getBlockIndex,
  getBlockKey,
  isBlockCompleted,
  calculateCompletionPercentage,
  type BlockKey,
  type BrandArchitecture,
} from '../constants/brandbook-questions';

describe('brandbook-questions constants', () => {
  describe('BLOCK_ORDER', () => {
    it('should have 7 blocks in the correct order', () => {
      expect(BLOCK_ORDER).toHaveLength(7);
      expect(BLOCK_ORDER).toEqual([
        'identity',
        'essence',
        'audience',
        'method',
        'transformation',
        'vision',
        'synthesis',
      ]);
    });
  });

  describe('BRAND_QUESTIONS', () => {
    it('should have all blocks defined', () => {
      BLOCK_ORDER.forEach((blockKey) => {
        expect(BRAND_QUESTIONS[blockKey]).toBeDefined();
        expect(BRAND_QUESTIONS[blockKey].block).toBeDefined();
      });
    });

    it('should have valid block structure', () => {
      Object.values(BRAND_QUESTIONS).forEach((block) => {
        expect(block).toHaveProperty('block');
        expect(block).toHaveProperty('subtitle');
        expect(block).toHaveProperty('questions');
        expect(Array.isArray(block.questions)).toBe(true);
        expect(block.questions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid question structure in each block', () => {
      Object.values(BRAND_QUESTIONS).forEach((block) => {
        block.questions.forEach((question) => {
          expect(question).toHaveProperty('id');
          expect(question).toHaveProperty('label');
          expect(question).toHaveProperty('type');
          expect(['text', 'textarea', 'select', 'multiselect']).toContain(question.type);

          if (question.type === 'select' || question.type === 'multiselect') {
            expect(question.options).toBeDefined();
            expect(Array.isArray(question.options)).toBe(true);
          }
        });
      });
    });

    it('should have identity block with correct questions', () => {
      const identity = BRAND_QUESTIONS.identity;
      expect(identity.block).toBe('Identidade');
      expect(identity.questions.some((q) => q.id === 'name')).toBe(true);
      expect(identity.questions.some((q) => q.id === 'timeInBusiness')).toBe(true);
      expect(identity.questions.some((q) => q.id === 'city')).toBe(true);
    });

    it('should have essence block with correct questions', () => {
      const essence = BRAND_QUESTIONS.essence;
      expect(essence.block).toBe('Essencia');
      expect(essence.questions.some((q) => q.id === 'existsFor')).toBe(true);
      expect(essence.questions.some((q) => q.id === 'personality')).toBe(true);
    });

    it('should have multiselect questions with options', () => {
      const multiSelectQuestions = Object.values(BRAND_QUESTIONS)
        .flatMap((block) => block.questions)
        .filter((q) => q.type === 'multiselect');

      expect(multiSelectQuestions.length).toBeGreaterThan(0);
      multiSelectQuestions.forEach((q) => {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DEFAULT_BRAND_ARCHITECTURE', () => {
    it('should have all block sections defined', () => {
      BLOCK_ORDER.forEach((key) => {
        expect(DEFAULT_BRAND_ARCHITECTURE[key]).toBeDefined();
      });
    });

    it('should have appropriate default value types', () => {
      // Check identity has string fields
      expect(typeof DEFAULT_BRAND_ARCHITECTURE.identity.name).toBe('string');
      expect(typeof DEFAULT_BRAND_ARCHITECTURE.identity.city).toBe('string');

      // Check essence has array for multiselect
      expect(Array.isArray(DEFAULT_BRAND_ARCHITECTURE.essence.personality)).toBe(true);
      expect(Array.isArray(DEFAULT_BRAND_ARCHITECTURE.essence.dontTransmit)).toBe(true);

      // Check method has arrays
      expect(Array.isArray(DEFAULT_BRAND_ARCHITECTURE.method.services)).toBe(true);
      expect(Array.isArray(DEFAULT_BRAND_ARCHITECTURE.method.technology)).toBe(true);
    });

    it('should have empty default values', () => {
      expect(DEFAULT_BRAND_ARCHITECTURE.identity.name).toBe('');
      expect(DEFAULT_BRAND_ARCHITECTURE.essence.personality).toEqual([]);
      expect(DEFAULT_BRAND_ARCHITECTURE.synthesis.threeWords).toBe('');
    });
  });

  describe('getBlockIndex', () => {
    it('should return correct index for each block', () => {
      expect(getBlockIndex('identity')).toBe(0);
      expect(getBlockIndex('essence')).toBe(1);
      expect(getBlockIndex('synthesis')).toBe(6);
    });
  });

  describe('getBlockKey', () => {
    it('should return correct key for valid index', () => {
      expect(getBlockKey(0)).toBe('identity');
      expect(getBlockKey(3)).toBe('method');
      expect(getBlockKey(6)).toBe('synthesis');
    });

    it('should return undefined for invalid index', () => {
      expect(getBlockKey(7)).toBeUndefined();
      expect(getBlockKey(-1)).toBeUndefined();
    });
  });

  describe('isBlockCompleted', () => {
    it('should return false for empty block', () => {
      const empty: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      expect(isBlockCompleted('identity', empty)).toBe(false);
    });

    it('should return true when first question is filled', () => {
      const partial: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      partial.identity.name = 'Test Studio';
      expect(isBlockCompleted('identity', partial)).toBe(true);
    });

    it('should return true when array first question has values', () => {
      const partial: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      // The method block's first question is 'services' (multiselect)
      partial.method.services = ['Projeto de interiores'];
      expect(isBlockCompleted('method', partial)).toBe(true);
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('should return 0 for empty architecture', () => {
      const empty: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      expect(calculateCompletionPercentage(empty)).toBe(0);
    });

    it('should return > 0 when some fields are filled', () => {
      const partial: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      partial.identity.name = 'Test Studio';
      partial.identity.city = 'São Paulo';
      const percentage = calculateCompletionPercentage(partial);
      expect(percentage).toBeGreaterThan(0);
      expect(percentage).toBeLessThan(100);
    });

    it('should return higher percentage with more fields filled', () => {
      const partial1: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      partial1.identity.name = 'Test';

      const partial2: BrandArchitecture = JSON.parse(
        JSON.stringify(DEFAULT_BRAND_ARCHITECTURE)
      );
      partial2.identity.name = 'Test';
      partial2.identity.city = 'SP';
      partial2.identity.timeInBusiness = '5 anos';
      partial2.essence.existsFor = 'Transformar vidas';

      const percentage1 = calculateCompletionPercentage(partial1);
      const percentage2 = calculateCompletionPercentage(partial2);

      expect(percentage2).toBeGreaterThan(percentage1);
    });
  });
});
