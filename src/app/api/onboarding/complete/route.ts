import { NextRequest, NextResponse } from "next/server";
import { completeSetup } from "@/modules/onboarding/services/onboarding.service";
import { completeSetupSchema } from "@/modules/onboarding/schemas";

/**
 * POST /api/onboarding/complete
 * Complete the setup wizard and save all configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = completeSetupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await completeSetup(parsed.data);

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json({
      success: true,
      organizationId: result.data?.organizationId,
    });
  } catch (error) {
    console.error("Error completing setup:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
