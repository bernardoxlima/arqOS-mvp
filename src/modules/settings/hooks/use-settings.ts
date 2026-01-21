"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { OfficeCosts, ServiceId, OfficeSize, TeamRole, PositioningMultiplier } from "@/modules/onboarding";
import type { OrganizationData, TeamData, TeamMember } from "@/modules/dashboard/types";
import type { UpdateOrganizationData, CreateTeamMemberData, UpdateTeamMemberData } from "../types";

interface OrganizationSettingsExtended {
  margin: number;
  hour_value: number;
  costs: OfficeCosts;
  setup_completed_at?: string | null;
  setup_skipped_at?: string | null;
  setup_step?: number;
  office?: {
    size: OfficeSize;
    margin: number;
    services: ServiceId[];
    costs: OfficeCosts;
    positioningMultiplier?: PositioningMultiplier;
  };
}

interface OrganizationDataExtended extends Omit<OrganizationData, "settings"> {
  settings: OrganizationSettingsExtended;
}

interface UseSettingsReturn {
  // Data
  organization: OrganizationDataExtended | null;
  team: TeamData | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Error state
  error: string | null;

  // Organization actions
  updateOrganization: (data: UpdateOrganizationData) => Promise<boolean>;
  updateOrganizationName: (name: string) => Promise<boolean>;
  updateOfficeSize: (size: OfficeSize) => Promise<boolean>;
  updateMargin: (margin: number) => Promise<boolean>;
  updatePositioning: (positioning: PositioningMultiplier) => Promise<boolean>;
  updateCosts: (costs: Partial<OfficeCosts>) => Promise<boolean>;
  updateServices: (services: ServiceId[]) => Promise<boolean>;

  // Team actions
  addTeamMember: (data: CreateTeamMemberData) => Promise<boolean>;
  updateTeamMember: (id: string, data: UpdateTeamMemberData) => Promise<boolean>;
  deleteTeamMember: (id: string) => Promise<boolean>;

  // Refresh
  refresh: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [organization, setOrganization] = useState<OrganizationDataExtended | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization and team data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [orgRes, teamRes] = await Promise.all([
        fetch("/api/organization"),
        fetch("/api/organization/team"),
      ]);

      if (!orgRes.ok || !teamRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const orgData = await orgRes.json();
      const teamData = await teamRes.json();

      if (orgData.success && orgData.data) {
        setOrganization(orgData.data as OrganizationDataExtended);
      }

      if (teamData.success && teamData.data) {
        setTeam(teamData.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update organization
  const updateOrganization = useCallback(async (data: UpdateOrganizationData): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar");
      }

      setOrganization(result.data as OrganizationDataExtended);
      toast.success("Configurações salvas");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Update organization name
  const updateOrganizationName = useCallback(
    async (name: string): Promise<boolean> => {
      return updateOrganization({ name });
    },
    [updateOrganization]
  );

  // Update office size
  const updateOfficeSize = useCallback(
    async (size: OfficeSize): Promise<boolean> => {
      return updateOrganization({
        settings: { office: { size } },
      });
    },
    [updateOrganization]
  );

  // Update margin
  const updateMargin = useCallback(
    async (margin: number): Promise<boolean> => {
      return updateOrganization({
        settings: { margin, office: { margin } },
      });
    },
    [updateOrganization]
  );

  // Update positioning multiplier
  const updatePositioning = useCallback(
    async (positioning: PositioningMultiplier): Promise<boolean> => {
      return updateOrganization({
        settings: { office: { positioningMultiplier: positioning } },
      });
    },
    [updateOrganization]
  );

  // Update costs
  const updateCosts = useCallback(
    async (costs: Partial<OfficeCosts>): Promise<boolean> => {
      return updateOrganization({
        settings: { costs, office: { costs } },
      });
    },
    [updateOrganization]
  );

  // Update services
  const updateServices = useCallback(
    async (services: ServiceId[]): Promise<boolean> => {
      return updateOrganization({
        settings: { office: { services } },
      });
    },
    [updateOrganization]
  );

  // Add team member
  const addTeamMember = useCallback(async (data: CreateTeamMemberData): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/organization/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Erro ao adicionar membro");
      }

      // Refresh team data
      await fetchData();
      toast.success("Membro adicionado");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchData]);

  // Update team member
  const updateTeamMember = useCallback(
    async (id: string, data: UpdateTeamMemberData): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const res = await fetch(`/api/organization/team/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Erro ao atualizar membro");
        }

        // Update local state
        if (team) {
          const updatedMembers = team.members.map((m) =>
            m.id === id
              ? {
                  ...m,
                  full_name: data.full_name ?? m.full_name,
                  role: (data.role ?? m.role) as TeamMember["role"],
                  salary: data.salary ?? m.salary,
                  monthly_hours: data.monthly_hours ?? m.monthly_hours,
                }
              : m
          );

          // Recalculate totals
          const salaries = updatedMembers.reduce((sum, m) => sum + (m.salary || 0), 0);
          const hours = updatedMembers.reduce((sum, m) => sum + m.monthly_hours, 0);
          const hourlyRate = hours > 0 ? salaries / hours : 0;

          setTeam({
            members: updatedMembers,
            totals: {
              salaries: Math.round(salaries * 100) / 100,
              hours,
              hourly_rate: Math.round(hourlyRate * 100) / 100,
            },
          });
        }

        toast.success("Membro atualizado");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [team]
  );

  // Delete team member
  const deleteTeamMember = useCallback(
    async (id: string): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        const res = await fetch(`/api/organization/team/${id}`, {
          method: "DELETE",
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || "Erro ao remover membro");
        }

        // Update local state
        if (team) {
          const updatedMembers = team.members.filter((m) => m.id !== id);

          // Recalculate totals
          const salaries = updatedMembers.reduce((sum, m) => sum + (m.salary || 0), 0);
          const hours = updatedMembers.reduce((sum, m) => sum + m.monthly_hours, 0);
          const hourlyRate = hours > 0 ? salaries / hours : 0;

          setTeam({
            members: updatedMembers,
            totals: {
              salaries: Math.round(salaries * 100) / 100,
              hours,
              hourly_rate: Math.round(hourlyRate * 100) / 100,
            },
          });
        }

        toast.success("Membro removido");
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [team]
  );

  return {
    organization,
    team,
    isLoading,
    isSaving,
    error,
    updateOrganization,
    updateOrganizationName,
    updateOfficeSize,
    updateMargin,
    updatePositioning,
    updateCosts,
    updateServices,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    refresh: fetchData,
  };
}
