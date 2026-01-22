"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Clock } from "lucide-react";

import type { Project, Workflow, Financials } from "../types";
import { cn } from "@/shared/lib/utils";
import { getWorkflowProgress } from "../hooks/use-projects";

interface KanbanCardProps {
  project: Project;
  isDragging?: boolean;
}

const serviceTypeLabels: Record<string, string> = {
  decorexpress: "DecorExpress",
  producao: "Produção",
  projetexpress: "ProjetExpress",
};

export function KanbanCard({ project, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: project.id });

  const workflow = project.workflow as Workflow | null;
  const financials = project.financials as Financials | null;
  const progress = getWorkflowProgress(workflow);
  const serviceLabel = workflow?.type ? serviceTypeLabels[workflow.type] : "";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-background rounded-lg border p-3 shadow-sm transition-shadow",
        "hover:shadow-md cursor-grab active:cursor-grabbing",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg"
      )}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {serviceLabel && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground">
                {serviceLabel}
              </span>
            </div>
          )}

          <Link
            href={`/projetos/${project.id}`}
            className="text-sm font-medium hover:underline line-clamp-2"
          >
            {(project.client_snapshot as { name?: string } | null)?.name ||
              "Cliente não definido"}
          </Link>

          <div className="mt-2 space-y-1.5">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8">
                {progress}%
              </span>
            </div>

            {/* Hours */}
            {financials && (financials.hours_used || financials.estimated_hours) ? (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {financials.hours_used || 0}h / {financials.estimated_hours || 0}h
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
