import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckSquare, ChevronDown, ChevronUp, Link, Image, Loader2, Sparkles, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloorPlanItem, ItemCategory, COMPLEMENTARY_CATEGORIES } from "@/types/presentation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { detectCategory, organizeAndNumberItems } from "@/utils/categoryDetection";
import { ItemEditModal } from "@/components/ItemEditModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComplementaryItemsProps {
  items: FloorPlanItem[];
  startingNumber: number;
  onDataChange: (items: FloorPlanItem[]) => void;
}

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
  "Geral",
];

const UNIDADES = ["Qt.", "m²", "m", "un", "pç", "cx", "kg", "L"];

const ITEM_SUGGESTIONS: Record<ItemCategory, string[]> = {
  materiais: ["Tinta paredes", "Tinta teto", "Rodapé", "Porcelanato piso", "Revestimento parede", "Papel de parede", "Pedra bancada", "Soleira", "Filetes"],
  iluminacao: ["Spots embutidos", "Fita LED", "Trilho eletrificado", "Plafon", "Arandela", "Pendente", "Dimmer"],
  eletrica: ["Pontos elétricos", "Quadro de luz", "Tomadas", "Interruptores", "Disjuntores"],
  hidraulica: ["Pontos hidráulicos", "Registro", "Sifão", "Caixa sifonada", "Engate flexível"],
  maoDeObra: ["Pintura", "Instalação marcenaria", "Instalação marmoraria", "Instalação elétrica", "Instalação hidráulica", "Gesseiro", "Pedreiro", "Instalação papel parede", "Montagem móveis"],
  outros: ["Louça sanitária", "Metais banheiro", "Torneira cozinha", "Cuba", "Ralo linear", "Fechaduras", "Puxadores"],
  acabamentos: ["Rodapé", "Soleira", "Filetes", "Molduras", "Espelho", "Vidros"],
  cortinas: ["Cortina blackout", "Persiana", "Cortina voil", "Varão", "Trilho cortina"],
  mobiliario: [],
  marcenaria: [],
  marmoraria: [],
  decoracao: [],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Map AI categories to our ItemCategory
const mapCategory = (aiCategory: string): ItemCategory => {
  const mapping: Record<string, ItemCategory> = {
    mobiliario: 'mobiliario',
    marcenaria: 'marcenaria',
    iluminacao: 'iluminacao',
    decoracao: 'decoracao',
    materiais: 'materiais',
    outros: 'outros',
  };
  return mapping[aiCategory] || 'outros';
};

export const ComplementaryItems = ({
  items,
  startingNumber,
  onDataChange,
}: ComplementaryItemsProps) => {
  const { toast } = useToast();
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmbiente, setNewItemAmbiente] = useState(DEFAULT_AMBIENTES[0]);
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>("materiais");
  const [customAmbiente, setCustomAmbiente] = useState("");
  const [showCustomAmbiente, setShowCustomAmbiente] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExtractingProduct, setIsExtractingProduct] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<{ category: ItemCategory; confidence: string } | null>(null);
  const [userChangedCategory, setUserChangedCategory] = useState(false);
  
  // Edit modal state
  const [editingItem, setEditingItem] = useState<FloorPlanItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Budget fields
  const [newItemQuantidade, setNewItemQuantidade] = useState(1);
  const [newItemUnidade, setNewItemUnidade] = useState("Qt.");
  const [newItemValor, setNewItemValor] = useState<number | ''>('');
  const [newItemFornecedor, setNewItemFornecedor] = useState("");
  const [newItemLink, setNewItemLink] = useState("");

  // Auto-detect category when item name changes
  useEffect(() => {
    if (userChangedCategory) return;
    
    const result = detectCategory(newItemName);
    
    // Only auto-detect categories that are in COMPLEMENTARY_CATEGORIES
    const validCategories = COMPLEMENTARY_CATEGORIES.map(c => c.id);
    
    if ((result.confidence === 'high' || result.confidence === 'medium') && validCategories.includes(result.category)) {
      setNewItemCategory(result.category);
      setDetectedCategory({ category: result.category, confidence: result.confidence });
    } else {
      setDetectedCategory(null);
    }
  }, [newItemName, userChangedCategory]);

  const handleCategoryChange = (category: ItemCategory) => {
    setNewItemCategory(category);
    setUserChangedCategory(true);
    setDetectedCategory(null);
    setShowSuggestions(true);
  };

  const resetForm = () => {
    setNewItemName("");
    setNewItemQuantidade(1);
    setNewItemValor('');
    setNewItemFornecedor("");
    setNewItemLink("");
    setUserChangedCategory(false);
    setDetectedCategory(null);
    setNewItemCategory("materiais");
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
        
        setShowAdvanced(true);
        
        toast({
          title: "Produto identificado! ✨",
          description: `${product.nome}${product.preco > 0 ? ` - ${formatCurrency(product.preco)}` : ''}`,
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

  const addItem = (itemName?: string) => {
    const nameToAdd = itemName || newItemName.trim();
    if (nameToAdd) {
      const ambiente = showCustomAmbiente && customAmbiente.trim() 
        ? customAmbiente.trim().toUpperCase() 
        : newItemAmbiente.toUpperCase();
        
      const newItem: FloorPlanItem = {
        number: 0, // Will be set by organizeAndNumberItems
        name: nameToAdd.toUpperCase(),
        ambiente: ambiente,
        category: newItemCategory,
        quantidade: newItemQuantidade,
        unidade: newItemUnidade,
        valorProduto: typeof newItemValor === 'number' ? newItemValor : 0,
        fornecedor: newItemFornecedor.trim().toUpperCase(),
        link: newItemLink.trim(),
      };
      
      // Add item and reorganize with proper numbering
      const allItems = [...items, newItem];
      const organizedItems = organizeAndNumberItems(allItems).map((item, i) => ({
        ...item,
        number: startingNumber + i,
      }));
      
      onDataChange(organizedItems);
      
      if (!itemName) {
        resetForm();
      }
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    
    // Re-organize and renumber after removal
    const organizedItems = organizeAndNumberItems(updatedItems).map((item, i) => ({
      ...item,
      number: startingNumber + i,
    }));
    
    onDataChange(organizedItems);
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
      const organizedItems = organizeAndNumberItems(updatedItems).map((item, i) => ({
        ...item,
        number: startingNumber + i,
      }));
      
      onDataChange(organizedItems);
      
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
    return COMPLEMENTARY_CATEGORIES.find(c => c.id === categoryId) || COMPLEMENTARY_CATEGORIES[0];
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.ambiente]) {
      acc[item.ambiente] = [];
    }
    acc[item.ambiente].push(item);
    return acc;
  }, {} as Record<string, FloorPlanItem[]>);

  const currentSuggestions = ITEM_SUGGESTIONS[newItemCategory] || [];
  const addedItemNames = items.map(i => i.name.toLowerCase());
  
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
          <span className="text-xl">🔧</span>
          <div>
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Itens Complementares
            </h3>
            <p className="text-sm text-muted-foreground">
              Materiais, mão de obra e itens que não aparecem na planta
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
        {/* Left: Add Item Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Adicionar Item
          </h4>

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
                    placeholder="https://..."
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

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                Categoria
                {detectedCategory && (
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    Auto
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-1">
                {COMPLEMENTARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      newItemCategory === cat.id
                        ? `${cat.bgColor} ${cat.textColor} ring-2 ring-offset-1 ${detectedCategory?.category === cat.id ? 'ring-emerald-500' : 'ring-foreground'}`
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambiente Selection */}
            <div className="space-y-2">
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
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_AMBIENTES.map((amb) => (
                    <SelectItem key={amb} value={amb}>{amb}</SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Outro ambiente...</SelectItem>
                </SelectContent>
              </Select>
              {showCustomAmbiente && (
                <Input
                  type="text"
                  placeholder="Digite o nome do ambiente"
                  value={customAmbiente}
                  onChange={(e) => setCustomAmbiente(e.target.value)}
                  className="h-9 text-sm"
                />
              )}
            </div>

            {/* Item Name */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nome do Item *</label>
              <Input
                type="text"
                placeholder="Ex: Tinta paredes, Rodapé 10cm..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 text-sm border-border"
              />
            </div>

            {/* Quantity, Unit, Value */}
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

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAdvanced ? 'Menos opções' : 'Fornecedor, link...'}
            </button>

            {/* Advanced fields */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-2"
                >
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
                    <label className="text-xs text-muted-foreground">Link</label>
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Button */}
            <Button
              onClick={() => addItem()}
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

            {/* Suggestions Checklist */}
            {showSuggestions && currentSuggestions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    Sugestões rápidas
                  </label>
                  <button 
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ocultar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentSuggestions.slice(0, 6).map((suggestion) => {
                    const isAdded = addedItemNames.includes(suggestion.toLowerCase());
                    return (
                      <button
                        key={suggestion}
                        onClick={() => !isAdded && addItem(suggestion)}
                        disabled={isAdded}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          isAdded
                            ? 'bg-muted text-muted-foreground line-through opacity-50 cursor-not-allowed'
                            : 'border-border hover:border-foreground hover:bg-muted'
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Items List */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Itens Adicionados ({items.length})
          </h4>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {Object.keys(groupedItems).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Adicione materiais, mão de obra e itens de obra
              </p>
            ) : (
              Object.entries(groupedItems).map(([ambiente, ambienteItems]) => (
                <div key={ambiente} className="space-y-2">
                  <h5 className="text-xs font-semibold text-foreground uppercase tracking-wide border-b border-border pb-1">
                    {ambiente}
                  </h5>
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
                          className="flex items-center gap-2 p-2 bg-background rounded border border-border hover:border-foreground/30 transition-colors cursor-pointer group"
                          onClick={() => handleEditItem(item)}
                        >
                          <span 
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${catConfig.bgColor} ${catConfig.textColor}`}
                          >
                            {item.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {item.fornecedor && <span>{item.fornecedor}</span>}
                              {item.quantidade && item.quantidade > 1 && (
                                <span>{item.quantidade} {item.unidade || 'un'}</span>
                              )}
                              {itemTotal > 0 && (
                                <span className="text-emerald-600 font-medium">{formatCurrency(itemTotal)}</span>
                              )}
                            </div>
                          </div>
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
                          {/* Edit button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
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
              ))
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {items.length} itens • {Object.keys(groupedItems).length} ambientes
                </span>
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
        categories={COMPLEMENTARY_CATEGORIES}
      />
    </motion.div>
  );
};
