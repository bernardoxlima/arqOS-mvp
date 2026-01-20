'use client';

import { useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency } from '@/shared/lib/format';
import {
  CATEGORY_CONFIGS,
  getCategoryConfig,
  type PresentationItem,
  type PresentationImage,
  type ItemCategory,
  type ProductDetails,
} from '../../types';

interface TabDetalhamentoProps {
  presentationId: string;
  items: PresentationItem[];
  floorPlanImage: PresentationImage | null;
  onGeneratePPT: () => Promise<void>;
  isGenerating?: boolean;
}

interface CategoryGroup {
  category: ItemCategory;
  config: typeof CATEGORY_CONFIGS[0];
  items: PresentationItem[];
  totalValue: number;
}

export function TabDetalhamento({
  presentationId,
  items,
  floorPlanImage,
  onGeneratePPT,
  isGenerating,
}: TabDetalhamentoProps) {
  // Group items by category
  const categoryGroups = useMemo(() => {
    const groups: Record<string, CategoryGroup> = {};

    items.forEach(item => {
      const category = item.category as ItemCategory;
      if (!groups[category]) {
        const config = getCategoryConfig(category);
        groups[category] = {
          category,
          config: config || CATEGORY_CONFIGS[0],
          items: [],
          totalValue: 0,
        };
      }

      groups[category].items.push(item);
      const product = item.product as ProductDetails | null;
      const qty = product?.quantidade || 1;
      const value = product?.valorProduto || 0;
      groups[category].totalValue += qty * value;
    });

    return Object.values(groups).sort((a, b) => a.config.order - b.config.order);
  }, [items]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return categoryGroups.reduce((sum, group) => sum + group.totalValue, 0);
  }, [categoryGroups]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Detalhamento Técnico</h2>
          <p className="text-sm text-muted-foreground">
            Visualização por categoria com planta e itens
          </p>
        </div>
        <Button onClick={onGeneratePPT} disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Gerando...' : 'Gerar Detalhamento (PPT)'}
        </Button>
      </div>

      {/* Summary by Category */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categoryGroups.map(group => (
          <Card
            key={group.category}
            className="p-3"
            style={{ borderLeftWidth: 4, borderLeftColor: `#${group.config.color}` }}
          >
            <p className="text-xs text-muted-foreground truncate">{group.config.label}</p>
            <p className="text-lg font-bold">{group.items.length}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(group.totalValue)}</p>
          </Card>
        ))}
      </div>

      {/* Category Details */}
      {categoryGroups.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Nenhum item cadastrado</h3>
          <p className="text-sm text-muted-foreground">
            Adicione itens na aba Layout para ver o detalhamento
          </p>
        </Card>
      ) : (
        categoryGroups.map(group => (
          <Card key={group.category}>
            <CardHeader
              className="pb-2"
              style={{
                borderLeft: `4px solid #${group.config.color}`,
                backgroundColor: `#${group.config.color}10`,
              }}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `#${group.config.color}` }}
                  />
                  {group.config.label}
                </CardTitle>
                <div className="text-sm">
                  <span className="text-muted-foreground">{group.items.length} itens • </span>
                  <span className="font-medium">{formatCurrency(group.totalValue)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-4">
                {/* Floor Plan Mini */}
                <div className="col-span-4">
                  {floorPlanImage ? (
                    <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
                      <img
                        src={floorPlanImage.image_url}
                        alt="Planta"
                        className="w-full h-full object-contain"
                      />
                      {/* Show only items from this category */}
                      {group.items.map((item, index) => {
                        const position = item.position as { x?: number; y?: number } | null;
                        if (!position?.x || !position?.y) return null;

                        return (
                          <div
                            key={item.id}
                            className="absolute w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor: `#${group.config.color}`,
                              left: `${position.x}%`,
                              top: `${position.y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            {item.number || index + 1}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                      Sem planta
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="col-span-8">
                  <div className="space-y-2">
                    {group.items.map((item, index) => {
                      const product = item.product as ProductDetails | null;
                      const qty = product?.quantidade || 1;
                      const value = product?.valorProduto || 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 border border-border rounded-lg"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: `#${group.config.color}` }}
                          >
                            {item.number || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.ambiente && `${item.ambiente} • `}
                              Qtd: {qty}
                              {product?.fornecedor && ` • ${product.fornecedor}`}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatCurrency(qty * value)}</p>
                            {qty > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {qty}x {formatCurrency(value)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Grand Total */}
      {categoryGroups.length > 0 && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-medium">Total Geral</span>
            <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
