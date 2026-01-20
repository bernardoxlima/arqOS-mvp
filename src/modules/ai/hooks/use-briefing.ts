'use client';

/**
 * Hook for AI Briefing generation
 * Handles memorial, moodboard prompt, and reference prompt generation
 */

import { useState, useCallback } from 'react';
import type {
  BriefingMemorialInput,
  BriefingResult,
} from '../types';

interface UseBriefingReturn {
  memorial: string | null;
  moodboardPrompt: string | null;
  referencePrompt: string | null;
  isLoading: boolean;
  error: string | null;
  generateMemorial: (input: Omit<BriefingMemorialInput, 'type'>) => Promise<string | null>;
  generateMoodboard: (memorial: string) => Promise<string | null>;
  generateReference: (memorial: string) => Promise<string | null>;
  reset: () => void;
}

export function useBriefing(): UseBriefingReturn {
  const [memorial, setMemorial] = useState<string | null>(null);
  const [moodboardPrompt, setMoodboardPrompt] = useState<string | null>(null);
  const [referencePrompt, setReferencePrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMemorial = useCallback(
    async (input: Omit<BriefingMemorialInput, 'type'>): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'memorial',
            ...input,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao gerar memorial');
        }

        const result = data.data as BriefingResult;
        if (result.type === 'memorial') {
          setMemorial(result.memorial);
          return result.memorial;
        }

        throw new Error('Resposta inválida da API');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateMoodboard = useCallback(
    async (memorialText: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'moodboard',
            memorial: memorialText,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao gerar prompt de moodboard');
        }

        const result = data.data as BriefingResult;
        if (result.type === 'moodboard') {
          setMoodboardPrompt(result.prompt);
          return result.prompt;
        }

        throw new Error('Resposta inválida da API');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateReference = useCallback(
    async (memorialText: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reference',
            memorial: memorialText,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao gerar prompt de referência');
        }

        const result = data.data as BriefingResult;
        if (result.type === 'reference') {
          setReferencePrompt(result.prompt);
          return result.prompt;
        }

        throw new Error('Resposta inválida da API');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setMemorial(null);
    setMoodboardPrompt(null);
    setReferencePrompt(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    memorial,
    moodboardPrompt,
    referencePrompt,
    isLoading,
    error,
    generateMemorial,
    generateMoodboard,
    generateReference,
    reset,
  };
}
