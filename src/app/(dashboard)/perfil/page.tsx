"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  Building2,
  Calendar,
  Save,
  Loader2,
  Camera,
  Trash2,
  Sun,
  Moon,
  Bell,
} from "lucide-react";

import { useAuth } from "@/modules/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileSettings {
  avatar_url: string | null;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getSettings = (): ProfileSettings => {
    const defaultSettings: ProfileSettings = {
      avatar_url: null,
      preferences: {
        theme: "light",
        notifications: true,
      },
    };

    if (!profile?.settings) return defaultSettings;

    const settings = profile.settings as Record<string, unknown>;
    const preferences = (settings.preferences as Record<string, unknown>) || {};

    return {
      avatar_url: (settings.avatar_url as string) || null,
      preferences: {
        theme: (preferences.theme as "light" | "dark") || "light",
        notifications: preferences.notifications !== false,
      },
    };
  };

  const settings = getSettings();

  const handleEdit = () => {
    setFullName(profile?.full_name || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar perfil");
      }

      await refreshProfile();
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar perfil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao fazer upload");
      }

      await refreshProfile();
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer upload"
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!settings.avatar_url) return;

    setIsUploadingAvatar(true);
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao remover foto");
      }

      await refreshProfile();
      toast.success("Foto removida com sucesso!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao remover foto"
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            preferences: { theme: newTheme },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar tema");
      }

      await refreshProfile();
      toast.success(`Tema ${newTheme === "dark" ? "escuro" : "claro"} ativado!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar tema"
      );
    }
  };

  const handleNotificationsChange = async (checked: boolean) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            preferences: { notifications: checked },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar notificações");
      }

      await refreshProfile();
      toast.success(
        `Notificações ${checked ? "ativadas" : "desativadas"}!`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar notificações"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
        <ProfileLoading />
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Não foi possível carregar o perfil. Tente fazer login novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* Avatar with upload */}
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={settings.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
              {settings.avatar_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto p-0 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remover foto
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* Profile Info */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  {profile.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <p className="text-sm text-muted-foreground py-2">
                {profile.email}
              </p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Função
              </Label>
              <p className="text-sm text-muted-foreground py-2 capitalize">
                {profile.role === "owner"
                  ? "Proprietário"
                  : profile.role === "admin"
                  ? "Administrador"
                  : profile.role === "coordinator"
                  ? "Coordenador"
                  : profile.role === "architect"
                  ? "Arquiteto"
                  : profile.role === "intern"
                  ? "Estagiário"
                  : profile.role}
              </p>
            </div>

            {/* Created At */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Membro desde
              </Label>
              <p className="text-sm text-muted-foreground py-2">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Edit Actions */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>Editar Perfil</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>
            Configure suas preferências de interface e notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.preferences.theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="theme-toggle" className="text-base">
                  Tema Escuro
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ativar modo escuro na interface
                </p>
              </div>
            </div>
            <Switch
              id="theme-toggle"
              checked={settings.preferences.theme === "dark"}
              onCheckedChange={handleThemeChange}
            />
          </div>

          <Separator />

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications-toggle" className="text-base">
                  Notificações
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações de atualizações
                </p>
              </div>
            </div>
            <Switch
              id="notifications-toggle"
              checked={settings.preferences.notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
