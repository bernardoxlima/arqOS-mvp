import * as XLSX from 'xlsx';
import { FloorPlanItem, ITEM_CATEGORIES, ItemCategory } from '@/types/presentation';
import { BudgetItem } from '@/types/budget';

interface ClientData {
  clientName: string;
  projectCode: string;
  phone: string;
  address: string;
  cepBairro: string;
  cpf: string;
  architect: string;
  startDate: string;
}

interface BudgetExportData {
  projectName: string;
  clientName: string;
  clientData?: ClientData;
  address?: string;
  city?: string;
  areaM2?: number;
  items: FloorPlanItem[];
  budgetItems?: BudgetItem[];
}

// Get category label
const getCategoryLabel = (categoryId: string): string => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
};

// Category mapping for Excel sections with colors
const CATEGORY_CONFIG: Record<ItemCategory, { label: string; color: string }> = {
  mobiliario: { label: 'MOBILIAR', color: '1E3A5F' },
  marcenaria: { label: 'MARCENARIA - MÓVEIS FIXOS', color: 'F59E0B' },
  marmoraria: { label: 'MARMORARIA', color: '8B4513' },
  decoracao: { label: 'DECOR', color: '8B5CF6' },
  iluminacao: { label: 'ILUMINAÇÃO', color: 'F97316' },
  cortinas: { label: 'CORTINAS', color: 'EC4899' },
  materiais: { label: 'MATERIALIZAR', color: '10B981' },
  eletrica: { label: 'ELÉTRICA', color: 'EF4444' },
  hidraulica: { label: 'HIDRÁULICA', color: '3B82F6' },
  maoDeObra: { label: 'MÃO DE OBRA', color: '6B7280' },
  acabamentos: { label: 'ACABAMENTOS', color: 'A855F7' },
  outros: { label: 'OUTROS', color: '800020' },
};

// Category order for organizing the spreadsheet
const CATEGORY_ORDER: ItemCategory[] = [
  'materiais',
  'marcenaria',
  'iluminacao',
  'marmoraria',
  'mobiliario',
  'decoracao',
  'eletrica',
  'hidraulica',
  'maoDeObra',
  'acabamentos',
  'outros'
];

