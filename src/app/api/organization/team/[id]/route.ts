import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { updateTeamMemberSchema } from "@/modules/settings";
import { canChangeRole, canRemoveRole, canManageTeam } from "@/shared/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/organization/team/[id]
 * Get a specific team member by ID
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Get profile to get organization_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Get team member
    const { data: member, error: memberError } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, metadata, settings, created_at, updated_at")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { success: false, error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Format response
    const metadata = (member.metadata || {}) as { salary?: number; monthly_hours?: number };
    const settings = (member.settings || {}) as { avatar_url?: string };

    return NextResponse.json({
      success: true,
      data: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        role: member.role,
        salary: metadata.salary ?? null,
        monthly_hours: metadata.monthly_hours ?? 160,
        avatar_url: settings.avatar_url ?? null,
        created_at: member.created_at,
        updated_at: member.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching team member:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organization/team/[id]
 * Update a team member's information
 */
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Get profile to get organization_id and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Check if user can manage team
    if (!canManageTeam(profile.role || "")) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para editar membros" },
        { status: 403 }
      );
    }

    // Check if member exists in the organization
    const { data: existingMember, error: existingError } = await supabase
      .from("profiles")
      .select("id, metadata, role")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (existingError || !existingMember) {
      return NextResponse.json(
        { success: false, error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateTeamMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { full_name, role, salary, monthly_hours } = validation.data;

    // Check permission to change role if role is being changed
    if (role !== undefined && role !== existingMember.role) {
      // Check if user can change from the current role
      if (!canChangeRole(profile.role || "", existingMember.role || "")) {
        return NextResponse.json(
          { success: false, error: "Sem permissão para alterar o cargo deste membro" },
          { status: 403 }
        );
      }
      // Check if user can assign the new role
      if (!canChangeRole(profile.role || "", role)) {
        return NextResponse.json(
          { success: false, error: "Sem permissão para atribuir este cargo" },
          { status: 403 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    const currentMetadata = (existingMember.metadata || {}) as Record<string, unknown>;
    const newMetadata = { ...currentMetadata };

    if (full_name !== undefined) {
      updateData.full_name = full_name;
    }

    if (role !== undefined) {
      updateData.role = role;
    }

    if (salary !== undefined) {
      newMetadata.salary = salary;
    }

    if (monthly_hours !== undefined) {
      newMetadata.monthly_hours = monthly_hours;
    }

    // Only update metadata if there are changes
    if (salary !== undefined || monthly_hours !== undefined) {
      newMetadata.updated_by = user.id;
      newMetadata.updated_at = new Date().toISOString();
      updateData.metadata = newMetadata;
    }

    // Use admin client to update (bypasses RLS for team members without user_id)
    const adminClient = createAdminClient();

    // Update the member
    const { data: updatedMember, error: updateError } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select("id, full_name, email, role, metadata, settings, updated_at")
      .single();

    if (updateError) {
      console.error("Error updating team member:", updateError);
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar membro" },
        { status: 500 }
      );
    }

    // Format response
    const metadata = (updatedMember.metadata || {}) as { salary?: number; monthly_hours?: number };
    const settings = (updatedMember.settings || {}) as { avatar_url?: string };

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMember.id,
        full_name: updatedMember.full_name,
        email: updatedMember.email,
        role: updatedMember.role,
        salary: metadata.salary ?? null,
        monthly_hours: metadata.monthly_hours ?? 160,
        avatar_url: settings.avatar_url ?? null,
        updated_at: updatedMember.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organization/team/[id]
 * Remove a team member from the organization
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Get profile to get organization_id and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Cannot delete yourself
    if (profile.id === id) {
      return NextResponse.json(
        { success: false, error: "Você não pode remover a si mesmo" },
        { status: 400 }
      );
    }

    // Check if member exists in the organization
    const { data: existingMember, error: existingError } = await supabase
      .from("profiles")
      .select("id, user_id, role")
      .eq("id", id)
      .eq("organization_id", profile.organization_id)
      .single();

    if (existingError || !existingMember) {
      return NextResponse.json(
        { success: false, error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Check permission to remove this role
    if (!canRemoveRole(profile.role || "", existingMember.role || "")) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para remover este membro" },
        { status: 403 }
      );
    }

    // Use admin client to delete (bypasses RLS)
    const adminClient = createAdminClient();

    // Delete the member
    const { error: deleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting team member:", deleteError);
      return NextResponse.json(
        { success: false, error: "Erro ao remover membro" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
