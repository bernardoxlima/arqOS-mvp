import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getTeamData } from "@/modules/dashboard/services/dashboard.service";
import { createTeamMemberSchema } from "@/modules/settings";

/**
 * GET /api/organization/team
 * Get team members for the authenticated user's organization
 */
export async function GET() {
  try {
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

    // Get team data
    const result = await getTeamData(profile.organization_id);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organization/team
 * Add a new team member to the organization
 * Note: This creates a profile entry for a team member without a Supabase Auth user.
 * The member can be invited later to create their own account.
 */
export async function POST(request: NextRequest) {
  try {
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
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Only owners and coordinators can add team members
    if (!["owner", "coordinator"].includes(profile.role || "")) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para adicionar membros" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createTeamMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { full_name, role, salary, monthly_hours } = validation.data;

    // Create the team member profile
    // Note: user_id is null for members not yet registered
    const { data: newMember, error: createError } = await supabase
      .from("profiles")
      .insert({
        organization_id: profile.organization_id,
        full_name,
        role,
        metadata: {
          salary,
          monthly_hours,
          added_by: user.id,
          added_at: new Date().toISOString(),
        },
      })
      .select("id, full_name, role, metadata, settings, created_at")
      .single();

    if (createError) {
      console.error("Error creating team member:", createError);
      return NextResponse.json(
        { success: false, error: "Erro ao adicionar membro" },
        { status: 500 }
      );
    }

    // Format response
    const metadata = (newMember.metadata || {}) as { salary?: number; monthly_hours?: number };
    const settings = (newMember.settings || {}) as { avatar_url?: string };

    return NextResponse.json({
      success: true,
      data: {
        id: newMember.id,
        full_name: newMember.full_name,
        role: newMember.role,
        salary: metadata.salary ?? null,
        monthly_hours: metadata.monthly_hours ?? 160,
        avatar_url: settings.avatar_url ?? null,
        created_at: newMember.created_at,
      },
    });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
