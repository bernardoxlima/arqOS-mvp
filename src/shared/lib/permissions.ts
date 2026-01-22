/**
 * Permissions Helper Library
 * Defines role hierarchy and permission checks for the application
 */

// Role hierarchy from highest to lowest privilege
export const ROLE_HIERARCHY = ['owner', 'socio', 'coordinator', 'architect', 'intern', 'admin'] as const;

export type Role = (typeof ROLE_HIERARCHY)[number];

/**
 * Get the hierarchy level of a role (lower = more privileged)
 */
function getRoleLevel(role: string): number {
  const index = ROLE_HIERARCHY.indexOf(role as Role);
  return index === -1 ? ROLE_HIERARCHY.length : index;
}

/**
 * Check if userRole is higher or equal in hierarchy than targetRole
 */
function isRoleHigherOrEqual(userRole: string, targetRole: string): boolean {
  return getRoleLevel(userRole) <= getRoleLevel(targetRole);
}

// ============================================================================
// TEAM MANAGEMENT PERMISSIONS
// ============================================================================

/**
 * Check if a user can invite someone with a specific role
 * - Only owner can invite socio
 * - Owner, socio, coordinator can invite coordinator/architect/intern
 */
export function canInviteRole(userRole: string, targetRole: string): boolean {
  // Only owner can invite socio
  if (targetRole === 'socio') {
    return userRole === 'owner';
  }
  // Owner, socio, and coordinator can invite coordinator/architect/intern/admin
  return ['owner', 'socio', 'coordinator'].includes(userRole);
}

/**
 * Check if a user can remove someone with a specific role
 * - Owner cannot be removed
 * - Only owner can remove socio
 * - Owner and socio can remove anyone below
 * - Coordinator can only remove architect/intern
 */
export function canRemoveRole(userRole: string, targetRole: string): boolean {
  // Owner cannot be removed
  if (targetRole === 'owner') {
    return false;
  }
  // Only owner can remove socio
  if (targetRole === 'socio') {
    return userRole === 'owner';
  }
  // Owner and socio can remove anyone below socio
  if (userRole === 'owner' || userRole === 'socio') {
    return true;
  }
  // Coordinator can only remove architect/intern
  if (userRole === 'coordinator') {
    return ['architect', 'intern', 'admin'].includes(targetRole);
  }
  return false;
}

/**
 * Check if a user can change someone's role
 * - Owner can change any role
 * - Socio can change coordinator/architect/intern (not owner or socio)
 * - Coordinator can change architect/intern
 */
export function canChangeRole(userRole: string, targetRole: string): boolean {
  if (userRole === 'owner') {
    return true;
  }
  if (userRole === 'socio') {
    return !['owner', 'socio'].includes(targetRole);
  }
  if (userRole === 'coordinator') {
    return ['architect', 'intern', 'admin'].includes(targetRole);
  }
  return false;
}

/**
 * Get the list of roles that can be assigned by a user
 */
export function getAssignableRoles(userRole: string): string[] {
  if (userRole === 'owner') {
    return ['socio', 'coordinator', 'architect', 'intern', 'admin'];
  }
  if (userRole === 'socio' || userRole === 'coordinator') {
    return ['coordinator', 'architect', 'intern', 'admin'];
  }
  return [];
}

// ============================================================================
// FEATURE ACCESS PERMISSIONS
// ============================================================================

/**
 * Check if user can access financial features (expenses/income)
 * Only owner and socio
 */
export function canAccessFinance(role: string): boolean {
  return ['owner', 'socio'].includes(role);
}

/**
 * Check if user can view/edit costs and margin settings
 * Only owner and socio
 */
export function canAccessCosts(role: string): boolean {
  return ['owner', 'socio'].includes(role);
}

/**
 * Check if user can manage services configuration
 * Owner, socio, and coordinator
 */
export function canManageServices(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}

/**
 * Check if user can manage office settings (name, size, etc.)
 * Owner and socio
 */
export function canManageOffice(role: string): boolean {
  return ['owner', 'socio'].includes(role);
}

// ============================================================================
// PROJECT PERMISSIONS
// ============================================================================

/**
 * Check if user can create projects
 * Everyone except intern
 */
export function canCreateProjects(role: string): boolean {
  return role !== 'intern';
}

/**
 * Check if user can edit projects
 * Everyone except intern (intern can only view)
 */
export function canEditProjects(role: string): boolean {
  return role !== 'intern';
}

/**
 * Check if user can delete any project (not just their own)
 * Owner, socio, and coordinator
 */
export function canDeleteAnyProject(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}

/**
 * Check if user can log time entries
 * Everyone can log time
 */
export function canLogTime(role: string): boolean {
  return true;
}

// ============================================================================
// BUDGET PERMISSIONS
// ============================================================================

/**
 * Check if user can create/edit budgets
 * Everyone except intern
 */
export function canCreateBudgets(role: string): boolean {
  return role !== 'intern';
}

/**
 * Check if user can delete any budget (not just their own)
 * Owner, socio, and coordinator
 */
export function canDeleteAnyBudget(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}

/**
 * Check if user can view margin/cost breakdown in budgets
 * Only owner and socio
 */
export function canViewBudgetCosts(role: string): boolean {
  return ['owner', 'socio'].includes(role);
}

// ============================================================================
// PRESENTATION PERMISSIONS
// ============================================================================

/**
 * Check if user can create/edit presentations
 * Everyone can create/edit presentations
 */
export function canCreatePresentations(role: string): boolean {
  return true;
}

/**
 * Check if user can delete any presentation
 * Owner, socio, and coordinator
 */
export function canDeleteAnyPresentation(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}

// ============================================================================
// GENERAL PERMISSIONS
// ============================================================================

/**
 * Check if user can delete any entity (general check)
 * Owner, socio, and coordinator
 */
export function canDeleteAny(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}

/**
 * Check if user is an admin-level user (owner or socio)
 */
export function isAdminLevel(role: string): boolean {
  return ['owner', 'socio'].includes(role);
}

/**
 * Check if user can manage team members
 */
export function canManageTeam(role: string): boolean {
  return ['owner', 'socio', 'coordinator'].includes(role);
}
