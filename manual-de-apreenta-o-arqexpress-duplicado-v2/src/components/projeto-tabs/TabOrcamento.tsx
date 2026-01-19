import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  FileSpreadsheet, 
  Download,
  Search,
  Edit2,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Ruler
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";
import { FloorPlanItem, ItemCategory } from "@/types/presentation";
import { BudgetItem } from "@/types/budget";
import { generateBudgetExcel } from "@/utils/generateBudget";
import { generateBudgetPPT } from "@/utils/generateBudgetPPT";
import { CATEGORY_ORDER, getCategoryStyle, CATEGORY_DEFINITIONS } from "@/config/categories";

const AMBIENTE_AREAS_KEY = 'arqexpress_ambiente_areas';

interface AmbienteArea {
  [ambiente: string]: number;
}

interface TabOrcamentoProps {
  data: StoredPresentationData;
  setFloorPlanLayout: (layout: StoredPresentationData['floorPlanLayout']) => void;
  setComplementaryItems: (items: StoredPresentationData['complementaryItems']) => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const TabOrcamento = ({ data, setFloorPlanLayout, setComplementaryItems }: TabOrcamentoProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNumber, setEditingNumber] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ valorProduto?: number; quantidade?: number }>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [ambienteAreas, setAmbienteAreas] = useState<AmbienteArea>({});
  const [editingAmbienteArea, setEditingAmbienteArea] = useState<string | null>(null);
  const [tempAreaValue, setTempAreaValue] = useState<string>("");

  // Load ambiente areas from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AMBIENTE_AREAS_KEY);
      if (stored) {
        setAmbienteAreas(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading ambiente areas:', error);
    }
  }, []);

  // Save ambiente areas to localStorage
  const saveAmbienteAreas = useCallback((areas: AmbienteArea) => {
    setAmbienteAreas(areas);
    try {
      localStorage.setItem(AMBIENTE_AREAS_KEY, JSON.stringify(areas));
    } catch (error) {
      console.error('Error saving ambiente areas:', error);
    }
  }, []);

  // Combine and organize all items by CATEGORY first, then renumber sequentially
  const allItems = useMemo(() => {
    const layoutItems = data.floorPlanLayout.items;
    const complementaryItems = data.complementaryItems.items;
    const combined = [...layoutItems, ...complementaryItems];
    
    if (combined.length === 0) return [];
    
    // Sort by category order first, then by ambiente, then by original number
    const sorted = [...combined].sort((a, b) => {
      const catOrderA = CATEGORY_ORDER.indexOf(a.category);
      const catOrderB = CATEGORY_ORDER.indexOf(b.category);
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      
      const ambienteCompare = (a.ambiente || "").localeCompare(b.ambiente || "");
      if (ambienteCompare !== 0) return ambienteCompare;
      
      return a.number - b.number;
    });
    
    // Renumber sequentially to avoid duplicates
    return sorted.map((item, index) => ({
      ...item,
      number: index + 1
    }));
  }, [data.floorPlanLayout.items, data.complementaryItems.items]);

  // Get unique ambientes
  const ambientes = useMemo(() => {
    const set = new Set(allItems.map(item => item.ambiente));
    return Array.from(set).sort();
  }, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ambiente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allItems, searchTerm]);

  // Group items by category
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

  // Calculate totals by category
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredItems.forEach(item => {
      const subtotal = (item.valorProduto || 0) * (item.quantidade || 1);
      totals[item.category] = (totals[item.category] || 0) + subtotal;
    });
    return totals;
  }, [filteredItems]);

  // Calculate totals by ambiente
  const ambienteTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    allItems.forEach(item => {
      const subtotal = (item.valorProduto || 0) * (item.quantidade || 1);
      totals[item.ambiente] = (totals[item.ambiente] || 0) + subtotal;
    });
    return totals;
  }, [allItems]);

  // Calculate value per m² for each ambiente
  const ambienteValorM2 = useMemo(() => {
    const valorM2: Record<string, number> = {};
    ambientes.forEach(ambiente => {
      const area = ambienteAreas[ambiente] || 0;
      const total = ambienteTotals[ambiente] || 0;
      valorM2[ambiente] = area > 0 ? total / area : 0;
    });
    return valorM2;
  }, [ambientes, ambienteAreas, ambienteTotals]);

  // Calculate global totals
  const totalBudget = allItems.reduce((sum, item) => {
    const price = item.valorProduto || 0;
    const qty = item.quantidade || 1;
    return sum + (price * qty);
  }, 0);

  const totalArea = Object.values(ambienteAreas).reduce((sum, area) => sum + area, 0);
  const valorM2Geral = totalArea > 0 ? totalBudget / totalArea : 0;

  const itemsWithPrice = allItems.filter(item => item.valorProduto && item.valorProduto > 0).length;
  const itemsWithoutPrice = allItems.length - itemsWithPrice;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const startEditing = (item: FloorPlanItem) => {
    setEditingNumber(item.number);
    setEditValues({
      valorProduto: item.valorProduto,
      quantidade: item.quantidade,
    });
  };

  const saveEdit = (item: FloorPlanItem) => {
    const isFloorPlanItem = data.floorPlanLayout.items.some(i => i.number === item.number);
    
    if (isFloorPlanItem) {
      const updatedItems = data.floorPlanLayout.items.map(i =>
        i.number === item.number ? { ...i, ...editValues } : i
      );
      setFloorPlanLayout({ ...data.floorPlanLayout, items: updatedItems });
    } else {
      const updatedItems = data.complementaryItems.items.map(i =>
        i.number === item.number ? { ...i, ...editValues } : i
      );
      setComplementaryItems({ ...data.complementaryItems, items: updatedItems });
    }
    
    setEditingNumber(null);
    setEditValues({});
    toast({ title: "Preço atualizado!" });
  };

  const cancelEdit = () => {
    setEditingNumber(null);
    setEditValues({});
  };

  const startEditingArea = (ambiente: string) => {
    setEditingAmbienteArea(ambiente);
    setTempAreaValue(String(ambienteAreas[ambiente] || ""));
  };

  const saveAmbienteArea = (ambiente: string) => {
    const area = parseFloat(tempAreaValue) || 0;
    saveAmbienteAreas({ ...ambienteAreas, [ambiente]: area });
    setEditingAmbienteArea(null);
    setTempAreaValue("");
    toast({ title: "Área atualizada!" });
  };

  const cancelEditingArea = () => {
    setEditingAmbienteArea(null);
    setTempAreaValue("");
  };

  // Convert FloorPlanItem to BudgetItem format
  const convertToBudgetItems = (): BudgetItem[] => {
    return allItems.map(item => ({
      ...item,
      id: String(item.number),
      fornecedor: item.fornecedor || "",
      descricao: "",
      quantidade: item.quantidade || 1,
      unidade: (item.unidade || "Qt.") as BudgetItem['unidade'],
      valorProduto: item.valorProduto || 0,
      valorInstalacao: 0,
      valorFrete: 0,
      valorExtras: 0,
      valorCompleto: (item.valorProduto || 0) * (item.quantidade || 1),
      link: item.link || "",
      imagem: item.imagem || ""
    }));
  };

  const handleGenerateExcel = () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens na aba Layout primeiro.",
        variant: "destructive"
      });
      return;
    }

    const budgetItems = convertToBudgetItems();

    generateBudgetExcel({
      projectName: data.projectName || "Projeto",
      clientName: data.clientData.clientName || "",
      clientData: data.clientData,
      items: allItems,
      budgetItems
    });
    
    toast({
      title: "Excel gerado!",
      description: "O arquivo de orçamento foi baixado."
    });
  };

  const handleGeneratePPT = async () => {
    if (allItems.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens na aba Layout primeiro.",
        variant: "destructive"
      });
      return;
    }

    const budgetItems = convertToBudgetItems();

    await generateBudgetPPT({
      projectName: data.projectName || "Projeto",
      clientName: data.clientData.clientName || "",
      items: allItems,
      budgetItems
    });
    
    toast({
      title: "PPT de orçamento gerado!",
      description: "O arquivo foi baixado."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total do Orçamento</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Ruler className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor por m²</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(valorM2Geral)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Preço</p>
                <p className="text-2xl font-bold">{itemsWithPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sem Preço</p>
                <p className="text-2xl font-bold">{itemsWithoutPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{allItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área por Ambiente */}
      {ambientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Área por Ambiente (m²)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ambientes.map(ambiente => {
                const total = ambienteTotals[ambiente] || 0;
                const area = ambienteAreas[ambiente] || 0;
                const valorM2 = ambienteValorM2[ambiente] || 0;
                
                return (
                  <div key={ambiente} className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{ambiente}</span>
                      {editingAmbienteArea === ambiente ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={tempAreaValue}
                            onChange={(e) => setTempAreaValue(e.target.value)}
                            className="w-20 h-7 text-sm text-right"
                            placeholder="m²"
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveAmbienteArea(ambiente)}>
                            <Check className="w-3 h-3 text-green-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEditingArea}>
                            <X className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {area > 0 ? `${area} m²` : "Definir área"}
                          </span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditingArea(ambiente)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Total: {formatCurrency(total)}</span>
                      {area > 0 && <span className="font-medium text-primary">{formatCurrency(valorM2)}/m²</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exportar Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleGenerateExcel} className="gap-2">
            <Download className="w-4 h-4" />
            Baixar Excel (.xlsx)
          </Button>
          <Button onClick={handleGeneratePPT} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar PPT Orçamento
          </Button>
        </CardContent>
      </Card>

      {/* Items List by Category */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens do Orçamento por Categoria</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item encontrado.</p>
              <p className="text-sm">Adicione itens na aba Layout.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {CATEGORY_ORDER.map(categoryId => {
                const categoryItems = groupedByCategory[categoryId];
                if (!categoryItems || categoryItems.length === 0) return null;
                
                const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === categoryId);
                const catStyle = getCategoryStyle(categoryId);
                const categoryTotal = categoryTotals[categoryId] || 0;
                const isExpanded = expandedCategories[categoryId] !== false;
                
                return (
                  <div key={categoryId} className="border rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className={`w-full px-4 py-3 flex items-center justify-between ${catStyle.bgColor} ${catStyle.textColor} hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm uppercase">{categoryDef?.label || categoryId}</span>
                        <span className="text-xs opacity-75">({categoryItems.length} itens)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">{formatCurrency(categoryTotal)}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Category Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-2 text-left w-12">#</th>
                                <th className="px-4 py-2 text-left w-12">Img</th>
                                <th className="px-4 py-2 text-left">Item</th>
                                <th className="px-4 py-2 text-left">Ambiente</th>
                                <th className="px-4 py-2 text-center w-16">Qtd</th>
                                <th className="px-4 py-2 text-right w-28">Preço Unit.</th>
                                <th className="px-4 py-2 text-right w-28">Subtotal</th>
                                <th className="px-4 py-2 text-center w-16">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {categoryItems.map((item) => {
                                const subtotal = (item.valorProduto || 0) * (item.quantidade || 1);
                                const uniqueKey = `${item.number}-${item.name}-${categoryId}`;
                                
                                return (
                                  <tr key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                    {/* Number with category color */}
                                    <td className="px-4 py-3">
                                      <span className={`min-w-7 h-7 px-1.5 rounded-full flex items-center justify-center font-bold ${catStyle.bgColor} ${catStyle.textColor} ${String(item.number).length >= 2 ? 'text-[10px]' : 'text-xs'}`}>
                                        {item.number}
                                      </span>
                                    </td>

                                    {/* Image */}
                                    <td className="px-4 py-3">
                                      {item.imagem ? (
                                        <img
                                          src={item.imagem}
                                          alt={item.name}
                                          className="w-10 h-10 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                          <Calculator className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                      )}
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-3">
                                      <p className="font-medium text-sm">{item.name}</p>
                                      {item.fornecedor && (
                                        <p className="text-xs text-muted-foreground">{item.fornecedor}</p>
                                      )}
                                    </td>

                                    {/* Ambiente */}
                                    <td className="px-4 py-3">
                                      <Badge variant="outline" className="text-xs">
                                        {item.ambiente || "Geral"}
                                      </Badge>
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-4 py-3 text-center">
                                      {editingNumber === item.number ? (
                                        <Input
                                          type="number"
                                          min="1"
                                          value={editValues.quantidade || 1}
                                          onChange={(e) => setEditValues({ ...editValues, quantidade: parseInt(e.target.value) || 1 })}
                                          className="w-16 h-8 text-center mx-auto"
                                        />
                                      ) : (
                                        <span>{item.quantidade || 1}</span>
                                      )}
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-3 text-right">
                                      {editingNumber === item.number ? (
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={editValues.valorProduto || 0}
                                          onChange={(e) => setEditValues({ ...editValues, valorProduto: parseFloat(e.target.value) || 0 })}
                                          className="w-28 h-8 text-right ml-auto"
                                        />
                                      ) : (
                                        <span className={!item.valorProduto ? "text-orange-500" : ""}>
                                          {item.valorProduto
                                            ? formatCurrency(item.valorProduto)
                                            : "Sem preço"}
                                        </span>
                                      )}
                                    </td>

                                    {/* Subtotal */}
                                    <td className="px-4 py-3 text-right font-medium">
                                      {formatCurrency(subtotal)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                      <div className="flex justify-center gap-1">
                                        {editingNumber === item.number ? (
                                          <>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEdit(item)}>
                                              <Check className="w-4 h-4 text-green-500" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                              <X className="w-4 h-4 text-red-500" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditing(item)}>
                                            <Edit2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Total */}
              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-4 flex justify-between items-center mt-4">
                <div>
                  <span className="font-semibold">ORÇAMENTO ESTIMADO TOTAL</span>
                  {totalArea > 0 && (
                    <span className="ml-4 text-sm opacity-80">
                      ({totalArea.toFixed(2)} m² • {formatCurrency(valorM2Geral)}/m²)
                    </span>
                  )}
                </div>
                <span className="font-bold text-xl">
                  {formatCurrency(totalBudget)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
