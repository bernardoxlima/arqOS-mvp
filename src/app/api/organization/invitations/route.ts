import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { canInviteRole } from "@/shared/lib/permissions";
import { z } from "zod";

// Schema for creating an invitation
const createInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["socio", "coordinator", "architect", "intern", "admin"], {
    errorMap: () => ({ message: "Cargo inválido" }),
  }),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  salary: z.number().min(0).optional(),
  monthly_hours: z.number().min(0).optional(),
});

/**
 * GET /api/organization/invitations
 * List pending invitations for the organization
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
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Get invitations for the organization
    const { data: invitations, error: invitationsError } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role,
        invited_by,
        expires_at,
        accepted_at,
        created_at
      `)
      .eq("organization_id", profile.organization_id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (invitationsError) {
      console.error("Error fetching invitations:", invitationsError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar convites" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invitations || [],
    });
  } catch (error) {
    console.error("Error in GET /api/organization/invitations:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organization/invitations
 * Create a new invitation and send magic link
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

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
      .select("id, organization_id, role, full_name")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { email, role, full_name, salary, monthly_hours } = validation.data;

    // Check permission to invite this role
    if (!canInviteRole(profile.role || "", role)) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para convidar este cargo" },
        { status: 403 }
      );
    }

    // Check if email is already in the organization
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("email", email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "Este email já pertence a um membro da equipe" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: "Já existe um convite pendente para este email" },
        { status: 400 }
      );
    }

    // Create the invitation using admin client to bypass any RLS issues
    const { data: invitation, error: invitationError } = await adminClient
      .from("invitations")
      .insert({
        organization_id: profile.organization_id,
        email,
        role,
        invited_by: profile.id,
        metadata: {
          full_name: full_name || null,
          salary: salary || null,
          monthly_hours: monthly_hours || 160,
        },
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar convite" },
        { status: 500 }
      );
    }

    // Get organization name for the email
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single();

    // Send magic link using Supabase Auth
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { error: otpError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/auth/callback`,
      data: {
        invitation_id: invitation.id,
        organization_id: profile.organization_id,
        role: role,
        invited_by_name: profile.full_name,
        organization_name: organization?.name || "Escritório",
      },
    });

    if (otpError) {
      console.error("Error sending invitation email:", otpError);
      // Delete the invitation if email fails
      await adminClient
        .from("invitations")
        .delete()
        .eq("id", invitation.id);

      return NextResponse.json(
        { success: false, error: "Erro ao enviar email de convite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
      },
      message: `Convite enviado para ${email}`,
    });
  } catch (error) {
    console.error("Error in POST /api/organization/invitations:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organization/invitations
 * Cancel a pending invitation
 */
export async function DELETE(request: NextRequest) {
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

    // Get profile
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

    // Check permission to manage invitations
    if (!["owner", "socio", "coordinator"].includes(profile.role || "")) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para cancelar convites" },
        { status: 403 }
      );
    }

    // Get invitation ID from query params
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: "ID do convite não fornecido" },
        { status: 400 }
      );
    }

    // Delete the invitation (RLS will ensure it belongs to the org)
    const { error: deleteError } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId)
      .eq("organization_id", profile.organization_id);

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError);
      return NextResponse.json(
        { success: false, error: "Erro ao cancelar convite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Convite cancelado com sucesso",
    });
  } catch (error) {
    console.error("Error in DELETE /api/organization/invitations:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
