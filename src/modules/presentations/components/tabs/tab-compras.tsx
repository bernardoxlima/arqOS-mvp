'use client';

import { useState, useMemo } from 'react';
import { Download, Filter, Check, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { formatCurrency } from '@/shared/lib/format';
import {
  CATEGORY_CONFIGS,
  getCategoryConfig,
  type PresentationItem,
  type ItemCategory,
  type ProductDetails,
} from '../../types';

interface TabComprasProps {
  presentationId: string;
  items: PresentationItem[];
  onGeneratePPT: () => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<PresentationItem>) => Promise<void>;
  isGenerating?: boolean;
}

export function TabCompras({
  presentationId,
  items,
  onGeneratePPT,
  onUpdateItem,
  isGenerating,
}: TabComprasProps) {
  const [ambienteFilter, setAmbienteFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique ambientes
  const ambientes = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.ambiente) set.add(item.ambiente);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (ambienteFilter !== 'all' && item.ambiente !== ambienteFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter === 'complete' && !isItemComplete(item)) return false;
      if (statusFilter === 'pending' && isItemComplete(item)) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, ambienteFilter, categoryFilter, statusFilter, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    let completeCount = 0;

    filteredItems.forEach(item => {
      const product = item.product as ProductDetails | null;
      const qty = product?.quantidade || 1;
      const value = product?.valorProduto || 0;

      totalItems += qty;
      totalValue += qty * value;

      if (isItemComplete(item)) completeCount++;
    });

    return { totalItems, totalValue, completeCount, totalCount: filteredItems.length };
  }, [filteredItems]);

  function isItemComplete(item: PresentationItem): boolean {
    const product = item.product as ProductDetails | null;
    return !!(product?.valorProduto && product?.fornecedor);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
            <Button onClick={onGeneratePPT} disabled={isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Gerar Lista de Compras (PPT)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Buscar</label>
              <Input
                placeholder="Nome do item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ambiente</label>
              <Select value={ambienteFilter} onValueChange={setAmbienteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Ambientes</SelectItem>
                  {ambientes.map(amb => (
                    <SelectItem key={amb} value={amb}>{amb}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {CATEGORY_CONFIGS.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `#${cat.color}` }}
                        />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="complete">Completos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Itens</p>
          <p className="text-2xl font-bold">{totals.totalCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantidade Total</p>
          <p className="text-2xl font-bold">{totals.totalItems}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.totalValue)}</p>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">Completos</p>
          <p className="text-2xl font-bold text-emerald-700">
            {totals.completeCount}/{totals.totalCount}
          </p>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ambiente</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor Un.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="w-16">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => {
                    const categoryConfig = getCategoryConfig(item.category as ItemCategory);
                    const product = item.product as ProductDetails | null;
                    const qty = product?.quantidade || 1;
                    const unitValue = product?.valorProduto || 0;
                    const total = qty * unitValue;
                    const complete = isItemComplete(item);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: categoryConfig ? `#${categoryConfig.color}` : '#6B7280' }}
                          >
                            {item.number || index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.name}
                            {product?.link && (
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${categoryConfig?.bgColor} ${categoryConfig?.textColor}`}>
                            {categoryConfig?.shortLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.ambiente || '-'}</TableCell>
                        <TableCell className="text-center">{qty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(unitValue)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                        <TableCell className="text-muted-foreground">{product?.fornecedor || '-'}</TableCell>
                        <TableCell>
                          {complete ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-4 h-4" />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
