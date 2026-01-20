'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  CATEGORY_CONFIGS,
  getLayoutCategories,
  getComplementaryCategories,
  getCategoryConfig,
  type PresentationItem,
  type PresentationImage,
  type ItemCategory,
  type AddItemInput,
} from '../../types';

interface TabLayoutProps {
  presentationId: string;
  items: PresentationItem[];
  floorPlanImage: PresentationImage | null;
  onAddItem: (input: AddItemInput) => Promise<void>;
  onUpdateItem: (itemId: string, data: Partial<PresentationItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function TabLayout({
  presentationId,
  items,
  floorPlanImage,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: TabLayoutProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingType, setAddingType] = useState<'layout' | 'complementary'>('layout');
  const [editingItem, setEditingItem] = useState<PresentationItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '' as ItemCategory | '',
    ambiente: '',
    quantidade: 1,
    valorProduto: 0,
    fornecedor: '',
    link: '',
  });

  const layoutItems = items.filter(i => i.item_type === 'layout').sort((a, b) => (a.number || 0) - (b.number || 0));
  const complementaryItems = items.filter(i => i.item_type === 'complementary').sort((a, b) => (a.number || 0) - (b.number || 0));

  const layoutCategories = getLayoutCategories();
  const complementaryCategories = getComplementaryCategories();

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      ambiente: '',
      quantidade: 1,
      valorProduto: 0,
      fornecedor: '',
      link: '',
    });
  };

  const handleOpenAddModal = (type: 'layout' | 'complementary') => {
    setAddingType(type);
    resetForm();
    setShowAddModal(true);
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.category) return;

    await onAddItem({
      name: formData.name,
      category: formData.category as ItemCategory,
      itemType: addingType,
      ambiente: formData.ambiente || undefined,
      product: {
        quantidade: formData.quantidade,
        valorProduto: formData.valorProduto,
        fornecedor: formData.fornecedor || undefined,
        link: formData.link || undefined,
      },
    });

    setShowAddModal(false);
    resetForm();
  };

  const renderItemCard = (item: PresentationItem, index: number) => {
    const categoryConfig = getCategoryConfig(item.category as ItemCategory);

    return (
      <div
        key={item.id}
        className="flex items-center gap-3 p-3 border border-border rounded-lg group hover:border-primary/30 transition-colors"
      >
        {/* Number Badge */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: categoryConfig ? `#${categoryConfig.color}` : '#6B7280' }}
        >
          {item.number || index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`px-1.5 py-0.5 rounded ${categoryConfig?.bgColor} ${categoryConfig?.textColor}`}>
              {categoryConfig?.shortLabel}
            </span>
            {item.ambiente && <span>{item.ambiente}</span>}
            {(item.product as { quantidade?: number })?.quantidade && (
              <span>Qtd: {(item.product as { quantidade?: number }).quantidade}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setEditingItem(item)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => onDeleteItem(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Floor Plan */}
      <div className="col-span-7">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Planta Baixa</CardTitle>
          </CardHeader>
          <CardContent>
            {floorPlanImage ? (
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <img
                  src={floorPlanImage.image_url}
                  alt="Planta baixa"
                  className="w-full h-auto"
                />
                {/* Item markers would be rendered here */}
                {layoutItems.map((item, index) => {
                  const position = item.position as { x?: number; y?: number } | null;
                  if (!position?.x || !position?.y) return null;

                  const categoryConfig = getCategoryConfig(item.category as ItemCategory);
                  return (
                    <div
                      key={item.id}
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: categoryConfig ? `#${categoryConfig.color}` : '#6B7280',
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={item.name}
                    >
                      {item.number || index + 1}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Adicione uma planta baixa na aba Imagens
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Clique na planta para posicionar itens de layout
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: Items Lists */}
      <div className="col-span-5 space-y-6">
        {/* Layout Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Itens de Layout ({layoutItems.length})
            </CardTitle>
            <Button size="sm" onClick={() => handleOpenAddModal('layout')}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {layoutItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum item de layout adicionado
              </p>
            ) : (
              layoutItems.map((item, index) => renderItemCard(item, index))
            )}
          </CardContent>
        </Card>

        {/* Complementary Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Itens Complementares ({complementaryItems.length})
            </CardTitle>
            <Button size="sm" onClick={() => handleOpenAddModal('complementary')}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {complementaryItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum item complementar adicionado
              </p>
            ) : (
              complementaryItems.map((item, index) => renderItemCard(item, index))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Adicionar Item {addingType === 'layout' ? 'de Layout' : 'Complementar'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome do Item *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Sofá 3 lugares"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ItemCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(addingType === 'layout' ? layoutCategories : complementaryCategories).map((cat) => (
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

              <div className="space-y-2">
                <Label>Ambiente</Label>
                <Input
                  value={formData.ambiente}
                  onChange={(e) => setFormData({ ...formData, ambiente: e.target.value })}
                  placeholder="Ex: Sala de Estar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor Unitário (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.valorProduto}
                  onChange={(e) => setFormData({ ...formData, valorProduto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Ex: Tok&Stok"
              />
            </div>

            <div className="space-y-2">
              <Label>Link do Produto</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem} disabled={!formData.name || !formData.category}>
                Adicionar Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
