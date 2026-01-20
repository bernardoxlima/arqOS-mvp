/**
 * Presentation PowerPoint Generator
 * Creates visual presentation with cover, photos, moodboard, references, floor plan, and renders
 */

import type { PresentationPPTInput, GenerationResult } from "../types";
import {
  createPresentation,
  createCoverSlide,
  createSectionSlide,
  createFullImageSlide,
  createImageGridSlide,
  imageUrlToBase64,
  formatDate,
} from "../utils/pptx-helpers";

/**
 * Generate a presentation PowerPoint
 */
export async function generatePresentationPPT(
  input: PresentationPPTInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientData,
      images,
      includePhotosBefore = true,
      includeMoodboard = true,
      includeReferences = true,
      includeFloorPlan = true,
      includeRenders = true,
      logoUrl,
    } = input;

    // Convert logo to base64 if provided
    const logoData = logoUrl ? await imageUrlToBase64(logoUrl) : null;

    // Create presentation
    const pptx = createPresentation({
      title: `Apresentação - ${clientData.clientName}`,
      subject: clientData.projectType || "Projeto de Interiores",
      company: "ArqExpress",
    });

    // Get images by section
    const getImagesBySection = (section: string) =>
      images.find((img) => img.section === section)?.images || [];

    // Convert all image URLs to base64
    const convertImages = async (
      imageList: Array<{ url: string; displayOrder: number }>
    ): Promise<string[]> => {
      const results = await Promise.all(
        imageList
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((img) => imageUrlToBase64(img.url))
      );
      return results.filter((img): img is string => img !== null);
    };

    // ==========================================================================
    // Slide 1: Cover
    // ==========================================================================
    const renderImages = getImagesBySection("renders");
    let coverBackground: string | undefined;

    if (renderImages.length > 0) {
      coverBackground = (await imageUrlToBase64(renderImages[0].url)) || undefined;
    }

    createCoverSlide(pptx, {
      title: clientData.clientName,
      subtitle: [clientData.projectType, clientData.ambiente].filter(Boolean).join(" | "),
      date: clientData.date ? formatDate(clientData.date) : formatDate(new Date()),
      backgroundImage: coverBackground,
      logoData: logoData || undefined,
    });

    // ==========================================================================
    // Slide 2: Client Data (if address provided)
    // ==========================================================================
    if (clientData.clientAddress) {
      const slide = pptx.addSlide();

      if (logoData) {
        slide.addImage({
          data: logoData,
          x: 0.4,
          y: 0.4,
          w: 1.6,
          h: 0.33,
        });
      }

      slide.addText("Dados do Cliente", {
        x: 0.4,
        y: 1.2,
        w: 9.2,
        h: 0.5,
        fontSize: 24,
        fontFace: "Arial",
        color: "1E3A5F",
        bold: true,
      });

      const clientInfo = [
        { label: "Cliente", value: clientData.clientName },
        { label: "Endereço", value: clientData.clientAddress },
        clientData.projectType && { label: "Tipo de Projeto", value: clientData.projectType },
        clientData.ambiente && { label: "Ambiente", value: clientData.ambiente },
      ].filter(Boolean) as Array<{ label: string; value: string }>;

      let yPos = 2;
      clientInfo.forEach((info) => {
        slide.addText(info.label + ":", {
          x: 0.4,
          y: yPos,
          w: 2,
          h: 0.4,
          fontSize: 12,
          fontFace: "Arial",
          color: "6B7280",
          bold: true,
        });
        slide.addText(info.value, {
          x: 2.5,
          y: yPos,
          w: 7,
          h: 0.4,
          fontSize: 12,
          fontFace: "Arial",
          color: "374151",
        });
        yPos += 0.5;
      });
    }

    // ==========================================================================
    // Section: Photos Before
    // ==========================================================================
    if (includePhotosBefore) {
      const photosBefore = getImagesBySection("photos_before");
      if (photosBefore.length > 0) {
        createSectionSlide(pptx, "Fotos Antes", {
          subtitle: "Estado atual do ambiente",
          logoData: logoData || undefined,
        });

        const photoData = await convertImages(photosBefore);
        if (photoData.length > 0) {
          createImageGridSlide(pptx, photoData, {
            title: "Fotos do Ambiente Atual",
            logoData: logoData || undefined,
          });
        }
      }
    }

    // ==========================================================================
    // Section: Moodboard
    // ==========================================================================
    if (includeMoodboard) {
      const moodboard = getImagesBySection("moodboard");
      if (moodboard.length > 0) {
        createSectionSlide(pptx, "Moodboard", {
          subtitle: "Conceito e inspirações",
          logoData: logoData || undefined,
        });

        const moodboardData = await convertImages(moodboard);
        if (moodboardData.length > 0) {
          createFullImageSlide(pptx, moodboardData[0], {
            title: "Moodboard",
            logoData: logoData || undefined,
          });
        }
      }
    }

    // ==========================================================================
    // Section: References
    // ==========================================================================
    if (includeReferences) {
      const references = getImagesBySection("references");
      if (references.length > 0) {
        createSectionSlide(pptx, "Referências", {
          subtitle: "Inspirações visuais",
          logoData: logoData || undefined,
        });

        const refData = await convertImages(references);
        // Split into slides of 6 images each
        for (let i = 0; i < refData.length; i += 6) {
          const slideImages = refData.slice(i, i + 6);
          createImageGridSlide(pptx, slideImages, {
            title: `Referências ${i > 0 ? `(${Math.floor(i / 6) + 1})` : ""}`,
            logoData: logoData || undefined,
          });
        }
      }
    }

    // ==========================================================================
    // Section: Floor Plan
    // ==========================================================================
    if (includeFloorPlan) {
      const floorPlan = getImagesBySection("floor_plan");
      if (floorPlan.length > 0) {
        createSectionSlide(pptx, "Planta Baixa", {
          subtitle: "Layout do projeto",
          logoData: logoData || undefined,
        });

        const floorPlanData = await convertImages(floorPlan);
        if (floorPlanData.length > 0) {
          createFullImageSlide(pptx, floorPlanData[0], {
            title: "Planta Baixa com Layout",
            logoData: logoData || undefined,
          });
        }
      }
    }

    // ==========================================================================
    // Section: Renders
    // ==========================================================================
    if (includeRenders) {
      const renders = getImagesBySection("renders");
      if (renders.length > 0) {
        createSectionSlide(pptx, "Projeto 3D", {
          subtitle: "Visualização do projeto",
          logoData: logoData || undefined,
        });

        const renderData = await convertImages(renders);
        // Each render gets its own full-bleed slide
        renderData.forEach((imgData, index) => {
          createFullImageSlide(pptx, imgData, {
            title: `Render ${index + 1}`,
            logoData: logoData || undefined,
          });
        });
      }
    }

    // ==========================================================================
    // Final Slide: Thank You
    // ==========================================================================
    createSectionSlide(pptx, "Obrigado!", {
      subtitle: "ArqExpress - Transformando espaços",
      logoData: logoData || undefined,
    });

    // Generate buffer
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `apresentacao-${clientData.clientName.toLowerCase().replace(/\s+/g, "-")}.pptx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
  } catch (error) {
    console.error("Error generating presentation PPT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate presentation",
    };
  }
}
