import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Eye, Layers, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FloorPlanItem, ITEM_CATEGORIES, ItemCategory } from "@/types/presentation";

interface LayoutSlidePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floorPlanImage: string | null;
  items: FloorPlanItem[];
  projectName?: string;
}

// Helper to get category color
const getCategoryColor = (categoryId: ItemCategory): string => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId)?.color || "000000";
};

// Helper to get category label
const getCategoryLabel = (categoryId: ItemCategory): string => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId)?.label || "";
};

// Get category style for preview
const getCategoryStyle = (categoryId: ItemCategory) => {
  const category = ITEM_CATEGORIES.find(c => c.id === categoryId);
  return {
    bgColor: category?.bgColor || 'bg-gray-500',
    textColor: category?.textColor || 'text-white',
    hexColor: `#${category?.color || '000000'}`,
  };
};

// Sample placeholder items for empty state
const PLACEHOLDER_ITEMS: FloorPlanItem[] = [
  { number: 1, name: 'SOFÁ 3 LUGARES', ambiente: 'SALA DE ESTAR', category: 'mobiliario' },
  { number: 2, name: 'MESA DE CENTRO', ambiente: 'SALA DE ESTAR', category: 'mobiliario' },
  { number: 3, name: 'RACK TV', ambiente: 'SALA DE ESTAR', category: 'marcenaria' },
  { number: 4, name: 'PENDENTE SALA', ambiente: 'SALA DE ESTAR', category: 'iluminacao' },
  { number: 5, name: 'MESA DE JANTAR', ambiente: 'SALA DE JANTAR', category: 'mobiliario' },
  { number: 6, name: 'CADEIRAS JANTAR', ambiente: 'SALA DE JANTAR', category: 'mobiliario' },
  { number: 7, name: 'BUFFET', ambiente: 'SALA DE JANTAR', category: 'marcenaria' },
  { number: 8, name: 'CAMA CASAL', ambiente: 'QUARTO', category: 'mobiliario' },
  { number: 9, name: 'CABECEIRA', ambiente: 'QUARTO', category: 'marcenaria' },
  { number: 10, name: 'ABAJUR', ambiente: 'QUARTO', category: 'iluminacao' },
];

export const LayoutSlidePreview = ({
  open,
  onOpenChange,
  floorPlanImage,
  items,
  projectName,
}: LayoutSlidePreviewProps) => {
  // Use real items if available, otherwise use placeholders
  const displayItems = items.length > 0 ? items : PLACEHOLDER_ITEMS;
  const hasRealData = floorPlanImage && items.length > 0;
  
  // Calculate max items that fit in legend (simulate PPT constraint)
  const MAX_LEGEND_ITEMS = 18;
  const visibleItems = displayItems.slice(0, MAX_LEGEND_ITEMS);
  const hasMoreItems = displayItems.length > MAX_LEGEND_ITEMS;
  
  // Get unique categories used
  const usedCategories = [...new Set(displayItems.map(item => item.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Pré-visualização: Layout de Projeto
          </DialogTitle>
          <DialogDescription>
            {hasRealData 
              ? "Prévia de como o slide aparecerá no PPTX"
              : "Exemplo de como o slide ficará (dados de demonstração)"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Slide Preview - 3:2 aspect ratio like the actual PPT */}
        <div className="p-6">
          {/* Demo mode indicator */}
          {!hasRealData && (
            <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>
                <strong>Modo demonstração:</strong> Adicione uma planta e itens para ver a prévia real
              </span>
            </div>
          )}

          <div 
            className="relative bg-white mx-auto shadow-lg border border-gray-200"
            style={{ 
              aspectRatio: '3/2', 
              maxWidth: '100%',
              width: '100%',
            }}
          >
            {/* Title "LAYOUT DE PROJETO" */}
            <div className="absolute top-[5%] left-[4%]">
              <h2 className="text-lg md:text-xl font-bold text-black tracking-wide">
                LAYOUT DE PROJETO
              </h2>
              <div 
                className="h-1 w-12 mt-1"
                style={{ backgroundColor: '#F59E0B' }}
              />
            </div>

            {/* Main content area - starts below title */}
            <div 
              className="absolute flex gap-4"
              style={{ 
                top: '18%', 
                left: '4%', 
                right: '4%', 
                bottom: '12%',
              }}
            >
              {/* Left: Floor Plan Image (68% width) */}
              <div 
                className="relative bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200"
                style={{ width: '68%' }}
              >
                {floorPlanImage ? (
                  <img
                    src={floorPlanImage}
                    alt="Planta Baixa"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-2 opacity-30" />
                    <span className="text-xs opacity-50">Planta será exibida aqui</span>
                  </div>
                )}
              </div>

              {/* Right: Legend (32% width) */}
              <div 
                className="flex flex-col"
                style={{ width: '32%' }}
              >
                {/* Legend title */}
                <h3 className="text-xs font-bold text-black mb-3 tracking-wide">
                  LEGENDA
                </h3>

                {/* Legend items */}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {visibleItems.map((item, index) => {
                    const style = getCategoryStyle(item.category);
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2"
                      >
                        {/* Colored circle with number */}
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: style.hexColor }}
                        >
                          {item.number}
                        </div>
                        {/* Item name */}
                        <span className="text-[10px] text-gray-700 truncate leading-tight lowercase">
                          {item.name.toLowerCase()}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* More items indicator */}
                  {hasMoreItems && (
                    <div className="text-[9px] text-gray-400 italic pt-1">
                      +{displayItems.length - MAX_LEGEND_ITEMS} mais itens...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo area (bottom right) */}
            <div 
              className="absolute bottom-[4%] right-[3%] opacity-60"
            >
              <img
                src="/logo-arqexpress.png"
                alt="ArqExpress"
                className="h-5 object-contain"
              />
            </div>

            {/* Category legend bar (bottom) */}
            <div 
              className="absolute bottom-[4%] left-[4%] flex gap-3"
            >
              {usedCategories.map(catId => {
                const style = getCategoryStyle(catId);
                const label = getCategoryLabel(catId);
                return (
                  <div key={catId} className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: style.hexColor }}
                    />
                    <span className="text-[8px] text-gray-500">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {items.length > 0 ? `${items.length} itens` : '10 itens (demo)'}
              </span>
              {projectName && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {projectName}
                </span>
              )}
            </div>
            <div className="text-xs">
              Proporção 3:2 (mesmo do PPTX)
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
