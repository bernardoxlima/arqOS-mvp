"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type {
  SetupStatus,
  CompleteSetupData,
  OrganizationSettings,
  TeamMemberData,
} from "../types";

interface ServiceResult<T = null> {
  data: T | null;
  error: { message: string; code: string } | null;
}

/**
 * Get setup status for the current user's organization
 */
export async function getSetupStatus(): Promise<ServiceResult<SetupStatus>> {
  const supabase = await createClient();

  // Get current user's profile and organization
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  // Get organization data
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, settings")
    .eq("id", profile.organization_id)
    .single();

  if (orgError || !org) {
    return {
      data: null,
      error: {
        message: orgError?.message || "Organização não encontrada",
        code: "NOT_FOUND",
      },
    };
  }

  const settings = (org.settings as OrganizationSettings) || {};

  return {
    data: {
      isCompleted: !!settings.setup_completed_at,
      isSkipped: !!settings.setup_skipped_at,
      currentStep: settings.setup_step || 1,
      organizationId: org.id,
      organizationName: org.name,
    },
    error: null,
  };
}

/**
 * Update setup step progress
 */
export async function updateSetupStep(
  step: number
): Promise<ServiceResult<{ step: number }>> {
  const supabase = await createClient();

  // Get current profile
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  // Get current settings
  const { data: org, error: fetchError } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", profile.organization_id)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Merge with existing settings
  const currentSettings = (org?.settings as OrganizationSettings) || {};
  const updatedSettings: OrganizationSettings = {
    ...currentSettings,
    setup_step: step,
  };

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ settings: updatedSettings })
    .eq("id", profile.organization_id);

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return { data: { step }, error: null };
}

/**
 * Skip the setup wizard
 */
export async function skipSetup(): Promise<ServiceResult> {
  const supabase = await createClient();

  // Get current profile
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  // Get current settings
  const { data: org, error: fetchError } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", profile.organization_id)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  const currentSettings = (org?.settings as OrganizationSettings) || {};
  const updatedSettings: OrganizationSettings = {
    ...currentSettings,
    setup_skipped_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ settings: updatedSettings })
    .eq("id", profile.organization_id);

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Complete the setup wizard and save all configuration
 */
export async function completeSetup(
  data: CompleteSetupData
): Promise<ServiceResult<{ organizationId: string }>> {
  const supabase = await createClient();

  // Get current profile
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  const organizationId = profile.organization_id;

  // Get current settings
  const { data: org, error: fetchError } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", organizationId)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Build updated settings
  const currentSettings = (org?.settings as OrganizationSettings) || {};
  const updatedSettings: OrganizationSettings = {
    ...currentSettings,
    setup_completed_at: new Date().toISOString(),
    setup_step: 6,
    office: data.office,
  };

  // Update organization name and settings
  const { error: orgUpdateError } = await supabase
    .from("organizations")
    .update({
      name: data.organizationName,
      settings: updatedSettings,
    })
    .eq("id", organizationId);

  if (orgUpdateError) {
    return {
      data: null,
      error: { message: orgUpdateError.message, code: orgUpdateError.code },
    };
  }

  // Update or create team member profiles
  // First, update the current user's profile with their role info if they're in the team
  const currentUserTeamMember = data.team.find(
    (member) =>
      member.email === profile.email ||
      member.name.toLowerCase() === profile.full_name.toLowerCase()
  );

  if (currentUserTeamMember) {
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        full_name: currentUserTeamMember.name,
        role: currentUserTeamMember.role,
        metadata: {
          salary: currentUserTeamMember.salary,
          monthly_hours: currentUserTeamMember.monthlyHours,
        },
      })
      .eq("id", profile.id);

    if (profileUpdateError) {
      console.error("Error updating current user profile:", profileUpdateError);
    }
  }

  // For other team members, we just store them in metadata for now
  // They will create their own profiles when they sign up
  // Store team data in organization settings for reference
  const settingsWithTeam: OrganizationSettings = {
    ...updatedSettings,
    pending_team: data.team.filter(
      (member) =>
        member.email !== profile.email &&
        member.name.toLowerCase() !== profile.full_name.toLowerCase()
    ) as unknown as OrganizationSettings["pending_team"],
  };

  if (settingsWithTeam.pending_team && (settingsWithTeam.pending_team as TeamMemberData[]).length > 0) {
    const { error: teamUpdateError } = await supabase
      .from("organizations")
      .update({ settings: settingsWithTeam })
      .eq("id", organizationId);

    if (teamUpdateError) {
      console.error("Error storing pending team:", teamUpdateError);
    }
  }

  return { data: { organizationId }, error: null };
}

/**
 * Get organization details including office configuration
 */
export async function getOrganizationConfig(): Promise<
  ServiceResult<{
    id: string;
    name: string;
    settings: OrganizationSettings;
  }>
> {
  const supabase = await createClient();

  // Get current profile
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, settings")
    .eq("id", profile.organization_id)
    .single();

  if (orgError || !org) {
    return {
      data: null,
      error: {
        message: orgError?.message || "Organização não encontrada",
        code: "NOT_FOUND",
      },
    };
  }

  return {
    data: {
      id: org.id,
      name: org.name,
      settings: (org.settings as OrganizationSettings) || {},
    },
    error: null,
  };
}
