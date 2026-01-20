'use client';

import { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  Presentation as PresentationIcon,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import {
  IMAGE_SECTION_LIMITS,
  type PresentationImage,
  type PresentationItem,
  type ImageSection,
} from '../../types';
import { IMAGE_SECTION_LABELS } from '../../constants';

interface TabExportarProps {
  presentationId: string;
  images: PresentationImage[];
  items: PresentationItem[];
  onExportPPT: () => Promise<void>;
  onExportShoppingListPPT: () => Promise<void>;
  onExportDetailingPPT: () => Promise<void>;
  onExportBudgetExcel: () => Promise<void>;
  isExporting?: boolean;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  format: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  count?: number;
  max?: number;
}

export function TabExportar({
  presentationId,
  images,
  items,
  onExportPPT,
  onExportShoppingListPPT,
  onExportDetailingPPT,
  onExportBudgetExcel,
  isExporting,
}: TabExportarProps) {
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Calculate checklist status
  const checklist = useMemo((): ChecklistItem[] => {
    const getImageCount = (section: ImageSection) =>
      images.filter(img => img.section === section).length;

    const rendersCount = getImageCount('renders');
    const hasFloorPlan = getImageCount('floor_plan') > 0;
    const layoutItems = items.filter(i => i.item_type === 'layout');
    const itemsWithPrice = items.filter(i => {
      const product = i.product as { valorProduto?: number } | null;
      return product?.valorProduto && product.valorProduto > 0;
    });

    return [
      {
        id: 'renders',
        label: 'Renders',
        required: true,
        completed: rendersCount >= 1,
        count: rendersCount,
        max: IMAGE_SECTION_LIMITS.renders,
      },
      {
        id: 'floor_plan',
        label: 'Planta Baixa',
        required: false,
        completed: hasFloorPlan,
        count: getImageCount('floor_plan'),
        max: IMAGE_SECTION_LIMITS.floor_plan,
      },
      {
        id: 'moodboard',
        label: 'Moodboard',
        required: false,
        completed: getImageCount('moodboard') > 0,
        count: getImageCount('moodboard'),
        max: IMAGE_SECTION_LIMITS.moodboard,
      },
      {
        id: 'photos_before',
        label: 'Fotos Antes',
        required: false,
        completed: getImageCount('photos_before') > 0,
        count: getImageCount('photos_before'),
        max: IMAGE_SECTION_LIMITS.photos_before,
      },
      {
        id: 'references',
        label: 'Referências',
        required: false,
        completed: getImageCount('references') > 0,
        count: getImageCount('references'),
        max: IMAGE_SECTION_LIMITS.references,
      },
      {
        id: 'layout_items',
        label: 'Itens de Layout',
        required: false,
        completed: layoutItems.length > 0,
        count: layoutItems.length,
      },
      {
        id: 'items_with_price',
        label: 'Itens com Preço',
        required: false,
        completed: itemsWithPrice.length > 0,
        count: itemsWithPrice.length,
      },
    ];
  }, [images, items]);

  const completedCount = checklist.filter(c => c.completed).length;
  const requiredComplete = checklist.filter(c => c.required).every(c => c.completed);
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  const exportOptions: ExportOption[] = [
    {
      id: 'presentation',
      label: 'Apresentação Visual',
      description: 'PPT com capa, fotos, moodboard, referências e renders',
      icon: <PresentationIcon className="w-5 h-5" />,
      action: onExportPPT,
      format: 'PPTX',
    },
    {
      id: 'shopping_list',
      label: 'Lista de Compras',
      description: 'PPT com cards de todos os itens organizados',
      icon: <PresentationIcon className="w-5 h-5" />,
      action: onExportShoppingListPPT,
      format: 'PPTX',
    },
    {
      id: 'detailing',
      label: 'Detalhamento Técnico',
      description: 'PPT com planta e itens por categoria',
      icon: <PresentationIcon className="w-5 h-5" />,
      action: onExportDetailingPPT,
      format: 'PPTX',
    },
    {
      id: 'budget',
      label: 'Orçamento',
      description: 'Planilha Excel com todos os valores',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      action: onExportBudgetExcel,
      format: 'XLSX',
    },
  ];

  const toggleExport = (id: string) => {
    setSelectedExports(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportSingle = async (option: ExportOption) => {
    setExportingId(option.id);
    try {
      await option.action();
    } finally {
      setExportingId(null);
    }
  };

  const handleExportSelected = async () => {
    for (const id of selectedExports) {
      const option = exportOptions.find(o => o.id === id);
      if (option) {
        setExportingId(id);
        await option.action();
      }
    }
    setExportingId(null);
    setSelectedExports([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Exportar Documentos</h2>
          <p className="text-sm text-muted-foreground">
            Gere apresentações e planilhas do seu projeto
          </p>
        </div>
        {selectedExports.length > 0 && (
          <Button onClick={handleExportSelected} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Selecionados ({selectedExports.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Export Options */}
        <div className="col-span-8 space-y-4">
          {exportOptions.map(option => {
            const isThisExporting = exportingId === option.id;

            return (
              <Card
                key={option.id}
                className={`transition-colors ${
                  selectedExports.includes(option.id) ? 'border-primary' : ''
                }`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Checkbox
                    id={`export-${option.id}`}
                    checked={selectedExports.includes(option.id)}
                    onCheckedChange={() => toggleExport(option.id)}
                  />

                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    {option.icon}
                  </div>

                  <div className="flex-1">
                    <Label
                      htmlFor={`export-${option.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-muted rounded font-mono">
                      {option.format}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportSingle(option)}
                      disabled={isExporting}
                    >
                      {isThisExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right: Checklist */}
        <div className="col-span-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Checklist</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {completionPercentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    requiredComplete ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    item.completed ? 'bg-emerald-50' : item.required ? 'bg-amber-50' : 'bg-muted/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    item.completed
                      ? 'bg-emerald-500 text-white'
                      : item.required
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted'
                  }`}>
                    {item.completed ? (
                      <Check className="w-3 h-3" />
                    ) : item.required ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.label}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {item.max !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {item.count}/{item.max}
                      </p>
                    )}
                    {item.count !== undefined && item.max === undefined && (
                      <p className="text-xs text-muted-foreground">
                        {item.count} {item.count === 1 ? 'item' : 'itens'}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <p className="text-xs text-muted-foreground pt-2 border-t">
                <span className="text-red-500">*</span> Itens obrigatórios para exportar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
