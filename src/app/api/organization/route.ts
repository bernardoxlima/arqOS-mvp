import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getOrganizationData } from "@/modules/dashboard/services/dashboard.service";
import { updateOrganizationSchema } from "@/modules/settings";

/**
 * GET /api/organization
 * Get the authenticated user's organization data
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

    // Get organization data
    const result = await getOrganizationData(profile.organization_id);

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
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organization
 * Update the authenticated user's organization data
 */
export async function PUT(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = updateOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { name, settings } = validation.data;

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (name) {
      updateData.name = name;
    }

    // Get current organization data to merge settings
    if (settings) {
      const { data: currentOrg } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", profile.organization_id)
        .single();

      const currentSettings = (currentOrg?.settings || {}) as Record<string, unknown>;
      const currentOffice = (currentSettings.office || {}) as Record<string, unknown>;
      const currentCosts = (currentSettings.costs || {}) as Record<string, unknown>;
      const currentOfficeCosts = (currentOffice.costs || {}) as Record<string, unknown>;

      // Merge settings
      const mergedSettings: Record<string, unknown> = {
        ...currentSettings,
      };

      if (settings.margin !== undefined) {
        mergedSettings.margin = settings.margin;
      }

      if (settings.hour_value !== undefined) {
        mergedSettings.hour_value = settings.hour_value;
      }

      if (settings.costs) {
        mergedSettings.costs = {
          ...currentCosts,
          ...settings.costs,
        };
      }

      if (settings.office) {
        mergedSettings.office = {
          ...currentOffice,
          ...(settings.office.size !== undefined && { size: settings.office.size }),
          ...(settings.office.margin !== undefined && { margin: settings.office.margin }),
          ...(settings.office.services !== undefined && { services: settings.office.services }),
          ...(settings.office.costs && {
            costs: {
              ...currentOfficeCosts,
              ...settings.office.costs,
            },
          }),
        };
      }

      updateData.settings = mergedSettings;
    }

    // Update organization
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", profile.organization_id)
      .select("id, name, slug, settings")
      .single();

    if (updateError) {
      console.error("Error updating organization:", updateError);
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar organização" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedOrg,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
