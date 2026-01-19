import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, Trash2, Link, Image, ChevronDown, ChevronUp, Loader2, Sparkles, Pencil, Check, AlertCircle, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlanItem, ItemCategory, LAYOUT_CATEGORIES } from "@/types/presentation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { detectCategory, getCategoryStyle, organizeAndNumberItems } from "@/utils/categoryDetection";
import { ItemEditModal } from "@/components/ItemEditModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FloorPlanLayoutProps {
  originalImage: string | null;
  items: FloorPlanItem[];
  onDataChange: (data: {
    originalImage: string | null;
    items: FloorPlanItem[];
  }) => void;
}

// Ambientes pré-definidos (podem ser customizados)
const DEFAULT_AMBIENTES = [
  "Sala de Estar",
  "Sala de Jantar",
  "Sala de Estar e Jantar",
  "Cozinha",
  "Lavanderia",
  "Banheiro Social",
  "Banheiro Suíte",
  "Suíte",
  "Quarto 1",
  "Quarto 2",
  "Home Office",
  "Varanda",
  "Hall de Entrada",
  "Área Gourmet",
];

const UNIDADES = ["Qt.", "m²", "m", "un", "pç", "cx", "kg", "L"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

// Map AI categories to our ItemCategory
const mapCategory = (aiCategory: string): ItemCategory => {
  const mapping: Record<string, ItemCategory> = {
    mobiliario: 'mobiliario',
    marcenaria: 'marcenaria',
    iluminacao: 'iluminacao',
    decoracao: 'decoracao',
    materiais: 'decoracao',
    outros: 'mobiliario',
  };
  return mapping[aiCategory] || 'mobiliario';
};

export const FloorPlanLayout = ({
  originalImage,
  items,
  onDataChange,
}: FloorPlanLayoutProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExtractingProduct, setIsExtractingProduct] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<{ category: ItemCategory; confidence: string } | null>(null);
  const [userChangedCategory, setUserChangedCategory] = useState(false);
  
  // Edit modal state
  const [editingItem, setEditingItem] = useState<FloorPlanItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Category tab state (for when items > 20)
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'mobiliario' | 'marcenaria'>('all');
  
  // Form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmbiente, setNewItemAmbiente] = useState(DEFAULT_AMBIENTES[0]);
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>("mobiliario");
  const [customAmbiente, setCustomAmbiente] = useState("");
  const [showCustomAmbiente, setShowCustomAmbiente] = useState(false);
  
  // New budget fields
  const [newItemQuantidade, setNewItemQuantidade] = useState(1);
  const [newItemUnidade, setNewItemUnidade] = useState("Qt.");
  const [newItemValor, setNewItemValor] = useState<number | ''>('');
  const [newItemFornecedor, setNewItemFornecedor] = useState("");
  const [newItemLink, setNewItemLink] = useState("");
  const [newItemImagem, setNewItemImagem] = useState<string>("");

  // Auto-detect category when item name changes
  useEffect(() => {
    if (userChangedCategory) return; // User manually selected, don't override
    
    const result = detectCategory(newItemName);
    
    if (result.confidence === 'high' || result.confidence === 'medium') {
      setNewItemCategory(result.category);
      setDetectedCategory({ category: result.category, confidence: result.confidence });
    } else {
      setDetectedCategory(null);
    }
  }, [newItemName, userChangedCategory]);

  // Reset userChangedCategory when form is cleared
  const handleCategoryChange = (category: ItemCategory) => {
    setNewItemCategory(category);
    setUserChangedCategory(true);
    setDetectedCategory(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0] && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onDataChange({
        originalImage: base64,
        items: items,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewItemImagem(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onDataChange({
      originalImage: null,
      items: items,
    });
  };

  const resetForm = () => {
    setNewItemName("");
    setNewItemQuantidade(1);
    setNewItemValor('');
    setNewItemFornecedor("");
    setNewItemLink("");
    setNewItemImagem("");
    setUserChangedCategory(false);
    setDetectedCategory(null);
    setNewItemCategory("mobiliario");
  };

  // Extract product info from URL using AI
  const extractProductFromLink = async (url: string) => {
    if (!url.trim() || !url.includes('http')) return;
    
    setIsExtractingProduct(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-product-info', {
        body: { url: url.trim() }
      });

      if (error) {
        console.error('Error extracting product:', error);
        toast({
          title: "Erro ao extrair informações",
          description: "Não foi possível obter dados do produto. Preencha manualmente.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.data) {
        const product = data.data;
        
        // Auto-fill the form
        if (product.nome) setNewItemName(product.nome);
        if (product.preco && product.preco > 0) setNewItemValor(product.preco);
        if (product.fornecedor) setNewItemFornecedor(product.fornecedor);
        if (product.categoria) setNewItemCategory(mapCategory(product.categoria));
        
        // Auto-fill image if available
        if (product.imagem) {
          setNewItemImagem(product.imagem);
        }
        
        setShowAdvanced(true);
        
        toast({
          title: "Produto identificado! ✨",
          description: `${product.nome}${product.preco > 0 ? ` - ${formatCurrency(product.preco)}` : ''}${product.imagem ? ' • Imagem incluída!' : ''}`,
        });
      } else {
        toast({
          title: "Não foi possível extrair",
          description: data?.error || "Preencha os dados manualmente.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingProduct(false);
    }
  };

  const addItem = () => {
    if (newItemName.trim()) {
      const ambiente = showCustomAmbiente && customAmbiente.trim() 
        ? customAmbiente.trim().toUpperCase() 
        : newItemAmbiente.toUpperCase();
        
      const newItem: FloorPlanItem = {
        number: 0, // Will be set by organizeAndNumberItems
        name: newItemName.trim().toUpperCase(),
        ambiente: ambiente,
        category: newItemCategory,
        quantidade: newItemQuantidade,
        unidade: newItemUnidade,
        valorProduto: typeof newItemValor === 'number' ? newItemValor : 0,
        fornecedor: newItemFornecedor.trim().toUpperCase(),
        link: newItemLink.trim(),
        imagem: newItemImagem,
      };
      
      // Add item and reorganize with proper numbering
      const allItems = [...items, newItem];
      const organizedItems = organizeAndNumberItems(allItems);
      
      onDataChange({
        originalImage,
        items: organizedItems,
      });
      
      resetForm();
    }
  };

  const removeItem = (index: number) => {
    // Find the actual item by its current position in the organized list
    const itemToRemove = items[index];
    const updatedItems = items.filter((_, i) => i !== index);
    
    // Re-organize and renumber after removal
    const organizedItems = organizeAndNumberItems(updatedItems);
    
    onDataChange({
      originalImage,
      items: organizedItems,
    });
  };

  const updateItem = (index: number, updates: Partial<FloorPlanItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    
    // Re-organize if category changed
    const needsReorganize = updates.category !== undefined;
    const finalItems = needsReorganize 
      ? organizeAndNumberItems(updatedItems) 
      : updatedItems;
    
    onDataChange({
      originalImage,
      items: finalItems,
    });
  };

  const handleEditItem = (item: FloorPlanItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedItem = (updatedItem: FloorPlanItem) => {
    const itemIndex = items.findIndex(i => i.number === updatedItem.number);
    if (itemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[itemIndex] = updatedItem;
      
      // Re-organize and renumber
      const organizedItems = organizeAndNumberItems(updatedItems);
      
      onDataChange({
        originalImage,
        items: organizedItems,
      });
      
      toast({
        title: "Item atualizado! ✅",
        description: updatedItem.name,
      });
    }
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const getCategoryConfig = (categoryId: ItemCategory) => {
    return LAYOUT_CATEGORIES.find(c => c.id === categoryId) || LAYOUT_CATEGORIES[0];
  };

  // Helper to check if an item is "complete" (has link and price)
  const isItemComplete = (item: FloorPlanItem): boolean => {
    return !!(item.link && item.valorProduto && item.valorProduto > 0);
  };

  // Category groups for tabs when items > 20
  const MOBILIARIO_CATEGORIES: ItemCategory[] = ['mobiliario', 'decoracao', 'iluminacao'];
  const MARCENARIA_CATEGORIES: ItemCategory[] = ['marcenaria', 'marmoraria', 'materiais', 'eletrica', 'hidraulica', 'maoDeObra', 'acabamentos', 'outros'];
  
  // Check if we need category tabs (more than 20 items)
  const needsCategoryTabs = items.length > 20;

  // Separate items by category groups
  const { mobiliarioItems, marcenariaItems } = useMemo(() => {
    const mobiliario: FloorPlanItem[] = [];
    const marcenaria: FloorPlanItem[] = [];
    
    items.forEach(item => {
      if (MOBILIARIO_CATEGORIES.includes(item.category)) {
        mobiliario.push(item);
      } else {
        marcenaria.push(item);
      }
    });
    
    return { mobiliarioItems: mobiliario, marcenariaItems: marcenaria };
  }, [items]);

  // Separate items into complete and pending
  const { completeItems, pendingItems } = useMemo(() => {
    const complete: FloorPlanItem[] = [];
    const pending: FloorPlanItem[] = [];
    
    items.forEach(item => {
      if (isItemComplete(item)) {
        complete.push(item);
      } else {
        pending.push(item);
      }
    });
    
    return { completeItems: complete, pendingItems: pending };
  }, [items]);

  // Filter by category group for display
  const getFilteredItems = (itemsList: FloorPlanItem[], categoryTab: 'all' | 'mobiliario' | 'marcenaria') => {
    if (categoryTab === 'all') return itemsList;
    const categories = categoryTab === 'mobiliario' ? MOBILIARIO_CATEGORIES : MARCENARIA_CATEGORIES;
    return itemsList.filter(item => categories.includes(item.category));
  };

  // Filtered pending items based on active tab
  const filteredPendingItems = useMemo(() => {
    return getFilteredItems(pendingItems, activeCategoryTab);
  }, [pendingItems, activeCategoryTab]);

  // Filtered complete items based on active tab
  const filteredCompleteItems = useMemo(() => {
    return getFilteredItems(completeItems, activeCategoryTab);
  }, [completeItems, activeCategoryTab]);

  // Group items by ambiente for display (filtered pending)
  const groupedPendingItems = useMemo(() => {
    return filteredPendingItems.reduce((acc, item) => {
      if (!acc[item.ambiente]) {
        acc[item.ambiente] = [];
      }
      acc[item.ambiente].push(item);
      return acc;
    }, {} as Record<string, FloorPlanItem[]>);
  }, [filteredPendingItems]);

  // Group complete items by ambiente (filtered)
  const groupedCompleteItems = useMemo(() => {
    return filteredCompleteItems.reduce((acc, item) => {
      if (!acc[item.ambiente]) {
        acc[item.ambiente] = [];
      }
      acc[item.ambiente].push(item);
      return acc;
    }, {} as Record<string, FloorPlanItem[]>);
  }, [filteredCompleteItems]);

  // Mark item as complete (confirm without editing)
  const markItemAsComplete = (item: FloorPlanItem) => {
    // Just show the edit modal so user can add missing info
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Calculate total
  const totalValor = items.reduce((sum, item) => {
    return sum + (item.valorProduto || 0) * (item.quantidade || 1);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div>
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Layout de Projeto
            </h3>
            <p className="text-sm text-muted-foreground">
              Itens com posição na planta: móveis, marcenaria, decoração, iluminação
            </p>
          </div>
        </div>
        {totalValor > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Estimado</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalValor)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Planta Baixa
          </h4>

          {!originalImage ? (
            <label
              className={`
                relative flex flex-col items-center justify-center w-full h-64
                border-2 border-dashed transition-all cursor-pointer
                ${isDragging 
                  ? "border-foreground bg-foreground/5" 
                  : "border-border hover:border-foreground/50 bg-background"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Arraste a planta ou clique para selecionar
              </span>
            </label>
          ) : (
            <div className="relative">
              <img
                src={originalImage}
                alt="Planta baixa"
                className="w-full h-64 object-contain bg-muted border border-border"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-background/90 border border-border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Category Legend */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase">Legenda de Categorias</h5>
            <div className="flex flex-wrap gap-2">
              {LAYOUT_CATEGORIES.map((cat) => (
                <div 
                  key={cat.id}
                  className={`px-2 py-1 text-xs rounded ${cat.bgColor} ${cat.textColor}`}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Items List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Adicionar Item
          </h4>

          {/* New Item Form */}
          <div className="space-y-3 p-3 bg-muted/50 border border-border rounded-lg">
            {/* Link do Produto - PRIMEIRO! */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cole o link do produto para preencher automaticamente
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://www.tokstok.com.br/produto..."
                    value={newItemLink}
                    onChange={(e) => setNewItemLink(e.target.value)}
                    className="h-10 text-sm pl-8"
                    disabled={isExtractingProduct}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => extractProductFromLink(newItemLink)}
                  disabled={!newItemLink.trim() || isExtractingProduct}
                  className="h-10 px-4"
                >
                  {isExtractingProduct ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Row 1: Ambiente & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ambiente</label>
                <Select 
                  value={showCustomAmbiente ? "__custom__" : newItemAmbiente} 
                  onValueChange={(val) => {
                    if (val === "__custom__") {
                      setShowCustomAmbiente(true);
                    } else {
                      setShowCustomAmbiente(false);
                      setNewItemAmbiente(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_AMBIENTES.map((amb) => (
                      <SelectItem key={amb} value={amb}>{amb}</SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Outro...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  Categoria
                  {detectedCategory && (
                    <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" />
                      Auto
                    </span>
                  )}
                </label>
                <Select 
                  value={newItemCategory} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger 
                    className={`h-9 text-sm transition-all ${
                      detectedCategory ? 'ring-2 ring-emerald-500/50' : ''
                    }`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded ${cat.bgColor}`}></span>
                          {cat.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showCustomAmbiente && (
              <Input
                type="text"
                placeholder="Digite o nome do ambiente"
                value={customAmbiente}
                onChange={(e) => setCustomAmbiente(e.target.value)}
                className="h-9 text-sm"
              />
            )}

            {/* Row 2: Item Name */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome do Item *</label>
              <Input
                type="text"
                placeholder="Ex: SOFÁ 232CM, MESA DE JANTAR 160CM"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 text-sm border-border"
              />
            </div>

            {/* Row 3: Quantity, Unit, Value */}
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Qtd</label>
                <Input
                  type="number"
                  min="1"
                  value={newItemQuantidade}
                  onChange={(e) => setNewItemQuantidade(parseInt(e.target.value) || 1)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Un</label>
                <Select value={newItemUnidade} onValueChange={setNewItemUnidade}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map((un) => (
                      <SelectItem key={un} value={un}>{un}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-muted-foreground">Valor R$</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={newItemValor}
                  onChange={(e) => setNewItemValor(e.target.value ? parseFloat(e.target.value) : '')}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Image upload - sempre visível */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Image className="w-3 h-3" />
                Imagem do Produto (facilita a lista de compras)
              </label>
              <div className="flex gap-2 items-center">
                {newItemImagem ? (
                  <div className="relative w-16 h-16 rounded border border-border overflow-hidden">
                    <img src={newItemImagem} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewItemImagem("")}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5 text-destructive-foreground" />
                    </button>
                  </div>
                ) : (
                  <label className="w-16 h-16 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors bg-muted/50">
                    <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                    <Image className="w-5 h-5 text-muted-foreground" />
                  </label>
                )}
                <p className="text-xs text-muted-foreground flex-1">
                  Arraste ou clique para adicionar foto do produto
                </p>
              </div>
            </div>

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAdvanced ? 'Menos opções' : 'Fornecedor e link...'}
            </button>

            {/* Advanced fields */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Fornecedor</label>
                      <Input
                        type="text"
                        placeholder="Nome da loja"
                        value={newItemFornecedor}
                        onChange={(e) => setNewItemFornecedor(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Link (alternativo)</label>
                      <div className="relative">
                        <Link className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={newItemLink}
                          onChange={(e) => setNewItemLink(e.target.value)}
                          className="h-9 text-sm pl-7"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Button */}
            <Button
              onClick={addItem}
              disabled={!newItemName.trim()}
              className="w-full h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
              {typeof newItemValor === 'number' && newItemValor > 0 && (
                <span className="ml-2 text-xs opacity-75">
                  ({formatCurrency(newItemValor * newItemQuantidade)})
                </span>
              )}
            </Button>
          </div>

          {/* Category Tabs - Show when more than 20 items */}
          {needsCategoryTabs && (
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeCategoryTab === 'all' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3 h-3 inline mr-1" />
                Todos ({items.length})
              </button>
              <button
                onClick={() => setActiveCategoryTab('mobiliario')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeCategoryTab === 'mobiliario' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🪑 Mob/Dec/Ilum ({mobiliarioItems.length})
              </button>
              <button
                onClick={() => setActiveCategoryTab('marcenaria')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeCategoryTab === 'marcenaria' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🪚 Marc/Mat/Obra ({marcenariaItems.length})
              </button>
            </div>
          )}

          {/* Items List - Separated by Status */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {/* Pending Items Section */}
            {filteredPendingItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-card py-2 z-10">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h5 className="text-sm font-semibold text-foreground">
                    Pendentes ({filteredPendingItems.length})
                  </h5>
                  <span className="text-xs text-muted-foreground">
                    — falta link ou valor
                  </span>
                </div>
                
                {Object.entries(groupedPendingItems).map(([ambiente, ambienteItems]) => (
                  <div key={`pending-${ambiente}`} className="space-y-2">
                    <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide pl-2">
                      {ambiente}
                    </h6>
                    <AnimatePresence>
                      {ambienteItems.map((item) => {
                        const catConfig = getCategoryConfig(item.category);
                        const itemIndex = items.findIndex(i => i.number === item.number);
                        const itemTotal = (item.valorProduto || 0) * (item.quantidade || 1);
                        
                        return (
                          <motion.div
                            key={item.number}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-2 p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors cursor-pointer group"
                            onClick={() => handleEditItem(item)}
                          >
                            {/* Number badge */}
                            <span 
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${catConfig.bgColor} ${catConfig.textColor}`}
                            >
                              {item.number}
                            </span>
                            
                            {/* Item image thumbnail */}
                            {item.imagem && (
                              <img src={item.imagem} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            
                            {/* Item info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {!item.link && <span className="text-amber-600">Sem link</span>}
                                {!item.valorProduto && <span className="text-amber-600">Sem valor</span>}
                                {item.fornecedor && <span>{item.fornecedor}</span>}
                              </div>
                            </div>
                            
                            {/* Edit button - prominent for pending items */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                              className="h-7 px-2 gap-1 text-xs bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800"
                            >
                              <Pencil className="w-3 h-3" />
                              Completar
                            </Button>
                            
                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(itemIndex);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Complete Items Section */}
            {filteredCompleteItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-card py-2 z-10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h5 className="text-sm font-semibold text-foreground">
                    Completos ({filteredCompleteItems.length})
                  </h5>
                  <span className="text-xs text-emerald-600 font-medium">
                    {formatCurrency(filteredCompleteItems.reduce((sum, item) => sum + (item.valorProduto || 0) * (item.quantidade || 1), 0))}
                  </span>
                </div>
                
                {Object.entries(groupedCompleteItems).map(([ambiente, ambienteItems]) => (
                  <div key={`complete-${ambiente}`} className="space-y-1">
                    <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide pl-2">
                      {ambiente}
                    </h6>
                    <AnimatePresence>
                      {ambienteItems.map((item) => {
                        const catConfig = getCategoryConfig(item.category);
                        const itemIndex = items.findIndex(i => i.number === item.number);
                        const itemTotal = (item.valorProduto || 0) * (item.quantidade || 1);
                        
                        return (
                          <motion.div
                            key={item.number}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition-colors cursor-pointer group"
                            onClick={() => handleEditItem(item)}
                          >
                            {/* Checkmark */}
                            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-white shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                            
                            {/* Item image thumbnail */}
                            {item.imagem && (
                              <img src={item.imagem} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            
                            {/* Item info - compact */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-emerald-800 dark:text-emerald-200">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{item.fornecedor}</span>
                                {item.quantidade > 1 && <span>{item.quantidade} {item.unidade}</span>}
                              </div>
                            </div>
                            
                            {/* Price */}
                            <span className="text-sm font-bold text-emerald-600 shrink-0">
                              {formatCurrency(itemTotal)}
                            </span>
                            
                            {/* Link indicator */}
                            {item.link && (
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:text-blue-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link className="w-4 h-4" />
                              </a>
                            )}

                            {/* Edit button - subtle for complete items */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditItem(item);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            
                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(itemIndex);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Adicione os itens do projeto para a lista de compras
              </p>
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {items.length} itens
                  </span>
                  {pendingItems.length > 0 && (
                    <span className="text-amber-600 text-xs">
                      {pendingItems.length} pendente{pendingItems.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {completeItems.length > 0 && (
                    <span className="text-emerald-600 text-xs">
                      {completeItems.length} completo{completeItems.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {totalValor > 0 && (
                  <span className="font-bold text-emerald-600">{formatCurrency(totalValor)}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ItemEditModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEditedItem}
        categories={LAYOUT_CATEGORIES}
      />
    </motion.div>
  );
};
