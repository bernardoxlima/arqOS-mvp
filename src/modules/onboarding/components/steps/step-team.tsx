"use client";

import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { TeamMemberData, TeamRole } from "../../types";
import { TEAM_ROLES, getRoleDefaults, formatCurrency } from "../../constants";

interface StepTeamProps {
  value: TeamMemberData[];
  onAdd: (member: TeamMemberData) => void;
  onUpdate: (index: number, member: TeamMemberData) => void;
  onRemove: (index: number) => void;
}

const emptyMember: Omit<TeamMemberData, "id"> = {
  name: "",
  role: "architect",
  salary: 5000,
  monthlyHours: 160,
};

export function StepTeam({ value, onAdd, onUpdate: _onUpdate, onRemove }: StepTeamProps) {
  const [newMember, setNewMember] = useState<Omit<TeamMemberData, "id">>(emptyMember);
  const [isAdding, setIsAdding] = useState(value.length === 0);

  const handleRoleChange = (role: TeamRole) => {
    const defaults = getRoleDefaults(role);
    setNewMember((prev) => ({
      ...prev,
      role,
      salary: defaults.salary,
      monthlyHours: defaults.hours,
    }));
  };

  const handleAdd = () => {
    if (newMember.name.trim().length < 2) return;
    onAdd(newMember);
    setNewMember(emptyMember);
    setIsAdding(false);
  };

  const totalSalary = value.reduce((sum, m) => sum + m.salary, 0);
  const totalHours = value.reduce((sum, m) => sum + m.monthlyHours, 0);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quem faz parte da equipe?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione os membros do seu escritório
        </p>
      </div>

      {/* Existing members */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((member, index) => (
            <Card key={index} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {TEAM_ROLES.find((r) => r.id === member.role)?.name} •{" "}
                        {formatCurrency(member.salary)}/mês • {member.monthlyHours}h
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>Total: {value.length} pessoa(s)</span>
            <span>
              {formatCurrency(totalSalary)}/mês • {totalHours}h
            </span>
          </div>
        </div>
      )}

      {/* Add new member form */}
      {isAdding ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="member-name">Nome</Label>
                <Input
                  id="member-name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome completo"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="member-role">Cargo</Label>
                <Select
                  value={newMember.role}
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

              <div className="space-y-2">
                <Label htmlFor="member-salary">Salário (R$)</Label>
                <Input
                  id="member-salary"
                  type="number"
                  value={newMember.salary}
                  onChange={(e) =>
                    setNewMember((prev) => ({
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
                  value={newMember.monthlyHours}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      monthlyHours: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="160"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              {value.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewMember(emptyMember);
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleAdd}
                disabled={newMember.name.trim().length < 2}
              >
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      )}
    </div>
  );
}
