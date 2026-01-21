"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  SetupWizardState,
  OfficeSize,
  ServiceId,
  OfficeCosts,
  TeamMemberData,
  CompleteSetupData,
  PositioningMultiplier,
} from "../types";
import { DEFAULT_COSTS, TOTAL_STEPS, DEFAULT_MARGIN, DEFAULT_POSITIONING } from "../constants";
import {
  getSetupStatus,
  updateSetupStep,
  completeSetup,
  skipSetup,
} from "../services/onboarding.service";

const STORAGE_KEY = "arqos-setup-wizard";

interface UseSetupWizardReturn {
  state: SetupWizardState;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;

  // Step 1: Office Size
  setOfficeSize: (size: OfficeSize) => void;

  // Step 2: Office Name
  setOfficeName: (name: string) => void;

  // Step 3: Team
  addTeamMember: (member: TeamMemberData) => void;
  updateTeamMember: (index: number, member: TeamMemberData) => void;
  removeTeamMember: (index: number) => void;

  // Step 4: Costs
  setCosts: (costs: OfficeCosts) => void;
  setCostField: (key: keyof OfficeCosts, value: number) => void;

  // Step 5: Services
  toggleService: (serviceId: ServiceId) => void;
  setServices: (services: ServiceId[]) => void;

  // Step 6: Margin & Positioning
  setMargin: (margin: number) => void;
  setPositioningMultiplier: (positioning: PositioningMultiplier) => void;

  // Actions
  saveProgress: () => Promise<void>;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
  reset: () => void;
}

const initialState: SetupWizardState = {
  currentStep: 1,
  officeSize: null,
  officeName: "",
  team: [],
  costs: DEFAULT_COSTS,
  services: [],
  margin: DEFAULT_MARGIN,
  positioningMultiplier: DEFAULT_POSITIONING,
};

export function useSetupWizard(): UseSetupWizardReturn {
  const router = useRouter();
  const [state, setState] = useState<SetupWizardState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved state from localStorage and server
  useEffect(() => {
    const loadState = async () => {
      try {
        // Try to load from localStorage first
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState((prev) => ({ ...prev, ...parsed }));
        }

        // Then get server status for current step
        const result = await getSetupStatus();
        if (result.data) {
          if (result.data.isCompleted || result.data.isSkipped) {
            router.replace("/projetos");
            return;
          }
          setState((prev) => ({
            ...prev,
            currentStep: result.data!.currentStep,
            officeName: prev.officeName || result.data!.organizationName,
          }));
        }
      } catch (err) {
        console.error("Error loading wizard state:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [router]);

  // Save to localStorage on state change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  // Validation for each step
  const isStepValid = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return state.officeSize !== null;
        case 2:
          return state.officeName.trim().length >= 2;
        case 3:
          return state.team.length > 0;
        case 4:
          return true; // Costs can be zero
        case 5:
          return state.services.length > 0;
        case 6:
          return state.margin >= 10 && state.margin <= 100;
        default:
          return false;
      }
    },
    [state]
  );

  // Navigation
  const canGoNext = isStepValid(state.currentStep);
  const canGoPrev = state.currentStep > 1;

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  }, []);

  // Note: nextStep calls complete() which is defined below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextStep = useCallback(async () => {
    if (!canGoNext) return;

    const nextStepNum = state.currentStep + 1;

    if (nextStepNum > TOTAL_STEPS) {
      // Complete setup - called when finishing the last step
      await complete();
      return;
    }

    // Update server with new step
    await updateSetupStep(nextStepNum);
    setState((prev) => ({ ...prev, currentStep: nextStepNum }));
  }, [canGoNext, state.currentStep]);

  const prevStep = useCallback(() => {
    if (!canGoPrev) return;
    setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
  }, [canGoPrev]);

  // Step 1: Office Size
  const setOfficeSize = useCallback((size: OfficeSize) => {
    setState((prev) => ({ ...prev, officeSize: size }));
  }, []);

  // Step 2: Office Name
  const setOfficeName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, officeName: name }));
  }, []);

  // Step 3: Team
  const addTeamMember = useCallback((member: TeamMemberData) => {
    setState((prev) => ({ ...prev, team: [...prev.team, member] }));
  }, []);

  const updateTeamMember = useCallback((index: number, member: TeamMemberData) => {
    setState((prev) => ({
      ...prev,
      team: prev.team.map((m, i) => (i === index ? member : m)),
    }));
  }, []);

  const removeTeamMember = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  }, []);

  // Step 4: Costs
  const setCosts = useCallback((costs: OfficeCosts) => {
    setState((prev) => ({ ...prev, costs }));
  }, []);

  const setCostField = useCallback((key: keyof OfficeCosts, value: number) => {
    setState((prev) => ({
      ...prev,
      costs: { ...prev.costs, [key]: value },
    }));
  }, []);

  // Step 5: Services
  const toggleService = useCallback((serviceId: ServiceId) => {
    setState((prev) => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services };
    });
  }, []);

  const setServices = useCallback((services: ServiceId[]) => {
    setState((prev) => ({ ...prev, services }));
  }, []);

  // Step 6: Margin & Positioning
  const setMargin = useCallback((margin: number) => {
    setState((prev) => ({ ...prev, margin }));
  }, []);

  const setPositioningMultiplier = useCallback((positioning: PositioningMultiplier) => {
    setState((prev) => ({ ...prev, positioningMultiplier: positioning }));
  }, []);

  // Actions
  const saveProgress = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateSetupStep(state.currentStep);
    } catch (err) {
      console.error("Error saving progress:", err);
      setError("Erro ao salvar progresso");
    } finally {
      setIsSaving(false);
    }
  }, [state.currentStep]);

  const complete = useCallback(async () => {
    if (!state.officeSize) {
      setError("Tamanho do escritório não definido");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const data: CompleteSetupData = {
        office: {
          size: state.officeSize,
          margin: state.margin,
          services: state.services,
          costs: state.costs,
          positioningMultiplier: state.positioningMultiplier,
        },
        team: state.team,
        organizationName: state.officeName,
      };

      const result = await completeSetup(data);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to dashboard
      router.push("/projetos");
    } catch (err) {
      console.error("Error completing setup:", err);
      setError("Erro ao concluir configuração");
    } finally {
      setIsSaving(false);
    }
  }, [state, router]);

  const skip = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await skipSetup();
      localStorage.removeItem(STORAGE_KEY);
      router.push("/projetos");
    } catch (err) {
      console.error("Error skipping setup:", err);
      setError("Erro ao pular configuração");
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  return {
    state,
    isLoading,
    isSaving,
    error,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    setOfficeSize,
    setOfficeName,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    setCosts,
    setCostField,
    toggleService,
    setServices,
    setMargin,
    setPositioningMultiplier,
    saveProgress,
    complete,
    skip,
    reset,
  };
}
