'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  PresentationSummary,
  PresentationWithRelations,
  CreatePresentationInput,
  UpdatePresentationInput,
  PresentationStatus
} from '../types';

interface UsePresentationsParams {
  status?: PresentationStatus;
  search?: string;
  autoFetch?: boolean;
}

interface UsePresentationsReturn {
  presentations: PresentationSummary[];
  isLoading: boolean;
  error: string | null;
  fetch: (params?: { status?: PresentationStatus; search?: string }) => Promise<void>;
  refetch: () => Promise<void>;
  create: (input: CreatePresentationInput) => Promise<PresentationWithRelations | null>;
  isCreating: boolean;
}

export function usePresentations(params: UsePresentationsParams = {}): UsePresentationsReturn {
  const { status, search, autoFetch = true } = params;

  const [presentations, setPresentations] = useState<PresentationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<{ status?: PresentationStatus; search?: string }>({ status, search });

  const fetchData = useCallback(async (fetchParams?: { status?: PresentationStatus; search?: string }) => {
    const queryParams = fetchParams || lastParams;
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (queryParams.status) searchParams.set('status', queryParams.status);
      if (queryParams.search) searchParams.set('search', queryParams.search);

      const url = `/api/presentations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch presentations');
      }

      setPresentations(result.data || []);
      setLastParams(queryParams);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [lastParams]);

  const refetch = useCallback(async () => {
    return fetchData(lastParams);
  }, [fetchData, lastParams]);

  const create = useCallback(async (input: CreatePresentationInput): Promise<PresentationWithRelations | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create presentation');
      }

      // Refetch list after creating
      await refetch();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [refetch]);

  useEffect(() => {
    if (autoFetch) {
      fetchData({ status, search });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, autoFetch]);

  return {
    presentations,
    isLoading,
    error,
    fetch: fetchData,
    refetch,
    create,
    isCreating,
  };
}

// Hook for single presentation
interface UsePresentationReturn {
  presentation: PresentationWithRelations | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  update: (input: UpdatePresentationInput) => Promise<boolean>;
  isUpdating: boolean;
  deletePresentation: () => Promise<boolean>;
  isDeleting: boolean;
}

export function usePresentation(id: string | null): UsePresentationReturn {
  const [presentation, setPresentation] = useState<PresentationWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/presentations/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch presentation');
      }

      setPresentation(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const update = useCallback(async (input: UpdatePresentationInput): Promise<boolean> => {
    if (!id) return false;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update presentation');
      }

      // Refetch to get updated data
      await fetchData();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [id, fetchData]);

  const deletePresentation = useCallback(async (): Promise<boolean> => {
    if (!id) return false;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete presentation');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  return {
    presentation,
    isLoading,
    error,
    fetch: fetchData,
    update,
    isUpdating,
    deletePresentation,
    isDeleting,
  };
}
