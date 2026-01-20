/**
 * useFinanceSummary Hook
 * React hook for fetching finance summary data
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FinanceSummary, FinanceSummaryResponse } from '@/modules/dashboard/types';

interface UseFinanceSummaryParams {
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

interface UseFinanceSummaryReturn {
  // State
  data: FinanceSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetch: (params?: { startDate?: string; endDate?: string }) => Promise<FinanceSummary | null>;
  refetch: () => Promise<FinanceSummary | null>;
}

export function useFinanceSummary(params: UseFinanceSummaryParams = {}): UseFinanceSummaryReturn {
  const { startDate, endDate, autoFetch = true } = params;

  const [data, setData] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<{ startDate?: string; endDate?: string }>({
    startDate,
    endDate,
  });

  /**
   * Fetch finance summary from API
   */
  const fetchData = useCallback(
    async (fetchParams?: { startDate?: string; endDate?: string }): Promise<FinanceSummary | null> => {
      const queryParams = fetchParams || lastParams;
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (queryParams.startDate) {
          searchParams.set('startDate', queryParams.startDate);
        }
        if (queryParams.endDate) {
          searchParams.set('endDate', queryParams.endDate);
        }

        const url = `/api/dashboard/finance/summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await fetch(url);
        const result: FinanceSummaryResponse = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch finance summary');
        }

        setData(result.data);
        setLastParams(queryParams);
        return result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [lastParams]
  );

  /**
   * Refetch with last used parameters
   */
  const refetch = useCallback(async (): Promise<FinanceSummary | null> => {
    return fetchData(lastParams);
  }, [fetchData, lastParams]);

  // Auto-fetch on mount or when params change
  useEffect(() => {
    if (autoFetch) {
      fetchData({ startDate, endDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, autoFetch]);

  return {
    data,
    isLoading,
    error,
    fetch: fetchData,
    refetch,
  };
}
