import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/profile/avatar
 * Upload a new avatar image
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
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Generate file path: {user_id}/{timestamp}.{extension}
    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${extension}`;

    // Delete old avatar if exists
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    const currentSettings = currentProfile?.settings as Record<string, unknown> | null;
    const oldAvatarUrl = currentSettings?.avatar_url as string | null;

    if (oldAvatarUrl) {
      // Extract path from URL
      const urlParts = oldAvatarUrl.split("/avatars/");
      if (urlParts.length > 1) {
        const oldPath = urlParts[1];
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return NextResponse.json(
        { error: "Erro ao fazer upload da imagem" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update profile settings with new avatar URL
    const newSettings = {
      ...(currentSettings || {}),
      avatar_url: avatarUrl,
      preferences: (currentSettings?.preferences as Record<string, unknown>) || {
        theme: "light",
        notifications: true,
      },
    };

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
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

    return NextResponse.json({
      profile,
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Remove the current avatar
 */
export async function DELETE() {
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

    // Get current profile
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    const currentSettings = currentProfile?.settings as Record<string, unknown> | null;
    const avatarUrl = currentSettings?.avatar_url as string | null;

    if (avatarUrl) {
      // Extract path from URL and delete
      const urlParts = avatarUrl.split("/avatars/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("avatars").remove([filePath]);
      }
    }

    // Update profile to remove avatar URL
    const newSettings = {
      ...(currentSettings || {}),
      avatar_url: null,
      preferences: (currentSettings?.preferences as Record<string, unknown>) || {
        theme: "light",
        notifications: true,
      },
    };

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
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
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
