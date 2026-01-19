import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Layers,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FloorPlanItem, ItemCategory } from "@/types/presentation";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";
import { generateDetailingPPT } from "@/utils/generateDetailingPPT";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_ORDER, getCategoryStyle, CATEGORY_DEFINITIONS } from "@/config/categories";

interface TabDetalhamentoProps {
  data: StoredPresentationData;
}

const getCategoryConfig = (categoryId: ItemCategory) => {
  return getCategoryStyle(categoryId);
};

export function TabDetalhamento({ data }: TabDetalhamentoProps) {
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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

  // Group items by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, FloorPlanItem[]> = {};
    allItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [allItems]);

  // Get categories that have items
  const categoriesWithItems = CATEGORY_ORDER.filter(cat => groupedByCategory[cat]?.length > 0);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleGenerateDetailingPPT = async () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens no Layout primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateDetailingPPT({
        projectName: data.projectName || "Projeto",
        floorPlanImage: data.floorPlanLayout.originalImage,
        items: allItems,
      });
      toast({
        title: "Detalhamento PPT gerado!",
        description: "O download iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Error generating detailing PPT:", error);
      toast({
        title: "Erro ao gerar PPT",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const hasFloorPlan = !!data.floorPlanLayout.originalImage;

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detalhamento Técnico
          </h2>
          <p className="text-sm text-muted-foreground">
            Visualize cada categoria com a planta baixa como referência
          </p>
        </div>
        <Button
          onClick={handleGenerateDetailingPPT}
          disabled={allItems.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Gerar PPT Detalhamento
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{categoriesWithItems.length}</div>
          <div className="text-xs text-muted-foreground">Categorias</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{allItems.length}</div>
          <div className="text-xs text-muted-foreground">Total Itens</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className={`text-2xl font-bold ${hasFloorPlan ? 'text-emerald-600' : 'text-amber-600'}`}>
            {hasFloorPlan ? '✓' : '⚠'}
          </div>
          <div className="text-xs text-muted-foreground">Planta Baixa</div>
        </div>
        <div className="bg-card border border-border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {categoriesWithItems.length}
          </div>
          <div className="text-xs text-muted-foreground">Páginas no PPT</div>
        </div>
      </motion.div>

      {/* Category Preview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {categoriesWithItems.map((categoryId, index) => {
          const categoryItems = groupedByCategory[categoryId] || [];
          const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === categoryId);
          const catStyle = getCategoryConfig(categoryId as ItemCategory);
          const isExpanded = expandedCategories[categoryId];

          // Group items by ambiente within this category
          const itemsByAmbiente: Record<string, FloorPlanItem[]> = {};
          categoryItems.forEach(item => {
            if (!itemsByAmbiente[item.ambiente]) {
              itemsByAmbiente[item.ambiente] = [];
            }
            itemsByAmbiente[item.ambiente].push(item);
          });
          const ambientes = Object.keys(itemsByAmbiente).sort();

          return (
            <motion.div
              key={categoryId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-card border border-border overflow-hidden"
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(categoryId)}>
                <CollapsibleTrigger className="w-full">
                  <div className={`flex items-center justify-between p-4 ${catStyle.bgColor} ${catStyle.textColor}`}>
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5" />
                      <span className="font-bold text-sm uppercase">
                        {categoryDef?.label || categoryId}
                      </span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'itens'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">
                        {ambientes.length} {ambientes.length === 1 ? 'ambiente' : 'ambientes'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Floor Plan Preview */}
                    <div className="md:w-[60%] p-4 bg-muted/30 border-r border-border">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        Planta Baixa - Referência
                      </div>
                      <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {hasFloorPlan ? (
                          <img 
                            src={data.floorPlanLayout.originalImage!} 
                            alt="Planta Baixa"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Planta baixa não disponível</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Item List */}
                    <div className="md:w-[40%] p-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                        Itens da Categoria
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {ambientes.map(ambiente => (
                          <div key={ambiente}>
                            <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">
                              {ambiente}
                            </div>
                            <div className="space-y-1">
                              {itemsByAmbiente[ambiente].map(item => (
                                <div 
                                  key={`${item.number}-${item.name}`}
                                  className="flex items-center gap-2"
                                >
                                  <span 
                                    className={`min-w-6 h-6 px-1 rounded-full flex items-center justify-center font-bold text-[10px] ${catStyle.bgColor} ${catStyle.textColor}`}
                                  >
                                    {item.number}
                                  </span>
                                  <span className="text-sm text-foreground truncate">
                                    {item.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {categoriesWithItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border p-12 text-center"
        >
          <Layers className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum item cadastrado
          </h3>
          <p className="text-muted-foreground">
            Adicione itens na aba Layout para gerar o detalhamento técnico.
          </p>
        </motion.div>
      )}
    </div>
  );
}
