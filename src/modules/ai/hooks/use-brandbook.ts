'use client';

/**
 * Hook for AI Brandbook generation
 * Handles the complete brandbook generation from questionnaire answers
 */

import { useState, useCallback } from 'react';
import type { BrandArchitecture } from '../constants/brandbook-questions';

interface UseBrandbookReturn {
  brandbook: string | null;
  isGenerating: boolean;
  error: string | null;
  generate: (answers: BrandArchitecture) => Promise<string | null>;
  reset: () => void;
}

export function useBrandbook(): UseBrandbookReturn {
  const [brandbook, setBrandbook] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (answers: BrandArchitecture): Promise<string | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/brandbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao gerar brandbook');
        }

        const result = data.data?.brandbook;
        if (result) {
          setBrandbook(result);
          return result;
        }

        throw new Error('Resposta inválida da API');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setBrandbook(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    brandbook,
    isGenerating,
    error,
    generate,
    reset,
  };
}
