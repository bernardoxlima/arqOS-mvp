/**
 * Word Proposal Generator
 * Creates professional commercial proposals in Word format
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  Packer,
  ShadingType,
  type ISectionOptions,
} from "docx";
import type { WordProposalInput, GenerationResult } from "../types";

// Constants
const COLORS = {
  primary: "1E3A5F",
  secondary: "6B7280",
  accent: "10B981",
  text: "374151",
  lightText: "9CA3AF",
  border: "E5E7EB",
  background: "F9FAFB",
};

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format date
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Create a styled heading
 */
function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
    style: "Heading1",
  });
}

/**
 * Create a section heading
 */
function createSectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: COLORS.primary,
      }),
    ],
    spacing: { before: 400, after: 200 },
    border: {
      bottom: {
        color: COLORS.border,
        space: 1,
        size: 6,
        style: BorderStyle.SINGLE,
      },
    },
  });
}

/**
 * Create a labeled value paragraph
 */
function createLabeledValue(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 22,
        color: COLORS.text,
      }),
      new TextRun({
        text: value,
        size: 22,
        color: COLORS.text,
      }),
    ],
    spacing: { after: 100 },
  });
}

/**
 * Create header for document
 */
function createHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "ArqExpress",
            bold: true,
            size: 24,
            color: COLORS.primary,
          }),
          new TextRun({
            text: " | Transformando espaços",
            size: 20,
            color: COLORS.secondary,
          }),
        ],
        alignment: AlignmentType.LEFT,
        border: {
          bottom: {
            color: COLORS.primary,
            space: 1,
            size: 12,
            style: BorderStyle.SINGLE,
          },
        },
      }),
    ],
  });
}

/**
 * Create footer for document
 */
function createFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "ArqExpress - Proposta Comercial | Página ",
            size: 18,
            color: COLORS.secondary,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: COLORS.secondary,
          }),
          new TextRun({
            text: " de ",
            size: 18,
            color: COLORS.secondary,
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 18,
            color: COLORS.secondary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          top: {
            color: COLORS.border,
            space: 1,
            size: 6,
            style: BorderStyle.SINGLE,
          },
        },
      }),
    ],
  });
}

/**
 * Generate a commercial proposal Word document
 */
