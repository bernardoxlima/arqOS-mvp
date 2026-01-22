"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, Search, LayoutGrid, List, Columns3, Filter } from "lucide-react";

import {
  useProjects,
  ProjectCard,
  EmptyState,
  ProjectModal,
  type CreateProjectData,
  type ProjectStatus,
  type ProjectFilters,
} from "@/modules/projects";

// Lazy load KanbanBoard - only loaded when user selects kanban view
const KanbanBoard = dynamic(
  () => import("@/modules/projects/components/kanban-board").then((m) => m.KanbanBoard),
  {
    loading: () => (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[400px] w-72 flex-shrink-0 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    ),
  }
);
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "sonner";

type ViewMode = "grid" | "list" | "kanban";

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

function ProjectsLoading({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "kanban") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-72 flex-shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  // Memoize filters to prevent unnecessary refetches
  const filters: ProjectFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [searchTerm, statusFilter]
  );

  const {
    projects,
    isLoading,
    error,
    createProject,
    deleteProject,
    refetch,
  } = useProjects({ filters });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as ProjectStatus | "all");
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    const result = await createProject(data);
    if (result) {
      toast.success("Projeto criado com sucesso!");
    } else {
      toast.error("Erro ao criar projeto", {
        description: "Tente novamente mais tarde.",
      });
      throw new Error("Failed to create project");
    }
  };

  const handleDeleteProject = async (project: { id: string }) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) {
      return;
    }
    const success = await deleteProject(project.id);
    if (success) {
      toast.success("Projeto excluído com sucesso!");
    } else {
      toast.error("Erro ao excluir projeto");
    }
  };

  const handleMoveProject = async (
    projectId: string,
    stage: string,
    hours: number,
    description?: string
  ) => {
    try {
      // Move to stage
      const moveResponse = await fetch(`/api/projects/${projectId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });

      if (!moveResponse.ok) {
        throw new Error("Failed to move project");
      }

      // Add time entry if hours > 0
      if (hours > 0) {
        const timeResponse = await fetch(`/api/projects/${projectId}/time-entry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            hours,
            description,
            date: new Date().toISOString().split("T")[0],
          }),
        });

        if (!timeResponse.ok) {
          toast.error("Erro ao registrar horas", { description: "O projeto foi movido, mas as horas nao foram registradas." });
        }
      }

      toast.success("Projeto movido com sucesso!");
      await refetch();
    } catch {
      toast.error("Erro ao mover projeto");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe o progresso
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid" className="px-3" title="Grade">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list" className="px-3" title="Lista">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="kanban" className="px-3" title="Kanban">
              <Columns3 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">Erro ao carregar projetos</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <ProjectsLoading viewMode={viewMode} />}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <EmptyState onCreateProject={() => setIsModalOpen(true)} />
      )}

      {/* Projects view */}
      {!isLoading && !error && projects.length > 0 && (
        <>
          {viewMode === "kanban" ? (
            <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
              <KanbanBoard projects={projects} onMoveProject={handleMoveProject} />
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create project modal */}
      <ProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
