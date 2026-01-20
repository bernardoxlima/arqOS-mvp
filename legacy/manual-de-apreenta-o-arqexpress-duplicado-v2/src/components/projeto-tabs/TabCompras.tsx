import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Download, 
  FileSpreadsheet, 
  Calculator,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Edit2,
  ExternalLink,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloorPlanItem, ItemCategory, FloorPlanLayoutData, ComplementaryItemsData } from "@/types/presentation";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";
import { ItemEditModal } from "@/components/ItemEditModal";
import { generateShoppingListPPT } from "@/utils/generateShoppingListPPT";
import { generateBudgetExcel } from "@/utils/generateBudget";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_ORDER, getCategoryStyle, CATEGORY_DEFINITIONS, getAllCategoriesSorted } from "@/config/categories";

interface TabComprasProps {
  data: StoredPresentationData;
  setFloorPlanLayout: (layout: FloorPlanLayoutData) => void;
  setComplementaryItems: (items: ComplementaryItemsData) => void;
}

const getCategoryConfig = (categoryId: ItemCategory) => {
  return getCategoryStyle(categoryId);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Organiza todos os itens por ambiente e categoria, e renumera sequencialmente
 */
const organizeAllItems = (layoutItems: FloorPlanItem[], complementaryItems: FloorPlanItem[]): FloorPlanItem[] => {
  // Combine all items
  const allItems = [...layoutItems, ...complementaryItems];
  
  if (allItems.length === 0) return [];
  
  // Get unique ambientes sorted alphabetically
  const ambientes = Array.from(new Set(allItems.map(item => item.ambiente))).sort();
  
  // Group items by ambiente, then sort by category within each ambiente
  const organizedItems: FloorPlanItem[] = [];
  
  ambientes.forEach(ambiente => {
    const ambienteItems = allItems.filter(item => item.ambiente === ambiente);
    
    // Sort by category order
    ambienteItems.sort((a, b) => {
      const orderA = CATEGORY_ORDER.indexOf(a.category);
      const orderB = CATEGORY_ORDER.indexOf(b.category);
      return orderA - orderB;
    });
    
    organizedItems.push(...ambienteItems);
  });
  
  // Renumber sequentially
  return organizedItems.map((item, index) => ({
    ...item,
    number: index + 1,
  }));
};

/**
 * Separa itens organizados de volta para layout e complementary
 */
const splitOrganizedItems = (
  organizedItems: FloorPlanItem[], 
  originalLayoutItems: FloorPlanItem[], 
  originalComplementaryItems: FloorPlanItem[]
): { layoutItems: FloorPlanItem[]; complementaryItems: FloorPlanItem[] } => {
  // Use a unique identifier to track which items belong to which list
  // We'll use a combination of name + ambiente + category as identifier
  const getItemKey = (item: FloorPlanItem) => `${item.name}|${item.ambiente}|${item.category}`;
  
  // Build sets of original item keys
  const originalLayoutKeys = new Set(originalLayoutItems.map(getItemKey));
  const originalComplementaryKeys = new Set(originalComplementaryItems.map(getItemKey));
  
  const layoutItems: FloorPlanItem[] = [];
  const complementaryItems: FloorPlanItem[] = [];
  
  organizedItems.forEach(item => {
    const key = getItemKey(item);
    if (originalLayoutKeys.has(key)) {
      layoutItems.push(item);
    } else if (originalComplementaryKeys.has(key)) {
      complementaryItems.push(item);
    } else {
      // New item or unknown - default to layout if it matches layout categories
      const layoutCategories = ['marcenaria', 'marmoraria', 'mobiliario', 'iluminacao', 'decoracao'];
      if (layoutCategories.includes(item.category)) {
        layoutItems.push(item);
      } else {
        complementaryItems.push(item);
      }
    }
  });
  
  return { layoutItems, complementaryItems };
};

export function TabCompras({
  data,
  setFloorPlanLayout,
  setComplementaryItems,
}: TabComprasProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAmbiente, setFilterAmbiente] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<FloorPlanItem | null>(null);

  // Combine and organize all items - GROUP BY CATEGORY first, then by ambiente
  const allItems = useMemo(() => {
    const layoutItems = data.floorPlanLayout.items;
    const complementaryItems = data.complementaryItems.items;
    const combined = [...layoutItems, ...complementaryItems];
    
    if (combined.length === 0) return [];
    
    // Sort by category order first, then by ambiente, then by number
    const organized = [...combined].sort((a, b) => {
      const catOrderA = CATEGORY_ORDER.indexOf(a.category);
      const catOrderB = CATEGORY_ORDER.indexOf(b.category);
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      
      const ambienteCompare = (a.ambiente || "").localeCompare(b.ambiente || "");
      if (ambienteCompare !== 0) return ambienteCompare;
      
      return a.number - b.number;
    });
    
    // Renumber sequentially
    return organized.map((item, index) => ({
      ...item,
      number: index + 1,
    }));
  }, [data.floorPlanLayout.items, data.complementaryItems.items]);

  // Get unique ambientes
  const ambientes = useMemo(() => {
    const set = new Set(allItems.map(item => item.ambiente));
    return Array.from(set).sort();
  }, [allItems]);
  
  // Get unique categories present in items
  const categoriesInUse = useMemo(() => {
    const categoryIds = new Set(allItems.map(item => item.category));
    return CATEGORY_DEFINITIONS.filter(cat => categoryIds.has(cat.id));
  }, [allItems]);

  // Filter items (maintaining the organized order)
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ambiente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAmbiente = filterAmbiente === "all" || item.ambiente === filterAmbiente;
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesAmbiente && matchesCategory;
    });
  }, [allItems, searchTerm, filterAmbiente, filterCategory]);
  
  // Group filtered items by category for display
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, FloorPlanItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalProduto = filteredItems.reduce((sum, item) => sum + (item.valorProduto || 0), 0);
    const total = totalProduto;
    return { totalProduto, total };
  }, [filteredItems]);

  // Count items with complete info
  const itemsWithPrice = allItems.filter(i => (i.valorProduto || 0) > 0).length;
  const itemsWithLink = allItems.filter(i => i.link).length;
  const itemsWithImage = allItems.filter(i => i.imagem).length;

  const handleSaveItem = (updatedItem: FloorPlanItem) => {
    // Find and update the item in the combined list
    const updatedAllItems = allItems.map(item => 
      item.number === updatedItem.number ? updatedItem : item
    );
    
    // Re-organize all items with new numbering
    const organizedItems = organizeAllItems(
      updatedAllItems.filter(item => {
        // Determine if item belongs to layout based on original data
        return data.floorPlanLayout.items.some(li => 
          li.name === item.name && li.ambiente === item.ambiente && li.category === item.category
        ) || ['marcenaria', 'marmoraria', 'mobiliario', 'iluminacao', 'decoracao'].includes(item.category);
      }),
      updatedAllItems.filter(item => {
        // Complementary items
        return data.complementaryItems.items.some(ci => 
          ci.name === item.name && ci.ambiente === item.ambiente && ci.category === item.category
        ) || ['materiais', 'eletrica', 'hidraulica', 'maoDeObra', 'acabamentos', 'outros'].includes(item.category);
      })
    );
    
    // Split back to layout and complementary
    const { layoutItems, complementaryItems } = splitOrganizedItems(
      organizedItems,
      data.floorPlanLayout.items,
      data.complementaryItems.items
    );
    
    setFloorPlanLayout({ ...data.floorPlanLayout, items: layoutItems });
    setComplementaryItems({ items: complementaryItems });
    
    setEditingItem(null);
    toast({
      title: "Item atualizado!",
      description: `${updatedItem.name} foi salvo com sucesso.`,
    });
  };

  const handleGenerateShoppingListPPT = async () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens no Layout primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateShoppingListPPT({
        projectName: data.projectName || "Projeto",
        items: allItems,
      });
      toast({
        title: "Lista de Compras PPT gerada!",
        description: "O download iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Error generating shopping list PPT:", error);
      toast({
        title: "Erro ao gerar PPT",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateExcel = () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item para exportar",
        description: "Adicione itens no Layout primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      generateBudgetExcel({
        projectName: data.projectName || "Projeto",
        clientName: data.clientData.clientName || "Cliente",
        items: allItems,
      });
      toast({
        title: "Orçamento Excel gerado!",
        description: "O download iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Erro ao gerar Excel",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{allItems.length}</div>
          <div className="text-xs text-muted-foreground">Total Itens</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{itemsWithPrice}</div>
          <div className="text-xs text-muted-foreground">Com Preço</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{itemsWithLink}</div>
          <div className="text-xs text-muted-foreground">Com Link</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{itemsWithImage}</div>
          <div className="text-xs text-muted-foreground">Com Imagem</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totals.total)}</div>
          <div className="text-xs text-muted-foreground">Total Geral</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar item ou ambiente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAmbiente} onValueChange={setFilterAmbiente}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Ambiente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Ambientes</SelectItem>
            {ambientes.map(amb => (
              <SelectItem key={amb} value={amb}>{amb}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categoriesInUse.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Items List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ambiente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Categoria</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CATEGORY_ORDER.map(categoryId => {
                const categoryItems = groupedByCategory[categoryId];
                if (!categoryItems || categoryItems.length === 0) return null;
                
                const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === categoryId);
                const catStyle = getCategoryConfig(categoryId);
                
                return (
                  <>
                    {/* Category Header Row */}
                    <tr key={`header-${categoryId}`} className={`${catStyle.bgColor} ${catStyle.textColor}`}>
                      <td colSpan={7} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm uppercase">{categoryDef?.label || categoryId}</span>
                          <span className="text-xs opacity-75">({categoryItems.length} itens)</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Category Items */}
                    {categoryItems.map((item) => {
                      const itemTotal = (item.valorProduto || 0);
                      const hasPrice = itemTotal > 0;
                      const hasLink = !!item.link;
                      const hasImage = !!item.imagem;
                      
                      const uniqueKey = `${item.number}-${item.name}-${item.ambiente}-${categoryId}`;
                      
                      return (
                        <tr key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center font-bold ${catStyle.bgColor} ${catStyle.textColor} ${String(item.number).length >= 2 ? 'text-[10px]' : 'text-xs'}`}>
                              {item.number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{item.name}</div>
                            {item.fornecedor && (
                              <div className="text-xs text-muted-foreground">{item.fornecedor}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.ambiente}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`${catStyle.bgColor} ${catStyle.textColor} border-0`}>
                              {catStyle.shortLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">
                            {hasPrice ? formatCurrency(itemTotal) : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {hasPrice ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                              {hasLink ? (
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                              ) : (
                                <ExternalLink className="w-4 h-4 text-muted-foreground/30" />
                              )}
                              {hasImage ? (
                                <Image className="w-4 h-4 text-purple-500" />
                              ) : (
                                <Image className="w-4 h-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum item encontrado</p>
              <p className="text-sm">Adicione itens na aba Layout</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Export Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Button
          size="lg"
          variant="outline"
          className="h-14 border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={handleGenerateShoppingListPPT}
          disabled={allItems.length === 0}
        >
          <Download className="w-5 h-5 mr-2" />
          Gerar Lista de Compras PPT
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          onClick={handleGenerateExcel}
          disabled={allItems.length === 0}
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Exportar Orçamento Excel
        </Button>
      </motion.div>

      {/* Edit Modal */}
      {editingItem && (
        <ItemEditModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
          categories={CATEGORY_DEFINITIONS.map(c => ({ id: c.id, label: c.label, color: c.color, bgColor: c.bgColor, textColor: c.textColor, showInLayout: c.group === 'layout' || c.group === 'both' }))}
        />
      )}
    </div>
  );
}