const formatCurrencyValue = (value: number): string => {
  if (value === 0) return '';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

export const generateBudgetExcel = (data: BudgetExportData): void => {
  const workbook = XLSX.utils.book_new();
  
  // Create a map of budget items by name for quick lookup
  const budgetItemsMap = new Map<string, BudgetItem>();
  if (data.budgetItems) {
    data.budgetItems.forEach(item => {
      budgetItemsMap.set(item.name.toLowerCase(), item);
    });
  }
  
  // Calculate totals from budget items
  let grandTotal = 0;
  if (data.budgetItems) {
    grandTotal = data.budgetItems.reduce((sum, item) => sum + item.valorCompleto, 0);
  }
  
  const areaM2: number = data.areaM2 || 0;
  const valorM2: number = areaM2 > 0 ? grandTotal / areaM2 : 0;

  // =====================
  // SHEET 1: ORÇAMENTO (Main Budget) - REFORMATTED
  // =====================
  const budgetRows: (string | number | null)[][] = [];
  
  // Header section - Company name and project info
  budgetRows.push(['ARQEXPRESS', '', '', '', '', '', '', '', '', '', '']);
  budgetRows.push([]);
  
  // Project information row
  budgetRows.push([
    'OBRA:', data.projectName.toUpperCase(), '', '', 
    'ENDEREÇO:', data.address || data.clientData?.address || '', '', 
    'ÁREA M²:', areaM2 || '', 
    'TOTAL:', formatCurrencyValue(grandTotal)
  ]);
  budgetRows.push([
    'CLIENTE:', data.clientName, '', '', 
    'CIDADE:', data.city || data.clientData?.cepBairro || '', '', 
    'VALOR M²:', formatCurrencyValue(valorM2), '', ''
  ]);
  budgetRows.push([]);
  
  // Column headers - matching reference format
  budgetRows.push([
    '#', 'ITEM', 'FORNECEDOR', 'DESCRIÇÃO', 'Qtd.', 'Un', 
    'PRODUTO', 'INSTALAÇÃO', 'FRETE', 'EXTRAS', 'COMPLETO'
  ]);
  
  // Group items by category
  const itemsToUse = data.budgetItems || data.items.map(item => ({
    ...item,
    id: `${item.number}`,
    fornecedor: '',
    descricao: '',
    quantidade: 1,
    unidade: 'Qt.' as const,
    valorProduto: 0,
    valorInstalacao: 0,
    valorFrete: 0,
    valorExtras: 0,
    valorCompleto: 0,
  }));
  
  const groupedByCategory = itemsToUse.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, (FloorPlanItem | BudgetItem)[]>);
  
  // Add items by category sections
  for (const catId of CATEGORY_ORDER) {
    const categoryItems = groupedByCategory[catId];
    if (!categoryItems || categoryItems.length === 0) continue;
    
    const config = CATEGORY_CONFIG[catId];
    
    // Section header with category name
    budgetRows.push([config.label, '', '', '', '', '', '', '', '', '', '']);
    
    // Group by ambiente within category
    const groupedByAmbiente = categoryItems.reduce((acc, item) => {
      if (!acc[item.ambiente]) {
        acc[item.ambiente] = [];
      }
      acc[item.ambiente].push(item);
      return acc;
    }, {} as Record<string, (FloorPlanItem | BudgetItem)[]>);
    
    let sectionTotal = 0;
    
    for (const ambiente of Object.keys(groupedByAmbiente).sort()) {
      const ambienteItems = groupedByAmbiente[ambiente];
      
      // Ambiente subsection header if multiple ambientes
      if (Object.keys(groupedByAmbiente).length > 1 && ambiente) {
        budgetRows.push(['', ambiente.toUpperCase(), '', '', '', '', '', '', '', '', '']);
      }
      
      // Add items
      for (const item of ambienteItems) {
        const budgetItem = 'valorCompleto' in item ? item as BudgetItem : null;
        
        budgetRows.push([
          item.number,                                       // #
          item.name.toUpperCase(),                          // ITEM
          budgetItem?.fornecedor || '',                     // FORNECEDOR
          budgetItem?.descricao || '',                      // DESCRIÇÃO
          budgetItem?.quantidade || 1,                      // Qtd.
          budgetItem?.unidade || 'Qt.',                     // Un
          budgetItem?.valorProduto ? formatCurrencyValue(budgetItem.valorProduto) : '',     // PRODUTO
          budgetItem?.valorInstalacao ? formatCurrencyValue(budgetItem.valorInstalacao) : '', // INSTALAÇÃO
          budgetItem?.valorFrete ? formatCurrencyValue(budgetItem.valorFrete) : '',         // FRETE
          budgetItem?.valorExtras ? formatCurrencyValue(budgetItem.valorExtras) : '',       // EXTRAS
          budgetItem?.valorCompleto ? formatCurrencyValue(budgetItem.valorCompleto) : ''    // COMPLETO
        ]);
        
        sectionTotal += budgetItem?.valorCompleto || 0;
      }
    }
    
    // Section total row
    budgetRows.push([
      `TOTAL ${config.label}:`, '', '', '', '', '', '', '', '', '', 
      formatCurrencyValue(sectionTotal)
    ]);
    budgetRows.push([]);
  }
  
  // Grand total
  budgetRows.push([]);
  budgetRows.push([
    'ORÇAMENTO ESTIMADO TOTAL:', '', '', '', '', '', '', '', '', '', 
    formatCurrencyValue(grandTotal)
  ]);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(budgetRows);
  
  // Set column widths to match reference
  worksheet['!cols'] = [
    { wch: 6 },   // #
    { wch: 30 },  // ITEM
    { wch: 18 },  // FORNECEDOR
    { wch: 30 },  // DESCRIÇÃO
    { wch: 6 },   // Qtd.
    { wch: 5 },   // Un
    { wch: 14 },  // PRODUTO
    { wch: 14 },  // INSTALAÇÃO
    { wch: 12 },  // FRETE
    { wch: 12 },  // EXTRAS
    { wch: 15 },  // COMPLETO
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ORÇAMENTO');
  
  // =====================
  // SHEET 2: PAGAMENTOS MÊS A MÊS
  // =====================
  const paymentRows: (string | number | null)[][] = [];
  
  paymentRows.push(['PAGAMENTOS MÊS A MÊS']);
  paymentRows.push([]);
  paymentRows.push(['PRESTADOR', 'SERVIÇO', 'VALOR', 'FORMA PGTO.', 'NOME', 'DADOS DE PAGAMENTO', 'MÊS 1', 'MÊS 2', 'MÊS 3']);
  
  // Group items by category for payment planning
  for (const catId of CATEGORY_ORDER) {
    const categoryItems = groupedByCategory[catId];
    if (!categoryItems || categoryItems.length === 0) continue;
    
    const config = CATEGORY_CONFIG[catId];
    const catTotal = categoryItems.reduce((sum, item) => {
      const budgetItem = 'valorCompleto' in item ? item as BudgetItem : null;
      return sum + (budgetItem?.valorCompleto || 0);
    }, 0);
    
    paymentRows.push([
      '',                              // PRESTADOR
      config.label,                    // SERVIÇO
      catTotal > 0 ? formatCurrencyValue(catTotal) : '',  // VALOR
      'PIX',                           // FORMA PGTO.
      '',                              // NOME
      '',                              // DADOS DE PAGAMENTO
      '',                              // MÊS 1
      '',                              // MÊS 2
      ''                               // MÊS 3
    ]);
  }
  
  // Subtotal row
  paymentRows.push([]);
  paymentRows.push(['SUBTOTAL', '', formatCurrencyValue(grandTotal), '', 'PAGO', '', '', '', '']);
  
  // Links section
  paymentRows.push([]);
  paymentRows.push(['COMPRAR NO LINK NO SITE INDICADO']);
  paymentRows.push(['LOJA', 'ITEM', 'VALOR', 'LINK', '', '', '', '', '']);
  
  // Add items that have links
  for (const catId of CATEGORY_ORDER) {
    const categoryItems = groupedByCategory[catId];
    if (!categoryItems) continue;
    
    for (const item of categoryItems) {
      const budgetItem = 'link' in item ? item : null;
      if (budgetItem && budgetItem.link) {
        const bi = 'valorCompleto' in item ? item as BudgetItem : null;
        paymentRows.push([
          bi?.fornecedor || '',          // LOJA
          item.name,                     // ITEM
          bi ? formatCurrencyValue(bi.valorCompleto) : '',  // VALOR
          budgetItem.link,               // LINK
          '',
          '',
          '',
          '',
          ''
        ]);
      }
    }
  }
  
  paymentRows.push([]);
  paymentRows.push(['SUBTOTAL COMPRAS ONLINE', '', '', '', '', '', '', '', '']);
  
  const paymentSheet = XLSX.utils.aoa_to_sheet(paymentRows);
  
  paymentSheet['!cols'] = [
    { wch: 18 },  // PRESTADOR / LOJA
    { wch: 30 },  // SERVIÇO / ITEM
    { wch: 14 },  // VALOR
    { wch: 50 },  // FORMA PGTO. / LINK
    { wch: 20 },  // NOME
    { wch: 25 },  // DADOS DE PAGAMENTO
    { wch: 12 },  // MÊS 1
    { wch: 12 },  // MÊS 2
    { wch: 12 },  // MÊS 3
  ];
  
  XLSX.utils.book_append_sheet(workbook, paymentSheet, 'PAGAMENTOS');
  
  // =====================
  // SHEET 3: LISTA DE COMPRAS (Shopping List)
  // =====================
  const shoppingRows: (string | number | null)[][] = [];
  
  shoppingRows.push(['LISTA DE COMPRAS - ' + data.projectName.toUpperCase()]);
  shoppingRows.push(['Cliente: ' + (data.clientName || '')]);
  shoppingRows.push(['Data: ' + new Date().toLocaleDateString('pt-BR')]);
  shoppingRows.push([]);
  shoppingRows.push(['Nº', 'CATEGORIA', 'AMBIENTE', 'ITEM', 'FORNECEDOR', 'VALOR', 'LINK', '✓']);
  
  for (const catId of CATEGORY_ORDER) {
    const categoryItems = groupedByCategory[catId];
    if (!categoryItems) continue;
    
    for (const item of categoryItems) {
      const budgetItem = 'valorCompleto' in item ? item as BudgetItem : null;
      shoppingRows.push([
        item.number,
        getCategoryLabel(catId),
        item.ambiente,
        item.name,
        budgetItem?.fornecedor || '',
        budgetItem ? formatCurrencyValue(budgetItem.valorCompleto) : '',
        budgetItem?.link || '',
        '☐'
      ]);
    }
  }
  
  const shoppingSheet = XLSX.utils.aoa_to_sheet(shoppingRows);
  
  shoppingSheet['!cols'] = [
    { wch: 5 },   // Nº
    { wch: 18 },  // CATEGORIA
    { wch: 20 },  // AMBIENTE
    { wch: 35 },  // ITEM
    { wch: 18 },  // FORNECEDOR
    { wch: 14 },  // VALOR
    { wch: 50 },  // LINK
    { wch: 5 },   // ✓
  ];
  
  XLSX.utils.book_append_sheet(workbook, shoppingSheet, 'LISTA DE COMPRAS');

  // Generate filename
  const safeName = data.projectName
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 30);
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `ORCAMENTO_${safeName}_${timestamp}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
};
