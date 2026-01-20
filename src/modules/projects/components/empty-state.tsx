"use client";

import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface EmptyStateProps {
  onCreateProject?: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FolderKanban className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Nenhum projeto encontrado</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Comece criando seu primeiro projeto para gerenciar suas entregas de forma eficiente.
      </p>
      {onCreateProject && (
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      )}
    </div>
  );
}
