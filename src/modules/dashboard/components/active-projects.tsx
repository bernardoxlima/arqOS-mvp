"use client";

import Link from "next/link";
import type { RecentProject } from "../types";
import { cn } from "@/shared/lib/utils";
import { formatHours } from "@/shared/lib/format";

export interface ActiveProjectsProps {
  projects: RecentProject[];
  /** Optional hours stats to calculate progress */
  hoursStats?: {
    byProject: Array<{
      projectId: string;
      projectCode: string;
      hours: number;
    }>;
  };
  className?: string;
}

/**
 * Get progress percentage based on hours used vs estimated
 */
function getProgressPercentage(
  hoursUsed: number,
  estimatedHours?: number
): number {
  if (!estimatedHours || estimatedHours === 0) {
    return 0;
  }
  return Math.min((hoursUsed / estimatedHours) * 100, 150); // Cap at 150%
}

/**
 * Get progress bar color based on percentage
 */
function getProgressColor(percentage: number): string {
  if (percentage > 100) {
    return "bg-red-500";
  }
  if (percentage >= 80) {
    return "bg-amber-500";
  }
  return "bg-emerald-500";
}

/**
 * ActiveProjects - Displays a list of active projects with progress bars
 */
export function ActiveProjects({
  projects,
  hoursStats,
  className,
}: ActiveProjectsProps) {
  // Filter only active projects (in_progress status)
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "active"
  );

  if (activeProjects.length === 0) {
    return (
      <div className={cn("arq-card p-6", className)}>
        <h3 className="font-semibold mb-4">Projetos Ativos</h3>
        <p className="text-sm text-muted-foreground">
          Nenhum projeto ativo no momento.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("arq-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Projetos Ativos</h3>
        <Link
          href="/dashboard/projetos"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos
        </Link>
      </div>
      <div className="space-y-4">
        {activeProjects.slice(0, 5).map((project) => {
          const projectHours =
            hoursStats?.byProject.find((h) => h.projectId === project.id)
              ?.hours ?? project.financials?.hoursUsed ?? 0;

          // Assume 40 hours estimated if not available (arbitrary default)
          const estimatedHours = 40;
          const percentage = getProgressPercentage(projectHours, estimatedHours);
          const progressColor = getProgressColor(percentage);

          return (
            <Link
              key={project.id}
              href={`/dashboard/projetos/${project.id}`}
              className="block group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {project.code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {project.client?.name ?? "Sem cliente"} -{" "}
                    {project.stage ?? project.status}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatHours(projectHours, estimatedHours)}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={cn("progress-fill", progressColor)}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {percentage > 100 && (
                <p className="text-xs text-red-500 mt-1">
                  Excedeu {Math.round(percentage - 100)}% do previsto
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