export async function generateProposalWord(
  input: WordProposalInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      projectType,
      projectDescription,
      serviceType,
      totalValue,
      paymentTerms,
      validUntil,
      sections = [],
      includeTerms = true,
      includeSignatureLine = true,
      templateStyle = "formal",
    } = input;

    const children: (Paragraph | Table)[] = [];

    // ==========================================================================
    // Title
    // ==========================================================================
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROPOSTA COMERCIAL",
            bold: true,
            size: 48,
            color: COLORS.primary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 400 },
      })
    );

    // Date
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Data: ${formatDate(new Date())}`,
            size: 22,
            color: COLORS.secondary,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    if (validUntil) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Válido até: ${formatDate(validUntil)}`,
              size: 22,
              color: COLORS.secondary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // ==========================================================================
    // Client Information
    // ==========================================================================
    children.push(createSectionHeading("Dados do Cliente"));

    // Client info table
    const clientRows: TableRow[] = [];

    const addClientRow = (label: string, value: string) => {
      clientRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      size: 22,
                      color: COLORS.text,
                    }),
                  ],
                }),
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.background, type: ShadingType.CLEAR },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: value,
                      size: 22,
                      color: COLORS.text,
                    }),
                  ],
                }),
              ],
              width: { size: 75, type: WidthType.PERCENTAGE },
            }),
          ],
        })
      );
    };

    addClientRow("Nome", clientName);
    if (clientEmail) addClientRow("E-mail", clientEmail);
    if (clientPhone) addClientRow("Telefone", clientPhone);
    if (clientAddress) addClientRow("Endereço", clientAddress);

    children.push(
      new Table({
        rows: clientRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    children.push(new Paragraph({ spacing: { after: 200 } }));

    // ==========================================================================
    // Project Information
    // ==========================================================================
    children.push(createSectionHeading("Sobre o Projeto"));

    children.push(createLabeledValue("Tipo de Projeto", projectType));
    children.push(createLabeledValue("Serviço", serviceType));

    if (projectDescription) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Descrição:",
              bold: true,
              size: 22,
              color: COLORS.text,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: projectDescription,
              size: 22,
              color: COLORS.text,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // ==========================================================================
    // Custom Sections
    // ==========================================================================
    for (const section of sections) {
      children.push(createSectionHeading(section.title));

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              size: 22,
              color: COLORS.text,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      if (section.items && section.items.length > 0) {
        section.items.forEach((item) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "• ",
                  size: 22,
                  color: COLORS.text,
                }),
                new TextRun({
                  text: `${item.label}: `,
                  bold: true,
                  size: 22,
                  color: COLORS.text,
                }),
                new TextRun({
                  text: item.value,
                  size: 22,
                  color: COLORS.text,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        });
      }
    }

    // ==========================================================================
    // Investment / Value
    // ==========================================================================
    children.push(
      new Paragraph({
        spacing: { before: 400 },
      })
    );

    children.push(
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "INVESTIMENTO",
                        bold: true,
                        size: 28,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: formatCurrency(totalValue),
                        bold: true,
                        size: 44,
                        color: "FFFFFF",
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 200 },
                  }),
                ],
                shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
              }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    // ==========================================================================
    // Payment Terms
    // ==========================================================================
    if (paymentTerms) {
      children.push(createSectionHeading("Condições de Pagamento"));

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paymentTerms,
              size: 22,
              color: COLORS.text,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // ==========================================================================
    // Terms and Conditions
    // ==========================================================================
    if (includeTerms) {
      children.push(createSectionHeading("Termos e Condições"));

      const terms = [
        "Esta proposta tem validade de 30 dias a partir da data de emissão.",
        "Os valores apresentados estão sujeitos a alteração mediante análise técnica detalhada.",
        "O início dos trabalhos está condicionado à aprovação formal desta proposta e pagamento inicial.",
        "Alterações no escopo poderão impactar prazos e valores acordados.",
        "Imagens e materiais de referência são ilustrativos e podem sofrer variações.",
        "Os direitos autorais do projeto pertencem à ArqExpress até quitação total.",
      ];

      terms.forEach((term, index) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${term}`,
                size: 20,
                color: COLORS.secondary,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // ==========================================================================
    // Signature Area
    // ==========================================================================
    if (includeSignatureLine) {
      children.push(
        new Paragraph({
          spacing: { before: 600 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Aceito os termos desta proposta:",
              size: 22,
              color: COLORS.text,
            }),
          ],
          spacing: { after: 400 },
        })
      );

      // Signature table
      children.push(
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "_".repeat(40),
                          size: 22,
                          color: COLORS.border,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: clientName,
                          size: 22,
                          color: COLORS.text,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Cliente",
                          size: 18,
                          color: COLORS.secondary,
                        }),
                      ],
                    }),
                  ],
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                }),
                new TableCell({
                  children: [new Paragraph({})],
                  width: { size: 10, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "_".repeat(40),
                          size: 22,
                          color: COLORS.border,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "ArqExpress",
                          size: 22,
                          color: COLORS.text,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Contratada",
                          size: 18,
                          color: COLORS.secondary,
                        }),
                      ],
                    }),
                  ],
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                  },
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      children.push(
        new Paragraph({
          spacing: { before: 400 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Local e Data: __________________________________, ___/___/______",
              size: 22,
              color: COLORS.text,
            }),
          ],
        })
      );
    }

    // ==========================================================================
    // Create Document
    // ==========================================================================
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          headers: {
            default: createHeader(),
          },
          footers: {
            default: createFooter(),
          },
          children,
        },
      ],
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 32,
              bold: true,
              color: COLORS.primary,
            },
          },
        ],
      },
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    return {
      success: true,
      data: buffer as Buffer,
      filename: `proposta-${clientName.toLowerCase().replace(/\s+/g, "-")}.docx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
  } catch (error) {
    console.error("Error generating proposal Word:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate Word document",
    };
  }
}
