"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { TeamData, TeamMember } from "../types";

export interface TeamSummaryCardProps {
  team: TeamData | null;
  isLoading?: boolean;
  maxVisible?: number;
}

/**
 * Role colors for avatar background
 */
const ROLE_COLORS: Record<TeamMember["role"], string> = {
  owner: "bg-violet-500",
  coordinator: "bg-blue-500",
  architect: "bg-emerald-500",
  intern: "bg-amber-500",
  admin: "bg-gray-500",
};

/**
 * Role labels in Portuguese
 */
const ROLE_LABELS: Record<TeamMember["role"], string> = {
  owner: "Proprietario",
  coordinator: "Coordenador",
  architect: "Arquiteto",
  intern: "Estagiario",
  admin: "Administrador",
};

/**
 * Get initials from full name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * TeamSummaryCard - Displays team members with avatars
 */
export function TeamSummaryCard({
  team,
  isLoading,
  maxVisible = 5,
}: TeamSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const members = team?.members || [];
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Equipe ({members.length} {members.length === 1 ? "pessoa" : "pessoas"})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum membro cadastrado
          </p>
        ) : (
          <>
            {visibleMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {member.avatar_url && (
                    <AvatarImage src={member.avatar_url} alt={member.full_name} />
                  )}
                  <AvatarFallback className={`text-white text-xs ${ROLE_COLORS[member.role]}`}>
                    {getInitials(member.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{member.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[member.role]}
                  </p>
                </div>
              </div>
            ))}
            {remainingCount > 0 && (
              <Link
                href="/configuracoes/equipe"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                +{remainingCount} {remainingCount === 1 ? "membro" : "membros"}
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
