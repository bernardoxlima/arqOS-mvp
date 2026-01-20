import { NextRequest, NextResponse } from "next/server";
import {
  listProjects,
  createProject,
  countProjects,
} from "@/modules/projects/services/projects.service";
import {
  projectFiltersSchema,
  createProjectSchema,
} from "@/modules/projects/schemas";

/**
 * GET /api/projects
 * List projects with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilters = Object.fromEntries(searchParams);

    // Validate filters
    const parsed = projectFiltersSchema.safeParse(rawFilters);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Filtros inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const filters = parsed.data;

    // Fetch projects and count in parallel
    const [projectsResult, countResult] = await Promise.all([
      listProjects(filters),
      countProjects(filters),
    ]);

    if (projectsResult.error) {
      return NextResponse.json(
        { error: projectsResult.error.message },
        { status: 500 }
      );
    }

    // Return with pagination metadata
    return NextResponse.json({
      data: projectsResult.data,
      pagination: {
        total: countResult.data || 0,
        limit: filters.limit,
        offset: filters.offset,
        hasMore:
          (countResult.data || 0) > filters.offset + (projectsResult.data?.length || 0),
      },
    });
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await createProject(parsed.data);

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
