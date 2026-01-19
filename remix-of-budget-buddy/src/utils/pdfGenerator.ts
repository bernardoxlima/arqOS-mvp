import jsPDF from 'jspdf';
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

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const generateProposalPDF = async (budget: SavedBudget): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Try to load and add logo
  try {
    const logoImg = await loadImage('/arqexpress-logo.png');
    const logoWidth = 80;
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
    y += logoHeight + 15;
  } catch (error) {
    // Fallback: text header if image fails
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('ARQEXPRESS', pageWidth / 2, y + 10, { align: 'center' });
    y += 25;
  }

  // Subtitle
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta Comercial', pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Nº ${budget.id}`, pageWidth / 2, y, { align: 'center' });

  // Divider line
  y += 10;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 15;

  // Client info section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', margin, y);
  
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(budget.clientName.toUpperCase(), margin, y);

  if (budget.clientPhone) {
    y += 6;
    doc.text(budget.clientPhone, margin, y);
  }

  if (budget.clientEmail) {
    y += 6;
    doc.text(budget.clientEmail, margin, y);
  }

  y += 6;
  doc.setTextColor(100, 100, 100);
  doc.text(budget.date, margin, y);

  // Service section
  y += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇO', margin, y);

  // Service table
  y += 8;
  const tableStartY = y;
  const colWidths = [95, 35, 40];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  
  // Table header
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, y, tableWidth, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Descrição', margin + 4, y + 7);
  doc.text('Desconto', margin + colWidths[0] + 4, y + 7);
  doc.text('Valor', margin + colWidths[0] + colWidths[1] + 4, y + 7);

  // Table row
  y += 10;
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, y, tableWidth, 18, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  const serviceName = SERVICE_NAMES[budget.service];
  doc.text(serviceName, margin + 4, y + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  // Service details based on type
  let serviceDesc = '';
  if (budget.service === 'projetexpress') {
    serviceDesc = `${budget.serviceDetails.projectType === 'novo' ? 'Apartamento Novo' : 'Reforma'} - ${budget.serviceDetails.projectArea}m²`;
  } else {
    const envCount = budget.serviceDetails.environmentsConfig?.length || 1;
    const extras = budget.serviceDetails.extraEnvironments || 0;
    serviceDesc = `${envCount} ambiente${envCount > 1 ? 's' : ''}${extras > 0 ? ` + ${extras} extra${extras > 1 ? 's' : ''}` : ''}`;
  }
  doc.setTextColor(80, 80, 80);
  doc.text(serviceDesc, margin + 4, y + 13);
  
  // Discount column
  doc.setTextColor(0, 0, 0);
  const discountText = budget.calculation.discount > 0 
    ? `${Math.round(budget.calculation.discount * 100)}%` 
    : '-';
  doc.text(discountText, margin + colWidths[0] + 4, y + 10);
  
  // Total column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const finalValue = budget.calculation.discount > 0 
    ? budget.calculation.priceWithDiscount 
    : budget.calculation.finalPrice;
  doc.text(`R$ ${formatCurrency(finalValue)}`, margin + colWidths[0] + colWidths[1] + 4, y + 10);

  // Table border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, tableStartY, tableWidth, 28);

  // Total row
  y += 18;
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, y, tableWidth, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL', margin + 4, y + 8);
  doc.setFontSize(12);
  doc.text(`R$ ${formatCurrency(finalValue)}`, margin + colWidths[0] + colWidths[1] + 4, y + 8);

  // Original value (if discount)
  if (budget.calculation.discount > 0) {
    y += 18;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Valor original: R$ ${formatCurrency(budget.calculation.finalPrice)}`, margin, y);
    doc.text(`Economia: R$ ${formatCurrency(budget.calculation.finalPrice - budget.calculation.priceWithDiscount)}`, margin + 70, y);
  }

  // Payment section
  y += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAGAMENTO', margin, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  
  let paymentMethod = '';
  if (budget.serviceDetails.paymentType === 'cash') {
    paymentMethod = `À vista via PIX/Transferência com ${Math.round(budget.calculation.discount * 100)}% de desconto`;
  } else {
    const maxInstallments = finalValue <= 5000 ? 6 : 10;
    paymentMethod = `Parcelado em até ${maxInstallments}x sem juros no cartão`;
  }
  doc.text(paymentMethod, margin, y);

  // Notes section (if any)
  if (budget.projectNotes) {
    y += 18;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('OBSERVAÇÕES', margin, y);

    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const lines = doc.splitTextToSize(budget.projectNotes, pageWidth - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Signature section
  y = Math.max(y + 30, 210);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(), margin, y);

  y += 20;
  const sigWidth = 70;
  const sigGap = 30;
  
  // Contratante
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + sigWidth, y);
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('CONTRATANTE', margin + sigWidth/2, y + 5, { align: 'center' });

  // Contratada
  doc.line(margin + sigWidth + sigGap, y, margin + sigWidth * 2 + sigGap, y);
  doc.text('CONTRATADA', margin + sigWidth + sigGap + sigWidth/2, y + 5, { align: 'center' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Este orçamento tem validade de 30 dias a partir da data de emissão.', pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  doc.save(`Proposta_${budget.clientName.replace(/\s+/g, '_')}_${budget.id}.pdf`);
};
