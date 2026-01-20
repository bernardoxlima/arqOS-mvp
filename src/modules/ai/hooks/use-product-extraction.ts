'use client';

/**
 * Hook for AI Product Extraction
 * Extracts product data from URLs using AI
 */

import { useState, useCallback } from 'react';
import type { ExtractedProduct } from '../types';

interface UseProductExtractionReturn {
  product: ExtractedProduct | null;
  isExtracting: boolean;
  error: string | null;
  extract: (url: string) => Promise<ExtractedProduct | null>;
  reset: () => void;
}

export function useProductExtraction(): UseProductExtractionReturn {
  const [product, setProduct] = useState<ExtractedProduct | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (url: string): Promise<ExtractedProduct | null> => {
    setIsExtracting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao extrair produto');
      }

      const result = data.data;
      if (result?.success && result?.product) {
        setProduct(result.product);
        return result.product;
      }

      throw new Error(result?.error || 'Produto não encontrado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProduct(null);
    setError(null);
    setIsExtracting(false);
  }, []);

  return {
    product,
    isExtracting,
    error,
    extract,
    reset,
  };
}
