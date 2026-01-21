import { NextRequest, NextResponse } from "next/server";
import {
  getSetupStatus,
  updateSetupStep,
  skipSetup,
} from "@/modules/onboarding/services/onboarding.service";
import { updateStepSchema } from "@/modules/onboarding/schemas";

/**
 * GET /api/onboarding/status
 * Get setup status for the current user's organization
 */
export async function GET() {
  try {
    const result = await getSetupStatus();

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error getting setup status:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/status
 * Update setup step progress
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateStepSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await updateSetupStep(parsed.data.step);

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating setup step:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/onboarding/status
 * Skip the setup wizard
 */
export async function DELETE() {
  try {
    const result = await skipSetup();

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error skipping setup:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
