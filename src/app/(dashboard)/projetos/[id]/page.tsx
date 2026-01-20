"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  User,
  Check,
  Circle,
  Loader2,
} from "lucide-react";

import type { Project, Workflow, Financials, ProjectStage, StageColor } from "@/modules/projects";
import { getCurrentStageName, getWorkflowProgress } from "@/modules/projects";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  paused: { label: "Pausado", variant: "outline" },
  completed: { label: "Concluído", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const serviceTypeLabels: Record<string, string> = {
  decorexpress: "DecorExpress",
  producao: "Produção",
  projetexpress: "ProjetExpress",
};

const stageColorClasses: Record<StageColor, { bg: string; text: string; border: string }> = {
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-500" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-500" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-500" },
  green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-500" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-500" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-500" },
  pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-500" },
  gray: { bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-500" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-500" },
};

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px] md:col-span-2" />
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch project");
      }

      setProject(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      toast.success("Projeto excluído com sucesso!");
      router.push("/projetos");
    } catch {
      toast.error("Erro ao excluir projeto");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/projetos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar projeto</CardTitle>
            <CardDescription>{error || "Projeto não encontrado"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const workflow = project.workflow as Workflow | null;
  const financials = project.financials as Financials | null;
  const clientSnapshot = project.client_snapshot as { name?: string; contact?: Record<string, string> } | null;
  const currentStageName = getCurrentStageName(workflow);
  const progress = getWorkflowProgress(workflow);
  const statusInfo = statusConfig[project.status] || statusConfig.draft;
  const serviceLabel = workflow?.type ? serviceTypeLabels[workflow.type] : "Projeto";
  const currentStageIndex = workflow?.current_stage_index ?? 0;

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projetos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-muted-foreground">
                {project.code}
              </span>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <Badge variant="outline">{serviceLabel}</Badge>
            </div>
            <h1 className="text-2xl font-bold">
              {clientSnapshot?.name || "Cliente não definido"}
            </h1>
            <p className="text-muted-foreground">
              Criado {project.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: ptBR }) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{clientSnapshot?.name || "—"}</p>
            </div>
            {clientSnapshot?.contact?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{clientSnapshot.contact.email}</p>
              </div>
            )}
            {clientSnapshot?.contact?.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{clientSnapshot.contact.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress and financials */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Etapa atual</p>
                  <p className="text-lg font-semibold">{currentStageName}</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso geral</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Horas usadas</p>
                      <p className="font-semibold">
                        {financials?.hours_used || 0}h / {financials?.estimated_hours || 0}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-semibold">
                        {formatCurrency(financials?.value || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Criado em</p>
                      <p className="font-semibold">{formatDate(project.created_at)}</p>
                    </div>
                  </div>
                  {project.completed_at && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Concluído em</p>
                        <p className="font-semibold">{formatDate(project.completed_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {workflow?.stages && workflow.stages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linha do Tempo</CardTitle>
            <CardDescription>
              Acompanhe o progresso do projeto por etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

              <div className="space-y-4">
                {workflow.stages.map((stage: ProjectStage, index: number) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const colors = stageColorClasses[stage.color] || stageColorClasses.gray;

                  return (
                    <div key={stage.id} className="relative flex items-start gap-4 pl-2">
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${
                          isCompleted
                            ? `${colors.bg} border-transparent`
                            : isCurrent
                            ? `${colors.border} bg-background`
                            : "border-muted bg-background"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Circle
                            className={`h-3 w-3 ${
                              isCurrent ? colors.text : "text-muted-foreground"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-4 ${!isCurrent && !isCompleted ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stage.name}</span>
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {stage.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {project.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto <strong>{project.code}</strong> será
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
