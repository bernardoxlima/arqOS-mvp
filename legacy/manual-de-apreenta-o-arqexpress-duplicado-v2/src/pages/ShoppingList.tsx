import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Image as ImageIcon, Download, ShoppingBag, FileDown, Loader2, Pencil, Check, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { FloorPlanItem, LAYOUT_CATEGORIES, COMPLEMENTARY_CATEGORIES } from "@/types/presentation";
import { generateShoppingListPPT } from "@/utils/generateShoppingListPPT";
import { useToast } from "@/hooks/use-toast";
import { ItemEditModal } from "@/components/ItemEditModal";
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(value);
};

const getCategoryConfig = (categoryId: string) => {
  const allCategories = [...LAYOUT_CATEGORIES, ...COMPLEMENTARY_CATEGORIES];
  return allCategories.find(c => c.id === categoryId) || { bgColor: 'bg-gray-500', textColor: 'text-white' };
};

const ShoppingList = () => {
  const navigate = useNavigate();
  const { data, isLoaded, setFloorPlanLayout, setComplementaryItems } = usePresentationStorage();
  const [selectedAmbiente, setSelectedAmbiente] = useState<string | null>(null);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [editingItem, setEditingItem] = useState<FloorPlanItem | null>(null);
  const { toast } = useToast();

  // Check if item is complete (has link and price)
  const isItemComplete = (item: FloorPlanItem) => {
    return item.link && item.link.trim() !== '' && item.valorProduto && item.valorProduto > 0;
  };

  // Handle item edit
  const handleEditItem = (item: FloorPlanItem) => {
    setEditingItem(item);
  };

  // Save edited item back to storage
  const handleSaveEditedItem = (updatedItem: FloorPlanItem) => {
    // Check if item is in floorPlanLayout or complementaryItems
    const floorPlanItems = data.floorPlanLayout?.items || [];
    const complementaryItemsList = data.complementaryItems?.items || [];
    
    const inFloorPlan = floorPlanItems.some(i => i.number === updatedItem.number && i.name === editingItem?.name);
    
    if (inFloorPlan) {
      const updated = floorPlanItems.map(item => 
        item.number === updatedItem.number && item.name === editingItem?.name ? updatedItem : item
      );
      setFloorPlanLayout({ ...data.floorPlanLayout, items: updated });
    } else {
      const updated = complementaryItemsList.map(item => 
        item.number === updatedItem.number && item.name === editingItem?.name ? updatedItem : item
      );
      setComplementaryItems({ items: updated });
    }
    
    setEditingItem(null);
    toast({
      title: "Item atualizado!",
      description: "As alterações foram salvas em todos os lugares."
    });
  };

  // Combine all items
  const allItems: FloorPlanItem[] = useMemo(() => {
    if (!isLoaded) return [];
    return [
      ...(data.floorPlanLayout?.items || []),
      ...(data.complementaryItems?.items || []),
    ].sort((a, b) => a.number - b.number);
  }, [isLoaded, data.floorPlanLayout, data.complementaryItems]);

  // Get unique ambientes
  const ambientes = useMemo(() => {
    const unique = new Set(allItems.map(item => item.ambiente));
    return Array.from(unique);
  }, [allItems]);

  // Filter items by ambiente if selected
  const filteredItems = useMemo(() => {
    if (!selectedAmbiente) return allItems;
    return allItems.filter(item => item.ambiente === selectedAmbiente);
  }, [allItems, selectedAmbiente]);

  // Calculate totals
  const totalValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      return sum + (item.valorProduto || 0) * (item.quantidade || 1);
    }, 0);
  }, [filteredItems]);

  // Generate PPT handler
  const handleGeneratePPT = async () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens antes de gerar o PPT.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPPT(true);
    try {
      await generateShoppingListPPT({
        projectName: data.projectName || "Projeto",
        items: allItems
      });
      toast({
        title: "PPT gerado!",
        description: "A Lista de Compras foi baixada em formato PowerPoint."
      });
    } catch (error) {
      console.error("Error generating PPT:", error);
      toast({
        title: "Erro ao gerar PPT",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  LISTA DE COMPRAS
                </h1>
                <p className="text-sm text-muted-foreground">
                  {data.projectName || "Projeto"} • {filteredItems.length} itens
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {totalValue > 0 && (
                <div className="text-right mr-4">
                  <p className="text-xs text-muted-foreground">Total Estimado</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
                </div>
              )}
              
              <Button
                onClick={handleGeneratePPT}
                disabled={isGeneratingPPT || allItems.length === 0}
                className="gap-2"
              >
                {isGeneratingPPT ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Baixar PPT
              </Button>
            </div>
          </div>

          {/* Ambiente filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedAmbiente(null)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                !selectedAmbiente
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
              }`}
            >
              Todos ({allItems.length})
            </button>
            {ambientes.map(ambiente => {
              const count = allItems.filter(i => i.ambiente === ambiente).length;
              return (
                <button
                  key={ambiente}
                  onClick={() => setSelectedAmbiente(ambiente)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    selectedAmbiente === ambiente
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                  }`}
                >
                  {ambiente} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Shopping List Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum item cadastrado ainda.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/planta-layout")}
            >
              Adicionar Itens
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              const catConfig = getCategoryConfig(item.category);
              const itemTotal = (item.valorProduto || 0) * (item.quantidade || 1);
              const complete = isItemComplete(item);
              
              return (
                <motion.div
                  key={`${item.number}-${item.name}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                    complete ? 'border-emerald-200' : 'border-amber-200'
                  }`}
                  onClick={() => handleEditItem(item)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-muted">
                    {item.imagem ? (
                      <img 
                        src={item.imagem} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted-foreground/5">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground/50">Clique para adicionar</span>
                      </div>
                    )}
                    
                    {/* Number badge */}
                    <div 
                      className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${catConfig.bgColor} ${catConfig.textColor}`}
                    >
                      {item.number}
                    </div>
                    
                    {/* Status badge */}
                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                      complete ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {complete ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    
                    {/* Edit overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white rounded-full p-3">
                        <Pencil className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm uppercase leading-tight mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{item.ambiente}</span>
                      {item.quantidade && item.quantidade > 1 && (
                        <>
                          <span>•</span>
                          <span>{item.quantidade} {item.unidade || 'un'}</span>
                        </>
                      )}
                    </div>
                    
                    {item.fornecedor && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.fornecedor}
                      </p>
                    )}
                    
                    {itemTotal > 0 ? (
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(itemTotal)}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 font-medium">
                        Adicionar preço
                      </p>
                    )}
                    
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Comprar
                      </a>
                    ) : (
                      <div className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-md text-sm font-medium">
                        <Pencil className="w-4 h-4" />
                        Adicionar link
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary by ambiente */}
        {allItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 p-6 bg-card border border-border rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Resumo por Ambiente</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ambientes.map(ambiente => {
                const ambienteItems = allItems.filter(i => i.ambiente === ambiente);
                const ambienteTotal = ambienteItems.reduce((sum, item) => 
                  sum + (item.valorProduto || 0) * (item.quantidade || 1), 0
                );
                
                return (
                  <div key={ambiente} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">{ambiente}</p>
                    <p className="text-xs text-muted-foreground">{ambienteItems.length} itens</p>
                    {ambienteTotal > 0 && (
                      <p className="text-sm font-bold text-emerald-600 mt-1">
                        {formatCurrency(ambienteTotal)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/planta-layout")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Editar Itens
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/orcamento")}
          >
            Ver Orçamento Completo
          </Button>
        </div>
      </main>

      {/* Edit Modal */}
      <ItemEditModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEditedItem}
        categories={[...LAYOUT_CATEGORIES, ...COMPLEMENTARY_CATEGORIES]}
      />
    </div>
  );
};

export default ShoppingList;
