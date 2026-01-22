"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Project, Workflow, ProjectStage, StageColor } from "../types";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { TimeEntryModal } from "./time-entry-modal";

interface KanbanBoardProps {
  projects: Project[];
  onMoveProject: (projectId: string, stage: string, hours: number, description?: string) => Promise<void>;
}

const stageColorClasses: Record<StageColor, { bg: string; border: string; bar: string }> = {
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", bar: "bg-purple-500" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", bar: "bg-blue-500" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", bar: "bg-cyan-500" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", bar: "bg-green-500" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", bar: "bg-yellow-500" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", bar: "bg-orange-500" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", bar: "bg-pink-500" },
  gray: { bg: "bg-gray-50 dark:bg-gray-950/30", border: "border-gray-200 dark:border-gray-800", bar: "bg-gray-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", bar: "bg-emerald-500" },
};

export function KanbanBoard({ projects, onMoveProject }: KanbanBoardProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    project: Project;
    targetStage: string;
    targetStageName: string;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Convert vertical scroll to horizontal scroll on the kanban board
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept if scrolling vertically and container can scroll horizontally
      if (e.deltaY !== 0 && container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get unique stages from all projects
  const stages = useMemo(() => {
    const stageMap = new Map<string, ProjectStage>();

    projects.forEach((project) => {
      const workflow = project.workflow as Workflow | null;
      if (workflow?.stages) {
        workflow.stages.forEach((stage) => {
          if (!stageMap.has(stage.id)) {
            stageMap.set(stage.id, stage);
          }
        });
      }
    });

    return Array.from(stageMap.values());
  }, [projects]);

  // Group projects by their current stage
  const projectsByStage = useMemo(() => {
    const grouped: Record<string, Project[]> = {};

    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    projects.forEach((project) => {
      const workflow = project.workflow as Workflow | null;
      if (workflow?.stages) {
        const currentIndex = workflow.current_stage_index ?? 0;
        const currentStage = workflow.stages[currentIndex];
        if (currentStage && grouped[currentStage.id]) {
          grouped[currentStage.id].push(project);
        }
      }
    });

    return grouped;
  }, [projects, stages]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const workflow = project.workflow as Workflow | null;
    if (!workflow?.stages) return;

    const currentIndex = workflow.current_stage_index ?? 0;
    const currentStage = workflow.stages[currentIndex];

    // Find target stage from the column id
    const targetStageId = over.id as string;
    const targetStage = stages.find((s) => s.id === targetStageId);

    if (!targetStage || targetStage.id === currentStage?.id) return;

    // Open modal to get hours
    setPendingMove({
      project,
      targetStage: targetStage.id,
      targetStageName: targetStage.name,
    });
  };

  const handleConfirmMove = async (hours: number, description?: string) => {
    if (!pendingMove) return;

    await onMoveProject(
      pendingMove.project.id,
      pendingMove.targetStage,
      hours,
      description
    );
    setPendingMove(null);
  };

  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum projeto com workflow encontrado.
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {stages.map((stage) => {
            const colors = stageColorClasses[stage.color] || stageColorClasses.gray;
            const stageProjects = projectsByStage[stage.id] || [];

            return (
              <SortableContext
                key={stage.id}
                items={stageProjects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={stage.id}
                  title={stage.name}
                  count={stageProjects.length}
                  className={`${colors.bg} ${colors.border}`}
                  borderColor={colors.bar}
                >
                  {stageProjects.map((project) => (
                    <KanbanCard key={project.id} project={project} />
                  ))}
                </KanbanColumn>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeProject && <KanbanCard project={activeProject} isDragging />}
        </DragOverlay>
      </DndContext>

      <TimeEntryModal
        open={!!pendingMove}
        onOpenChange={(open) => !open && setPendingMove(null)}
        projectName={(pendingMove?.project.client_snapshot as { name?: string } | null)?.name || "Projeto"}
        targetStage={pendingMove?.targetStageName || ""}
        onConfirm={handleConfirmMove}
      />
    </>
  );
}
