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
  Loader2,
  ListChecks,
  CalendarDays,
  FileText,
  Check,
} from "lucide-react";

import type { Project, Workflow, Financials, ServiceType } from "@/modules/projects";
import { getCurrentStageName, getWorkflowProgress, TabEtapas, TabAgenda, TabEscopo } from "@/modules/projects";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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
  aguardando: { label: "Aguardando", variant: "secondary" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  entregue: { label: "Entregue", variant: "default" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const serviceTypeLabels: Record<string, string> = {
  decorexpress: "DecorExpress",
  producao: "Produção",
  projetexpress: "ProjetExpress",
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
  const statusInfo = statusConfig[project.status] || statusConfig.aguardando;
  const serviceLabel = workflow?.type ? serviceTypeLabels[workflow.type] : "Projeto";

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
                  {(financials?.hours_used || financials?.estimated_hours) ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Horas usadas</p>
                        <p className="font-semibold">
                          {financials?.hours_used || 0}h / {financials?.estimated_hours || 0}h
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {financials?.value ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="font-semibold">
                          {formatCurrency(financials.value)}
                        </p>
                      </div>
                    </div>
                  ) : null}
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

      {/* Tabs: Etapas, Agenda, Escopo */}
      {workflow && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="etapas">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="etapas" className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Etapas do Processo</span>
                  <span className="sm:hidden">Etapas</span>
                </TabsTrigger>
                <TabsTrigger value="agenda" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Agenda de Entregas</span>
                  <span className="sm:hidden">Agenda</span>
                </TabsTrigger>
                <TabsTrigger value="escopo" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Escopo do Serviço</span>
                  <span className="sm:hidden">Escopo</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="etapas">
                <TabEtapas workflow={workflow} startDate={project.created_at} />
              </TabsContent>

              <TabsContent value="agenda">
                <TabAgenda
                  workflow={workflow}
                  projectCode={project.code}
                  clientName={clientSnapshot?.name || "Cliente"}
                  startDate={project.created_at}
                />
              </TabsContent>

              <TabsContent value="escopo">
                <TabEscopo serviceType={(workflow.type || "decorexpress") as ServiceType} />
              </TabsContent>
            </Tabs>
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
              Esta ação não pode ser desfeita. Este projeto será permanentemente excluído.
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
