'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBriefing } from '../hooks/use-briefing';
import { useBrandbook } from '../hooks/use-brandbook';
import { useProductExtraction } from '../hooks/use-product-extraction';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useBriefing hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBriefing());

    expect(result.current.memorial).toBeNull();
    expect(result.current.moodboardPrompt).toBeNull();
    expect(result.current.referencePrompt).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate memorial successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { type: 'memorial', memorial: 'Generated memorial content' },
        }),
    });

    const { result } = renderHook(() => useBriefing());

    let memorial: string | null = null;
    await act(async () => {
      memorial = await result.current.generateMemorial({
        transcription: 'Test transcription',
        projectCode: 'ARQ-001',
        clientName: 'Test Client',
      });
    });

    expect(memorial).toBe('Generated memorial content');
    expect(result.current.memorial).toBe('Generated memorial content');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle memorial generation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'API error' }),
    });

    const { result } = renderHook(() => useBriefing());

    await act(async () => {
      await result.current.generateMemorial({
        transcription: 'Test transcription',
        projectCode: 'ARQ-001',
        clientName: 'Test Client',
      });
    });

    expect(result.current.memorial).toBeNull();
    expect(result.current.error).toBe('API error');
  });

  it('should generate moodboard prompt successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { type: 'moodboard', prompt: 'Moodboard prompt content' },
        }),
    });

    const { result } = renderHook(() => useBriefing());

    await act(async () => {
      await result.current.generateMoodboard('Test memorial');
    });

    expect(result.current.moodboardPrompt).toBe('Moodboard prompt content');
  });

  it('should generate reference prompt successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { type: 'reference', prompt: 'Reference prompt content' },
        }),
    });

    const { result } = renderHook(() => useBriefing());

    await act(async () => {
      await result.current.generateReference('Test memorial');
    });

    expect(result.current.referencePrompt).toBe('Reference prompt content');
  });

  it('should reset state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { type: 'memorial', memorial: 'Generated memorial' },
        }),
    });

    const { result } = renderHook(() => useBriefing());

    await act(async () => {
      await result.current.generateMemorial({
        transcription: 'Test',
        projectCode: 'ARQ-001',
        clientName: 'Client',
      });
    });

    expect(result.current.memorial).toBe('Generated memorial');

    act(() => {
      result.current.reset();
    });

    expect(result.current.memorial).toBeNull();
    expect(result.current.moodboardPrompt).toBeNull();
    expect(result.current.referencePrompt).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe('useBrandbook hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBrandbook());

    expect(result.current.brandbook).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate brandbook successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { brandbook: '# Brandbook\n\nGenerated content' },
        }),
    });

    const { result } = renderHook(() => useBrandbook());

    const mockAnswers = {
      identity: { name: 'Test Studio', timeInBusiness: '5', city: 'São Paulo', serviceModel: '', origin: '', milestone: '' },
      essence: { existsFor: '', personality: [], differential: '', dontTransmit: [] },
      audience: { idealClient: '', lifeMoments: [], painPoints: '', values: [], fears: [], dontWant: '' },
      method: { services: [], flagshipService: '', process: '', processDifferential: '', deadline: '', technology: [] },
      transformation: { result: '', feeling: '', referral: '' },
      vision: { future: '', success: [], knownFor: '', frustrations: '', belief: '', wouldChange: '' },
      synthesis: { forWho: '', notForWho: '', threeWords: '' },
    };

    await act(async () => {
      await result.current.generate(mockAnswers);
    });

    expect(result.current.brandbook).toBe('# Brandbook\n\nGenerated content');
    expect(result.current.isGenerating).toBe(false);
  });

  it('should handle brandbook generation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Generation failed' }),
    });

    const { result } = renderHook(() => useBrandbook());

    const mockAnswers = {
      identity: { name: '', timeInBusiness: '', city: '', serviceModel: '', origin: '', milestone: '' },
      essence: { existsFor: '', personality: [], differential: '', dontTransmit: [] },
      audience: { idealClient: '', lifeMoments: [], painPoints: '', values: [], fears: [], dontWant: '' },
      method: { services: [], flagshipService: '', process: '', processDifferential: '', deadline: '', technology: [] },
      transformation: { result: '', feeling: '', referral: '' },
      vision: { future: '', success: [], knownFor: '', frustrations: '', belief: '', wouldChange: '' },
      synthesis: { forWho: '', notForWho: '', threeWords: '' },
    };

    await act(async () => {
      await result.current.generate(mockAnswers);
    });

    expect(result.current.brandbook).toBeNull();
    expect(result.current.error).toBe('Generation failed');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBrandbook());

    const mockAnswers = {
      identity: { name: '', timeInBusiness: '', city: '', serviceModel: '', origin: '', milestone: '' },
      essence: { existsFor: '', personality: [], differential: '', dontTransmit: [] },
      audience: { idealClient: '', lifeMoments: [], painPoints: '', values: [], fears: [], dontWant: '' },
      method: { services: [], flagshipService: '', process: '', processDifferential: '', deadline: '', technology: [] },
      transformation: { result: '', feeling: '', referral: '' },
      vision: { future: '', success: [], knownFor: '', frustrations: '', belief: '', wouldChange: '' },
      synthesis: { forWho: '', notForWho: '', threeWords: '' },
    };

    await act(async () => {
      await result.current.generate(mockAnswers);
    });

    expect(result.current.brandbook).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should reset state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { brandbook: 'Brandbook content' },
        }),
    });

    const { result } = renderHook(() => useBrandbook());

    const mockAnswers = {
      identity: { name: 'Test', timeInBusiness: '', city: '', serviceModel: '', origin: '', milestone: '' },
      essence: { existsFor: '', personality: [], differential: '', dontTransmit: [] },
      audience: { idealClient: '', lifeMoments: [], painPoints: '', values: [], fears: [], dontWant: '' },
      method: { services: [], flagshipService: '', process: '', processDifferential: '', deadline: '', technology: [] },
      transformation: { result: '', feeling: '', referral: '' },
      vision: { future: '', success: [], knownFor: '', frustrations: '', belief: '', wouldChange: '' },
      synthesis: { forWho: '', notForWho: '', threeWords: '' },
    };

    await act(async () => {
      await result.current.generate(mockAnswers);
    });

    expect(result.current.brandbook).toBe('Brandbook content');

    act(() => {
      result.current.reset();
    });

    expect(result.current.brandbook).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe('useProductExtraction hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProductExtraction());

    expect(result.current.product).toBeNull();
    expect(result.current.isExtracting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should extract product successfully', async () => {
    const mockProduct = {
      name: 'Sofá 3 Lugares',
      price: 2999.9,
      supplier: 'Tok&Stok',
      category: 'moveis',
      imageUrl: 'https://example.com/sofa.jpg',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { success: true, product: mockProduct },
        }),
    });

    const { result } = renderHook(() => useProductExtraction());

    await act(async () => {
      await result.current.extract('https://tokstok.com.br/sofa');
    });

    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.isExtracting).toBe(false);
  });

  it('should handle extraction error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Could not extract product' }),
    });

    const { result } = renderHook(() => useProductExtraction());

    await act(async () => {
      await result.current.extract('https://invalid-url.com');
    });

    expect(result.current.product).toBeNull();
    expect(result.current.error).toBe('Could not extract product');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProductExtraction());

    await act(async () => {
      await result.current.extract('https://example.com/product');
    });

    expect(result.current.product).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should reset state', async () => {
    const mockProduct = {
      name: 'Product',
      price: 100,
      supplier: 'Supplier',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { success: true, product: mockProduct },
        }),
    });

    const { result } = renderHook(() => useProductExtraction());

    await act(async () => {
      await result.current.extract('https://example.com');
    });

    expect(result.current.product).toEqual(mockProduct);

    act(() => {
      result.current.reset();
    });

    expect(result.current.product).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
