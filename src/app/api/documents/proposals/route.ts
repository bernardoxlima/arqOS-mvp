import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { generateProposalPDF, generateProposalWord } from "@/modules/documents";
import { z } from "zod";

const proposalSchema = z.object({
  format: z.enum(["pdf", "docx"]).default("pdf"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  projectType: z.string().min(1, "Project type is required"),
  projectDescription: z.string().optional(),
  serviceType: z.string().min(1, "Service type is required"),
  totalValue: z.number().positive("Total value must be positive"),
  paymentTerms: z.string().optional(),
  validUntil: z.string().optional(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    items: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
  })).optional(),
  includeTerms: z.boolean().default(true),
  includeSignatureLine: z.boolean().default(true),
  logoUrl: z.string().url().optional(),
  templateStyle: z.enum(["formal", "modern", "minimal"]).default("formal"),
});

/**
 * POST /api/documents/proposals
 * Generate a commercial proposal (PDF or Word)
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
    const validation = proposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate document based on format
    if (data.format === "docx") {
      const result = await generateProposalWord({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        projectType: data.projectType,
        projectDescription: data.projectDescription,
        serviceType: data.serviceType,
        totalValue: data.totalValue,
        paymentTerms: data.paymentTerms,
        validUntil: data.validUntil,
        sections: data.sections,
        includeTerms: data.includeTerms,
        includeSignatureLine: data.includeSignatureLine,
        logoUrl: data.logoUrl,
        templateStyle: data.templateStyle,
      });

      if (!result.success || !result.data) {
        return NextResponse.json(
          { error: result.error || "Failed to generate Word document" },
          { status: 500 }
        );
      }

      return new NextResponse(new Uint8Array(result.data), {
        headers: {
          "Content-Type": result.mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }

    // Default: PDF
    const result = await generateProposalPDF({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      projectType: data.projectType,
      projectDescription: data.projectDescription,
      serviceType: data.serviceType,
      totalValue: data.totalValue,
      paymentTerms: data.paymentTerms,
      validUntil: data.validUntil,
      sections: data.sections,
      includeTerms: data.includeTerms,
      logoUrl: data.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate PDF" },
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
    console.error("Error generating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
