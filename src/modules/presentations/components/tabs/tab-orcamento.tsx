'use client';

import { useState, useMemo } from 'react';
import { Download, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { formatCurrency } from '@/shared/lib/format';
import type { Json } from '@/shared/lib/supabase/database.types';
import {
  CATEGORY_CONFIGS,
  getCategoryConfig,
  type PresentationItem,
  type ItemCategory,
  type ProductDetails,
} from '../../types';

interface TabOrcamentoProps {
  presentationId: string;
  items: PresentationItem[];
  onUpdateItem: (itemId: string, data: Partial<PresentationItem>) => Promise<void>;
  onExportExcel: () => Promise<void>;
  isExporting?: boolean;
}

interface CategorySummary {
  category: ItemCategory;
  config: typeof CATEGORY_CONFIGS[0];
  itemCount: number;
  quantity: number;
  totalValue: number;
}

interface AmbienteSummary {
  ambiente: string;
  itemCount: number;
  totalValue: number;
  area?: number;
  valorPorM2?: number;
}

export function TabOrcamento({
  items,
  onUpdateItem,
  onExportExcel,
  isExporting = false,
}: TabOrcamentoProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Calculate summaries
  const categorySummaries = useMemo(() => {
    const summaryMap = new Map<ItemCategory, CategorySummary>();

    items.forEach(item => {
      const category = item.category as ItemCategory;
      const config = getCategoryConfig(category);
      if (!config) return;

      const product = item.product as ProductDetails | null;
      const qty = product?.quantidade || 1;
      const price = product?.valorProduto || 0;
      const total = qty * price;

      const existing = summaryMap.get(category);
      if (existing) {
        existing.itemCount += 1;
        existing.quantity += qty;
        existing.totalValue += total;
      } else {
        summaryMap.set(category, {
          category,
          config,
          itemCount: 1,
          quantity: qty,
          totalValue: total,
        });
      }
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalValue - a.totalValue
    );
  }, [items]);

  const ambienteSummaries = useMemo(() => {
    const summaryMap = new Map<string, AmbienteSummary>();

    items.forEach(item => {
      const ambiente = item.ambiente || 'Sem ambiente';
      const product = item.product as ProductDetails | null;
      const qty = product?.quantidade || 1;
      const price = product?.valorProduto || 0;
      const total = qty * price;

      const existing = summaryMap.get(ambiente);
      if (existing) {
        existing.itemCount += 1;
        existing.totalValue += total;
      } else {
        summaryMap.set(ambiente, {
          ambiente,
          itemCount: 1,
          totalValue: total,
        });
      }
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalValue - a.totalValue
    );
  }, [items]);

  const totalOrcamento = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = item.product as ProductDetails | null;
      const qty = product?.quantidade || 1;
      const price = product?.valorProduto || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const handleStartEdit = (item: PresentationItem) => {
    const product = item.product as ProductDetails | null;
    setEditingItemId(item.id);
    setEditValue(product?.valorProduto || 0);
  };

  const handleSaveEdit = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentProduct = item.product as ProductDetails | null;
    const updatedProduct = {
      ...currentProduct,
      valorProduto: editValue,
    };
    await onUpdateItem(itemId, {
      product: updatedProduct as Json,
    });

    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Orçamento</h2>
          <p className="text-sm text-muted-foreground">
            Resumo financeiro da apresentação
          </p>
        </div>
        <Button onClick={onExportExcel} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </Button>
      </div>

      {/* Total Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total do Orçamento</p>
              <p className="text-3xl font-bold">{formatCurrency(totalOrcamento)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">{items.length} itens</p>
              <p className="text-sm opacity-80">{categorySummaries.length} categorias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categorySummaries.map(summary => (
                <div key={summary.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${summary.config.bgColor}`}
                    />
                    <span className="text-sm">{summary.config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'itens'})
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(summary.totalValue)}</span>
                </div>
              ))}
              {categorySummaries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Ambiente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ambienteSummaries.map(summary => (
                <div key={summary.ambiente} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{summary.ambiente}</span>
                    <span className="text-xs text-muted-foreground">
                      ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'itens'})
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(summary.totalValue)}</span>
                </div>
              ))}
              {ambienteSummaries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum item cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => {
                const product = item.product as ProductDetails | null;
                const qty = product?.quantidade || 1;
                const price = product?.valorProduto || 0;
                const total = qty * price;
                const categoryConfig = getCategoryConfig(item.category as ItemCategory);
                const isEditing = editingItemId === item.id;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {String(item.number).padStart(2, '0')}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {categoryConfig && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${categoryConfig.bgColor} ${categoryConfig.textColor}`}
                        >
                          {categoryConfig.shortLabel}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.ambiente || '-'}
                    </TableCell>
                    <TableCell className="text-right">{qty}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(Number(e.target.value))}
                          className="w-24 h-8 text-right"
                          min={0}
                          step={0.01}
                        />
                      ) : (
                        formatCurrency(price)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(isEditing ? qty * editValue : total)}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleSaveEdit(item.id)}
                          >
                            <Check className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum item cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
