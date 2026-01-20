import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { SavedBudget } from '@/types/budget';

const SERVICE_NAMES: Record<string, string> = {
  decorexpress: 'DECOREXPRESS',
  producao: 'PRODUZEXPRESS',
  projetexpress: 'PROJETEXPRESS',
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (): string => {
  const now = new Date();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `Porto Alegre, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
};

const loadImageAsBase64 = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await blob.arrayBuffer();
  } catch (error) {
    console.error('Erro ao carregar imagem:', error);
    return null;
  }
};

export const generateProposalDOC = async (budget: SavedBudget): Promise<void> => {
  const finalValue = budget.calculation.discount > 0 
    ? budget.calculation.priceWithDiscount 
    : budget.calculation.finalPrice;

  // Service details
  let serviceDesc = '';
  if (budget.service === 'projetexpress') {
    serviceDesc = `${budget.serviceDetails.projectType === 'novo' ? 'Apartamento Novo' : 'Reforma'} - ${budget.serviceDetails.projectArea}m²`;
  } else {
    const envCount = budget.serviceDetails.environmentsConfig?.length || 1;
    const extras = budget.serviceDetails.extraEnvironments || 0;
    serviceDesc = `${envCount} ambiente${envCount > 1 ? 's' : ''}${extras > 0 ? ` + ${extras} extra${extras > 1 ? 's' : ''}` : ''}`;
  }

  // Payment method
  let paymentMethod = '';
  if (budget.serviceDetails.paymentType === 'cash') {
    paymentMethod = `À vista via PIX/Transferência com ${Math.round(budget.calculation.discount * 100)}% de desconto`;
  } else {
    const maxInstallments = finalValue <= 5000 ? 6 : 10;
    paymentMethod = `Parcelado em até ${maxInstallments}x sem juros no cartão`;
  }

  const discountText = budget.calculation.discount > 0 
    ? `${Math.round(budget.calculation.discount * 100)}%` 
    : '-';

  // Load logo
  const logoData = await loadImageAsBase64('/arqexpress-logo.png');

  // Create document sections
  const children: Paragraph[] = [];

  // Header with logo
  if (logoData) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 300, height: 100 },
            type: 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  } else {
    // Fallback text header if logo fails
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ARQ', font: 'Montserrat', size: 48, bold: false }),
          new TextRun({ text: 'EXPRESS', font: 'Montserrat', size: 48, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Proposta Comercial', font: 'Montserrat', size: 24, color: '666666' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Nº ${budget.id}`, font: 'Montserrat', size: 20, color: '999999' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Divider
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: '000000' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Client Section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'CLIENTE', font: 'Montserrat', size: 22, bold: true })],
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: budget.clientName.toUpperCase(), font: 'Montserrat', size: 20 })],
      spacing: { after: 100 },
    })
  );

  if (budget.clientPhone) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: budget.clientPhone, font: 'Montserrat', size: 20, color: '333333' })],
        spacing: { after: 100 },
      })
    );
  }

  if (budget.clientEmail) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: budget.clientEmail, font: 'Montserrat', size: 20, color: '333333' })],
        spacing: { after: 100 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: budget.date, font: 'Montserrat', size: 18, color: '666666' })],
      spacing: { after: 400 },
    })
  );

  // Service Section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'SERVIÇO', font: 'Montserrat', size: 22, bold: true })],
      spacing: { after: 200 },
    })
  );

  // Service Table
  const serviceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Descrição', font: 'Montserrat', bold: true, color: 'FFFFFF', size: 20 })] })],
            shading: { fill: '000000' },
            width: { size: 55, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Desconto', font: 'Montserrat', bold: true, color: 'FFFFFF', size: 20 })] })],
            shading: { fill: '000000' },
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Valor', font: 'Montserrat', bold: true, color: 'FFFFFF', size: 20 })] })],
            shading: { fill: '000000' },
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      // Data row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: SERVICE_NAMES[budget.service], font: 'Montserrat', bold: true, size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: serviceDesc, font: 'Montserrat', size: 18, color: '666666' })] }),
            ],
            shading: { fill: 'F5F5F5' },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: discountText, font: 'Montserrat', size: 20 })], alignment: AlignmentType.CENTER })],
            shading: { fill: 'F5F5F5' },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `R$ ${formatCurrency(finalValue)}`, font: 'Montserrat', bold: true, size: 20 })], alignment: AlignmentType.CENTER })],
            shading: { fill: 'F5F5F5' },
          }),
        ],
      }),
      // Total row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', font: 'Montserrat', bold: true, color: 'FFFFFF', size: 22 })] })],
            shading: { fill: '000000' },
            columnSpan: 2,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: `R$ ${formatCurrency(finalValue)}`, font: 'Montserrat', bold: true, color: 'FFFFFF', size: 24 })], alignment: AlignmentType.CENTER })],
            shading: { fill: '000000' },
          }),
        ],
      }),
    ],
  });

  children.push(new Paragraph({ children: [] }));

  // Original value if discount
  if (budget.calculation.discount > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Valor original: R$ ${formatCurrency(budget.calculation.finalPrice)}`, font: 'Montserrat', size: 18, color: '666666' }),
          new TextRun({ text: '    |    ', color: '999999' }),
          new TextRun({ text: `Economia: R$ ${formatCurrency(budget.calculation.finalPrice - budget.calculation.priceWithDiscount)}`, font: 'Montserrat', size: 18, color: '666666' }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );
  }

  // Payment Section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'PAGAMENTO', font: 'Montserrat', size: 22, bold: true })],
      spacing: { before: 400, after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: paymentMethod, font: 'Montserrat', size: 20, color: '333333' })],
      spacing: { after: 300 },
    })
  );

  // Notes Section
  if (budget.projectNotes) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'OBSERVAÇÕES', font: 'Montserrat', size: 22, bold: true })],
        spacing: { before: 300, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: budget.projectNotes, font: 'Montserrat', size: 20, color: '444444' })],
        spacing: { after: 300 },
      })
    );
  }

  // Date and Location
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatDate(), font: 'Montserrat', size: 18, color: '666666' })],
      spacing: { before: 600, after: 400 },
    })
  );

  // Signatures
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '_'.repeat(35), color: '000000' }),
        new TextRun({ text: '          ', color: 'FFFFFF' }),
        new TextRun({ text: '_'.repeat(35), color: '000000' }),
      ],
      spacing: { before: 400, after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '       CONTRATANTE', font: 'Montserrat', size: 16 }),
        new TextRun({ text: '                                                 ', color: 'FFFFFF' }),
        new TextRun({ text: '       CONTRATADA', font: 'Montserrat', size: 16 }),
      ],
      spacing: { after: 600 },
    })
  );

  // Footer
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(80), color: 'CCCCCC' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Este orçamento tem validade de 30 dias a partir da data de emissão.', font: 'Montserrat', size: 16, color: '999999' })],
      alignment: AlignmentType.CENTER,
    })
  );

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        ...children.slice(0, 10), // Before table
        serviceTable,
        ...children.slice(10), // After table
      ],
    }],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Proposta_${budget.clientName.replace(/\s+/g, '_')}_${budget.id}.docx`);
};
