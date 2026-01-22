"use client";

import { useMemo } from "react";
import { useAuth } from "./use-auth";
import {
  canInviteRole,
  canRemoveRole,
  canChangeRole,
  canAccessFinance,
  canAccessCosts,
  canManageServices,
  canManageOffice,
  canCreateProjects,
  canEditProjects,
  canDeleteAnyProject,
  canLogTime,
  canCreateBudgets,
  canDeleteAnyBudget,
  canViewBudgetCosts,
  canCreatePresentations,
  canDeleteAnyPresentation,
  canDeleteAny,
  isAdminLevel,
  canManageTeam,
  getAssignableRoles,
} from "@/shared/lib/permissions";

/**
 * Hook that provides permission checks based on the current user's role
 */
export function usePermissions() {
  const { profile } = useAuth();
  const role = profile?.role || "intern";

  const permissions = useMemo(
    () => ({
      // Current role info
      role,
      isOwner: role === "owner",
      isSocio: role === "socio",
      isCoordinator: role === "coordinator",
      isArchitect: role === "architect",
      isIntern: role === "intern",
      isAdminLevel: isAdminLevel(role),

      // Team management
      canManageTeam: canManageTeam(role),
      canInviteSocio: role === "owner",
      canInvite: ["owner", "socio", "coordinator"].includes(role),
      canInviteRole: (targetRole: string) => canInviteRole(role, targetRole),
      canRemoveRole: (targetRole: string) => canRemoveRole(role, targetRole),
      canChangeRole: (targetRole: string) => canChangeRole(role, targetRole),
      getAssignableRoles: () => getAssignableRoles(role),

      // Settings access
      canAccessFinance: canAccessFinance(role),
      canAccessCosts: canAccessCosts(role),
      canManageServices: canManageServices(role),
      canManageOffice: canManageOffice(role),

      // Projects
      canCreateProjects: canCreateProjects(role),
      canEditProjects: canEditProjects(role),
      canDeleteAnyProject: canDeleteAnyProject(role),
      canLogTime: canLogTime(role),

      // Budgets
      canCreateBudgets: canCreateBudgets(role),
      canDeleteAnyBudget: canDeleteAnyBudget(role),
      canViewBudgetCosts: canViewBudgetCosts(role),

      // Presentations
      canCreatePresentations: canCreatePresentations(role),
      canDeleteAnyPresentation: canDeleteAnyPresentation(role),

      // General
      canDeleteAny: canDeleteAny(role),
    }),
    [role]
  );

  return permissions;
}
