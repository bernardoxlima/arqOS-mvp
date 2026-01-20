/**
 * useCalculator Hook
 * React hook for budget calculations
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  CalculatorInput,
  CalculationResult,
  PricingConfig,
  CalculateBudgetResponse,
  PricingConfigResponse,
} from '../types';

interface UseCalculatorReturn {
  // State
  result: CalculationResult | null;
  config: PricingConfig | null;
  isCalculating: boolean;
  isLoadingConfig: boolean;
  error: string | null;

  // Actions
  calculate: (input: CalculatorInput) => Promise<CalculationResult | null>;
  calculateLocal: (input: CalculatorInput) => CalculationResult;
  loadConfig: () => Promise<PricingConfig | null>;
  reset: () => void;
}

export function useCalculator(): UseCalculatorReturn {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate budget via API (server-side validation)
   */
  const calculate = useCallback(async (input: CalculatorInput): Promise<CalculationResult | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: CalculateBudgetResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Calculation failed');
      }

      setResult(data.data.result);
      return data.data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Calculate budget locally (client-side, no API call)
   * Import calculator engine dynamically to avoid SSR issues
   */
  const calculateLocal = useCallback((input: CalculatorInput): CalculationResult => {
    // Import synchronously since this is client-side only
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { calculateBudget } = require('../calculator-engine');
    const calculatedResult = calculateBudget(input);
    setResult(calculatedResult);
    setError(null);
    return calculatedResult;
  }, []);

  /**
   * Load pricing configuration from API
   */
  const loadConfig = useCallback(async (): Promise<PricingConfig | null> => {
    setIsLoadingConfig(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/config');
      const data: PricingConfigResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load configuration');
      }

      setConfig(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return null;
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  /**
   * Reset calculator state
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    config,
    isCalculating,
    isLoadingConfig,
    error,
    calculate,
    calculateLocal,
    loadConfig,
    reset,
  };
}
