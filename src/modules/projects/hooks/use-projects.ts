"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Project,
  ProjectFilters,
  CreateProjectData,
  UpdateProjectData,
  Workflow,
} from "../types";

// Query keys factory
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// API functions
async function fetchProjects(filters: ProjectFilters): Promise<{ data: Project[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.serviceType) params.set("serviceType", filters.serviceType);
  if (filters.search) params.set("search", filters.search);
  if (filters.stage) params.set("stage", filters.stage);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));

  const response = await fetch(`/api/projects?${params.toString()}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch projects");
  }

  return {
    data: result.data || [],
    total: result.total || result.data?.length || 0,
  };
}

async function createProjectApi(data: CreateProjectData): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to create project");
  }

  return result.data;
}

async function updateProjectApi({ id, data }: { id: string; data: UpdateProjectData }): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to update project");
  }

  return result.data;
}

async function deleteProjectApi(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to delete project");
  }
}

interface UseProjectsOptions {
  filters?: ProjectFilters;
  enabled?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { filters = {}, enabled = true } = options;
  const queryClient = useQueryClient();

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  // Query for fetching projects
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: projectKeys.list(memoizedFilters),
    queryFn: () => fetchProjects(memoizedFilters),
    enabled,
  });

  // Mutation for creating projects
  const createMutation = useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      // Invalidate all project lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });

  // Mutation for updating projects
  const updateMutation = useMutation({
    mutationFn: updateProjectApi,
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject
      );
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });

  // Mutation for deleting projects
  const deleteMutation = useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(deletedId) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });

  // Wrapper functions to maintain similar API
  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    try {
      return await createMutation.mutateAsync(projectData);
    } catch {
      return null;
    }
  };

  const updateProject = async (id: string, projectData: UpdateProjectData): Promise<Project | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data: projectData });
    } catch {
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    // Data
    projects: data?.data ?? [],
    total: data?.total ?? 0,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    error: error?.message ?? null,
    createError: createMutation.error?.message ?? null,
    updateError: updateMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,

    // Actions
    refetch,
    createProject,
    updateProject,
    deleteProject,
  };
}

// Hook for fetching a single project
export function useProject(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch project");
      }

      return result.data as Project;
    },
    enabled: enabled && !!id,
  });
}

// Helper to get current stage name from workflow
export function getCurrentStageName(workflow: Workflow | null): string {
  if (!workflow || !workflow.stages) return "Sem etapa";
  const currentIndex = workflow.current_stage_index ?? 0;
  return workflow.stages[currentIndex]?.name ?? "Sem etapa";
}

// Helper to get progress percentage from workflow
export function getWorkflowProgress(workflow: Workflow | null): number {
  if (!workflow || !workflow.stages || workflow.stages.length === 0) return 0;
  const currentIndex = workflow.current_stage_index ?? 0;
  return Math.round((currentIndex / (workflow.stages.length - 1)) * 100);
}
