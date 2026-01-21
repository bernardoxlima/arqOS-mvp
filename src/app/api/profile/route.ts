import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100).optional(),
  settings: z.object({
    avatar_url: z.string().nullable().optional(),
    preferences: z.object({
      theme: z.enum(["light", "dark"]).optional(),
      notifications: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

/**
 * PUT /api/profile
 * Update the authenticated user's profile
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
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { full_name, settings } = parsed.data;

    // Get current profile to merge settings
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name) {
      updateData.full_name = full_name;
    }

    if (settings) {
      // Deep merge settings
      const currentSettings = (currentProfile?.settings as Record<string, unknown>) || {
        avatar_url: null,
        preferences: { theme: "light", notifications: true },
      };

      const currentPreferences = (currentSettings.preferences as Record<string, unknown>) || {
        theme: "light",
        notifications: true,
      };

      updateData.settings = {
        ...currentSettings,
        ...(settings.avatar_url !== undefined && { avatar_url: settings.avatar_url }),
        preferences: {
          ...currentPreferences,
          ...(settings.preferences?.theme !== undefined && { theme: settings.preferences.theme }),
          ...(settings.preferences?.notifications !== undefined && { notifications: settings.preferences.notifications }),
        },
      };
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile
 * Get the authenticated user's profile
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
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Erro ao buscar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
