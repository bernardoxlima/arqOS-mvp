import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient } from "@/shared/lib/supabase/admin";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/organization/invitations/[id]/resend
 * Resend an invitation email and extend expiry date
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id: invitationId } = await context.params;
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

    // Get profile
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

    // Check permission to manage invitations
    if (!["owner", "socio", "coordinator"].includes(profile.role || "")) {
      return NextResponse.json(
        { success: false, error: "Sem permissão para reenviar convites" },
        { status: 403 }
      );
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", invitationId)
      .eq("organization_id", profile.organization_id)
      .is("accepted_at", null)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { success: false, error: "Convite não encontrado" },
        { status: 404 }
      );
    }

    // Get organization name for the email
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single();

    // Extend expiry date by 7 days from now
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 7);

    // Update invitation expiry date
    const { error: updateError } = await adminClient
      .from("invitations")
      .update({ expires_at: newExpiryDate.toISOString() })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar convite" },
        { status: 500 }
      );
    }

    // Resend the magic link email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const metadata = (invitation.metadata || {}) as Record<string, unknown>;

    const { error: otpError } = await adminClient.auth.admin.inviteUserByEmail(
      invitation.email,
      {
        redirectTo: `${appUrl}/auth/callback`,
        data: {
          invitation_id: invitation.id,
          organization_id: profile.organization_id,
          role: invitation.role,
          invited_by_name: profile.full_name,
          organization_name: organization?.name || "Escritório",
          full_name: metadata.full_name || null,
        },
      }
    );

    if (otpError) {
      console.error("Error resending invitation email:", otpError);
      return NextResponse.json(
        { success: false, error: "Erro ao reenviar email de convite" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        expires_at: newExpiryDate.toISOString(),
      },
      message: "Convite reenviado com sucesso",
    });
  } catch (error) {
    console.error("Error in POST /api/organization/invitations/[id]/resend:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
