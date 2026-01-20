"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  className?: string;
}

export function KanbanColumn({
  id,
  title,
  count,
  children,
  className,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 rounded-lg border p-3 transition-colors",
        isOver && "ring-2 ring-primary/50",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold truncate">{title}</h3>
        <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-muted text-xs font-medium">
          {count}
        </span>
      </div>
      <div className="space-y-2 min-h-[100px]">{children}</div>
    </div>
  );
}
