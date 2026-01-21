"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, User, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { TeamMember, TeamData } from "@/modules/dashboard/types";
import type { TeamRole } from "@/modules/onboarding";
import { TEAM_ROLES, getRoleDefaults, formatCurrency } from "@/modules/onboarding";
import type { CreateTeamMemberData, UpdateTeamMemberData } from "../types";

// Role colors for avatars
const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700",
  coordinator: "bg-blue-100 text-blue-700",
  architect: "bg-emerald-100 text-emerald-700",
  intern: "bg-amber-100 text-amber-700",
  admin: "bg-gray-100 text-gray-700",
};

interface SettingsTeamSectionProps {
  team: TeamData | null;
  isSaving: boolean;
  onAddMember: (data: CreateTeamMemberData) => Promise<boolean>;
  onUpdateMember: (id: string, data: UpdateTeamMemberData) => Promise<boolean>;
  onDeleteMember: (id: string) => Promise<boolean>;
}

interface MemberFormData {
  full_name: string;
  role: TeamRole;
  salary: number;
  monthly_hours: number;
}

const defaultFormData: MemberFormData = {
  full_name: "",
  role: "architect",
  salary: 5000,
  monthly_hours: 160,
};

export function SettingsTeamSection({
  team,
  isSaving,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: SettingsTeamSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(defaultFormData);

  const members = team?.members || [];
  const totals = team?.totals || { salaries: 0, hours: 0, hourly_rate: 0 };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleName = (role: string) => {
    const roleOption = TEAM_ROLES.find((r) => r.id === role);
    return roleOption?.name || role;
  };

  const handleRoleChange = (role: TeamRole) => {
    const defaults = getRoleDefaults(role);
    setFormData((prev) => ({
      ...prev,
      role,
      salary: defaults.salary,
      monthly_hours: defaults.hours,
    }));
  };

  const handleOpenAddModal = () => {
    setFormData(defaultFormData);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setFormData({
      full_name: member.full_name,
      role: member.role,
      salary: member.salary || 0,
      monthly_hours: member.monthly_hours,
    });
    setEditingMember(member);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setEditingMember(null);
    setFormData(defaultFormData);
  };

  const handleSubmitAdd = async () => {
    if (formData.full_name.trim().length < 2) return;
    const success = await onAddMember({
      full_name: formData.full_name.trim(),
      role: formData.role,
      salary: formData.salary,
      monthly_hours: formData.monthly_hours,
    });
    if (success) {
      handleCloseModals();
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingMember || formData.full_name.trim().length < 2) return;
    const success = await onUpdateMember(editingMember.id, {
      full_name: formData.full_name.trim(),
      role: formData.role,
      salary: formData.salary,
      monthly_hours: formData.monthly_hours,
    });
    if (success) {
      handleCloseModals();
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    const success = await onDeleteMember(deletingMember.id);
    if (success) {
      setDeletingMember(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Equipe
              </CardTitle>
              <CardDescription>
                Gerencie os membros do seu escritório
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddModal} disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro cadastrado</p>
              <p className="text-sm mt-1">Adicione o primeiro membro da equipe</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Members list */}
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-10 w-10 ${ROLE_COLORS[member.role] || "bg-muted"}`}>
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className={ROLE_COLORS[member.role] || ""}>
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleName(member.role)} •{" "}
                          {formatCurrency(member.salary || 0)}/mês •{" "}
                          {member.monthly_hours}h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditModal(member)}
                        disabled={isSaving}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingMember(member)}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
                <span>{members.length} membro(s)</span>
                <span>
                  {formatCurrency(totals.salaries)}/mês • {totals.hours}h •{" "}
                  {formatCurrency(totals.hourly_rate)}/h
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || !!editingMember}
        onOpenChange={(open) => !open && handleCloseModals()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Membro" : "Adicionar Membro"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Atualize as informações do membro"
                : "Preencha os dados do novo membro"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome Completo</Label>
              <Input
                id="member-name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                placeholder="Nome do membro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role">Cargo</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => handleRoleChange(v as TeamRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-salary">Salário (R$)</Label>
                <Input
                  id="member-salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salary: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-hours">Horas/mês</Label>
                <Input
                  id="member-hours"
                  type="number"
                  value={formData.monthly_hours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthly_hours: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="160"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button
              onClick={editingMember ? handleSubmitEdit : handleSubmitAdd}
              disabled={isSaving || formData.full_name.trim().length < 2}
            >
              {editingMember ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{deletingMember?.full_name}</strong> da equipe? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SettingsTeamSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48 mt-1" />
                </div>
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
