import { NextRequest, NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/modules/projects/services/projects.service";
import {
  updateProjectSchema,
  uuidParamSchema,
} from "@/modules/projects/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const result = await getProjectById(id);

    if (result.error) {
      const status = result.error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Projeto não encontrado" : result.error.message },
        { status }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update an existing project
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateProject(id, parsed.data);

    if (result.error) {
      const status = result.error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Projeto não encontrado" : result.error.message },
        { status }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const result = await deleteProject(id);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
