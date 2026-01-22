import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { generateSchedulePDF, generateScheduleTimeline } from "@/modules/documents";
import { z } from "zod";

const scheduleSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  serviceType: z.enum(["decorexpress", "projetexpress", "produzexpress", "consultexpress"]),
  modality: z.enum(["online", "presencial"]),
  environments: z.number().int().min(1).max(10).default(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  projectId: z.string().uuid().optional(),
  logoUrl: z.string().url().optional(),
  format: z.enum(["pdf", "json"]).default("pdf"),
});

/**
 * POST /api/documents/schedule
 * Generate delivery schedule (PDF or JSON timeline)
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validation = scheduleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If format is JSON, return the timeline data only
    if (data.format === "json") {
      const result = generateScheduleTimeline({
        clientName: data.clientName,
        serviceType: data.serviceType,
        modality: data.modality,
        environments: data.environments,
        startDate: data.startDate,
        projectId: data.projectId,
      });

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          timeline: result.timeline.map((item) => ({
            ...item,
            date: item.date.toISOString(),
          })),
        },
      });
    }

    // Default: Generate PDF
    const result = await generateSchedulePDF({
      clientName: data.clientName,
      serviceType: data.serviceType,
      modality: data.modality,
      environments: data.environments,
      startDate: data.startDate,
      projectId: data.projectId,
      logoUrl: data.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate schedule PDF" },
        { status: 500 }
      );
    }

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.mimeType || "application/pdf",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
