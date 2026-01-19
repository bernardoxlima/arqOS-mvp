import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, Download, FileSpreadsheet, Building2, 
  ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Presentation
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { 
  BudgetItem, ObraInfo, SUBCATEGORIAS, UNIDADES, UnidadeType 
} from "@/types/budget";
import { 
  FloorPlanItem, ItemCategory
} from "@/types/presentation";
import { generateBudgetExcel } from "@/utils/generateBudget";
import { generateBudgetPPT } from "@/utils/generateBudgetPPT";

// Storage key for budget-specific data (prices, suppliers, etc.)
const BUDGET_DATA_KEY = 'arqexpress_budget_data';

interface BudgetExtraData {
  [itemKey: string]: {
    fornecedor: string;
    descricao: string;
    quantidade: number;
    unidade: BudgetItem['unidade'];
    valorProduto: number;
    valorInstalacao: number;
    valorFrete: number;
    valorExtras: number;
    link: string;
    subcategoria?: string;
  };
}

// Categorias do orçamento na ordem correta
const CATEGORIAS_ORCAMENTO = [
  { id: 'mobiliario', nome: 'MOBILIÁRIO', cor: '#1E3A5F' },
  { id: 'marcenaria', nome: 'MARCENARIA', cor: '#F59E0B' },
  { id: 'marmoraria', nome: 'MARMORARIA', cor: '#8B4513' },
  { id: 'iluminacao', nome: 'ILUMINAÇÃO', cor: '#F97316' },
  { id: 'decoracao', nome: 'DECORAÇÃO', cor: '#8B5CF6' },
  { id: 'cortinas', nome: 'CORTINAS', cor: '#EC4899' },
  { id: 'materiais', nome: 'MATERIAIS E REVESTIMENTOS', cor: '#10B981' },
  { id: 'eletrica', nome: 'ELÉTRICA', cor: '#EF4444' },
  { id: 'hidraulica', nome: 'HIDRÁULICA', cor: '#3B82F6' },
  { id: 'maoDeObra', nome: 'MÃO DE OBRA', cor: '#6B7280' },
  { id: 'acabamentos', nome: 'ACABAMENTOS', cor: '#A855F7' },
  { id: 'outros', nome: 'OUTROS', cor: '#800020' },
];

const DEFAULT_AMBIENTES = [
  "Sala de Estar",
  "Sala de Jantar",
  "Sala de Estar e Jantar",
  "Cozinha",
  "Quarto Principal",
  "Quarto 1",
  "Quarto 2",
  "Banheiro Social",
  "Banheiro Suíte",
  "Lavanderia",
  "Varanda",
  "Home Office",
  "Hall de Entrada",
  "Área Gourmet",
  "Geral",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

// Generate a unique key for each item based on its properties
const getItemKey = (item: FloorPlanItem) => `${item.category}-${item.number}-${item.name}`;

const Budget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: presentationData, isLoaded, setFloorPlanLayout, setComplementaryItems } = usePresentationStorage();

  // Info da obra
  const [obraInfo, setObraInfo] = useState<ObraInfo>({
    obra: '',
    cliente: '',
    endereco: '',
    cidade: '',
    areaM2: 0,
    valorM2: 0,
  });

  // Budget extra data (prices, suppliers, etc.) - stored separately
  const [budgetExtraData, setBudgetExtraData] = useState<BudgetExtraData>({});
  
  // Controle de UI
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  // Novo item
  const [novoItem, setNovoItem] = useState({
    categoria: 'mobiliario' as ItemCategory,
    subcategoria: '',
    item: '',
    ambiente: '',
    fornecedor: '',
    descricao: '',
    quantidade: 1,
    unidade: 'Qt.' as BudgetItem['unidade'],
    valorProduto: 0,
    valorInstalacao: 0,
    valorFrete: 0,
    valorExtras: 0,
    link: '',
  });

  // Load budget extra data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BUDGET_DATA_KEY);
      if (stored) {
        setBudgetExtraData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  }, []);

  // Save budget extra data to localStorage
  const saveBudgetExtraData = useCallback((data: BudgetExtraData) => {
    setBudgetExtraData(data);
    try {
      localStorage.setItem(BUDGET_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving budget data:', error);
    }
  }, []);

  // Load obra info from presentation data
  useEffect(() => {
    if (isLoaded && presentationData.projectName) {
      setObraInfo(prev => ({
        ...prev,
        obra: presentationData.projectName || prev.obra,
        cliente: presentationData.clientData?.clientName || prev.cliente,
        endereco: presentationData.clientData?.address || prev.endereco,
        cidade: presentationData.clientData?.cepBairro || prev.cidade,
      }));
    }
  }, [isLoaded, presentationData.projectName, presentationData.clientData]);

  // Combine layout items with budget extra data - REACTIVE to presentation changes
  // IMPORTANT: presentationData is the source of truth for basic item info (name, quantity, price, link, etc.)
  // budgetExtraData only stores additional budget-specific fields (installation, freight, extras, subcategory)
  const items: BudgetItem[] = useMemo(() => {
    if (!isLoaded) return [];
    
    const allLayoutItems: FloorPlanItem[] = [
      ...(presentationData.floorPlanLayout?.items || []),
      ...(presentationData.complementaryItems?.items || []),
    ];

    

    return allLayoutItems.map((item) => {
      const key = getItemKey(item);
      const extra = budgetExtraData[key];
      
      // Use values from presentationData FIRST (source of truth), then budget extras for additional fields
      const fornecedor = item.fornecedor || extra?.fornecedor || '';
      const quantidade = item.quantidade || extra?.quantidade || 1;
      const unidade = (item.unidade || extra?.unidade || 'Qt.') as UnidadeType;
      const valorProduto = item.valorProduto || extra?.valorProduto || 0;
      const link = item.link || extra?.link || '';
      
      // These are budget-specific (only in budgetExtraData)
      const valorInstalacao = extra?.valorInstalacao || 0;
      const valorFrete = extra?.valorFrete || 0;
      const valorExtras = extra?.valorExtras || 0;

      const valorCompleto = (valorProduto + valorInstalacao + valorFrete + valorExtras) * quantidade;

      return {
        id: key,
        number: item.number,
        name: item.name,
        ambiente: item.ambiente,
        category: item.category,
        fornecedor,
        descricao: extra?.descricao || '',
        quantidade,
        unidade,
        valorProduto,
        valorInstalacao,
        valorFrete,
        valorExtras,
        valorCompleto,
        link,
        subcategoria: extra?.subcategoria,
        imagem: item.imagem,
      } as BudgetItem;
    });
  }, [isLoaded, presentationData.floorPlanLayout, presentationData.complementaryItems, budgetExtraData]);

  // Toggle categoria expandida
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Calcular valor completo
  const calcularValorCompleto = (item: Partial<BudgetItem>) => {
    const produto = item.valorProduto || 0;
    const instalacao = item.valorInstalacao || 0;
    const frete = item.valorFrete || 0;
    const extras = item.valorExtras || 0;
    const qtd = item.quantidade || 1;
    return (produto + instalacao + frete + extras) * qtd;
  };

  // Atualizar item - syncs with both budgetExtraData AND presentationData
  const atualizarItem = (id: string, updates: Partial<BudgetItem>) => {
    // Update budget-specific extra data
    const newData = { ...budgetExtraData };
    const existing = newData[id] || {
      fornecedor: '',
      descricao: '',
      quantidade: 1,
      unidade: 'Qt.' as const,
      valorProduto: 0,
      valorInstalacao: 0,
      valorFrete: 0,
      valorExtras: 0,
      link: '',
    };

    newData[id] = {
      ...existing,
      fornecedor: updates.fornecedor ?? existing.fornecedor,
      descricao: updates.descricao ?? existing.descricao,
      quantidade: updates.quantidade ?? existing.quantidade,
      unidade: updates.unidade ?? existing.unidade,
      valorProduto: updates.valorProduto ?? existing.valorProduto,
      valorInstalacao: updates.valorInstalacao ?? existing.valorInstalacao,
      valorFrete: updates.valorFrete ?? existing.valorFrete,
      valorExtras: updates.valorExtras ?? existing.valorExtras,
      link: updates.link ?? existing.link,
      subcategoria: updates.subcategoria ?? existing.subcategoria,
    };

    saveBudgetExtraData(newData);

    // ALSO sync shared fields (fornecedor, quantidade, valorProduto, link) back to presentationData
    // so that ShoppingList and other pages see the same data
    const sharedFieldsToSync = ['fornecedor', 'quantidade', 'valorProduto', 'link', 'unidade'];
    const hasSharedUpdate = sharedFieldsToSync.some(f => f in updates);
    
    if (hasSharedUpdate) {
      // Find and update the item in floorPlanLayout or complementaryItems
      const floorPlanItems = presentationData.floorPlanLayout?.items || [];
      const compItems = presentationData.complementaryItems?.items || [];
      
      // Check in floor plan items
      const floorPlanIdx = floorPlanItems.findIndex(item => getItemKey(item) === id);
      if (floorPlanIdx !== -1) {
        const updated = [...floorPlanItems];
        updated[floorPlanIdx] = {
          ...updated[floorPlanIdx],
          ...(updates.fornecedor !== undefined && { fornecedor: updates.fornecedor }),
          ...(updates.quantidade !== undefined && { quantidade: updates.quantidade }),
          ...(updates.valorProduto !== undefined && { valorProduto: updates.valorProduto }),
          ...(updates.link !== undefined && { link: updates.link }),
          ...(updates.unidade !== undefined && { unidade: updates.unidade }),
        };
        setFloorPlanLayout({ ...presentationData.floorPlanLayout, items: updated });
        return;
      }
      
      // Check in complementary items
      const compIdx = compItems.findIndex(item => getItemKey(item) === id);
      if (compIdx !== -1) {
        const updated = [...compItems];
        updated[compIdx] = {
          ...updated[compIdx],
          ...(updates.fornecedor !== undefined && { fornecedor: updates.fornecedor }),
          ...(updates.quantidade !== undefined && { quantidade: updates.quantidade }),
          ...(updates.valorProduto !== undefined && { valorProduto: updates.valorProduto }),
          ...(updates.link !== undefined && { link: updates.link }),
          ...(updates.unidade !== undefined && { unidade: updates.unidade }),
        };
        setComplementaryItems({ items: updated });
      }
    }
  };

  // Agrupar itens por categoria - unknown categories go to 'outros'
  const itensPorCategoria = useMemo(() => {
    const grouped: Record<string, BudgetItem[]> = {};
    const validCategoryIds = CATEGORIAS_ORCAMENTO.map(c => c.id);
    
    CATEGORIAS_ORCAMENTO.forEach(cat => {
      grouped[cat.id] = [];
    });
    
    items.forEach(item => {
      const categoryId = validCategoryIds.includes(item.category) 
        ? item.category 
        : 'outros'; // Fallback for unknown categories
      grouped[categoryId].push(item);
    });
    
    return grouped;
  }, [items]);

  // Calcular totais
  const calcularTotalCategoria = (catId: string) => {
    return itensPorCategoria[catId]?.reduce((sum, item) => sum + item.valorCompleto, 0) || 0;
  };

  const totalGeral = useMemo(() => {
    return items.reduce((sum, item) => sum + item.valorCompleto, 0);
  }, [items]);

  // Calcular valor por m²
  useEffect(() => {
    if (obraInfo.areaM2 > 0 && totalGeral > 0) {
      setObraInfo(prev => ({
        ...prev,
        valorM2: totalGeral / prev.areaM2,
      }));
    }
  }, [totalGeral, obraInfo.areaM2]);

  // State for PPT generation
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);

  // Exportar Excel
  const handleExportExcel = () => {
    if (items.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens no Layout primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const floorPlanItems = items.map(item => ({
        number: item.number,
        name: item.name,
        ambiente: item.ambiente,
        category: item.category,
      }));

      generateBudgetExcel({
        projectName: obraInfo.obra || 'Orçamento',
        clientName: obraInfo.cliente || 'Cliente',
        address: obraInfo.endereco,
        city: obraInfo.cidade,
        areaM2: obraInfo.areaM2,
        items: floorPlanItems,
        budgetItems: items,
      });

      toast({
        title: "Excel gerado!",
        description: "O download iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Exportar PPT
  const handleExportPPT = async () => {
    if (items.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione itens no Layout primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPPT(true);
    
    try {
      const floorPlanItems = items.map(item => ({
        number: item.number,
        name: item.name,
        ambiente: item.ambiente,
        category: item.category,
      }));

      await generateBudgetPPT({
        projectName: obraInfo.obra || 'Orçamento',
        clientName: obraInfo.cliente || 'Cliente',
        address: obraInfo.endereco,
        city: obraInfo.cidade,
        areaM2: obraInfo.areaM2,
        items: floorPlanItems,
        budgetItems: items,
      });

      toast({
        title: "PPT gerado!",
        description: "O download do PowerPoint iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao gerar PPT:", error);
      toast({
        title: "Erro ao exportar PPT",
        description: "Por favor, tente novamente.",
        variant: "destructive",
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

  const totalLayoutItems = (presentationData.floorPlanLayout?.items?.length || 0) + 
                          (presentationData.complementaryItems?.items?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header do Orçamento */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">
                  Sistema de <span className="text-yellow-400">Orçamento</span>
                </h1>
                <p className="text-blue-200 text-sm mt-1">
                  {totalLayoutItems} itens do layout • Sincronizado automaticamente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <p className="text-sm text-blue-200">Total Geral</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(totalGeral)}
                </p>
              </div>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/planta-layout')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Editar Layout
              </Button>
              <Button
                onClick={handleExportExcel}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={handleExportPPT}
                disabled={isGeneratingPPT}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Presentation className="w-4 h-4 mr-2" />
                {isGeneratingPPT ? "Gerando..." : "PPT"}
              </Button>
            </div>
          </div>
        </div>

        {/* Info da Obra */}
        <div className="bg-white p-6 border-x border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={20} /> Informações da Obra
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Nome da Obra"
              value={obraInfo.obra}
              onChange={(e) => setObraInfo({ ...obraInfo, obra: e.target.value })}
            />
            <Input
              placeholder="Cliente"
              value={obraInfo.cliente}
              onChange={(e) => setObraInfo({ ...obraInfo, cliente: e.target.value })}
            />
            <Input
              placeholder="Cidade"
              value={obraInfo.cidade}
              onChange={(e) => setObraInfo({ ...obraInfo, cidade: e.target.value })}
            />
            <Input
              placeholder="Endereço"
              value={obraInfo.endereco}
              onChange={(e) => setObraInfo({ ...obraInfo, endereco: e.target.value })}
              className="md:col-span-2"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Área m²"
                value={obraInfo.areaM2 || ''}
                onChange={(e) => setObraInfo({ ...obraInfo, areaM2: parseFloat(e.target.value) || 0 })}
              />
              <div className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600 whitespace-nowrap">
                {formatCurrency(obraInfo.valorM2)}/m²
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Itens por Categoria */}
        <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden">
          {CATEGORIAS_ORCAMENTO.map(categoria => {
            const catItems = itensPorCategoria[categoria.id] || [];
            const isExpanded = expandedCategories[categoria.id] !== false;
            const totalCat = calcularTotalCategoria(categoria.id);

            if (catItems.length === 0) return null;

            return (
              <div key={categoria.id} className="border-b border-gray-200 last:border-b-0">
                {/* Header da Categoria */}
                <button
                  onClick={() => toggleCategory(categoria.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  style={{ backgroundColor: `${categoria.cor}20` }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="font-semibold text-gray-800">{categoria.nome}</span>
                    <span className="text-sm text-gray-500">({catItems.length} itens)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-800">{formatCurrency(totalCat)}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Itens da Categoria */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left w-10">#</th>
                            <th className="px-4 py-2 text-left">Item</th>
                            <th className="px-4 py-2 text-left">Ambiente</th>
                            <th className="px-4 py-2 text-left">Fornecedor</th>
                            <th className="px-4 py-2 text-center w-16">Qtd.</th>
                            <th className="px-4 py-2 text-right w-24">Produto</th>
                            <th className="px-4 py-2 text-right w-24">Instal.</th>
                            <th className="px-4 py-2 text-right w-24">Frete</th>
                            <th className="px-4 py-2 text-right w-24">Extras</th>
                            <th className="px-4 py-2 text-right w-28 font-bold">Completo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map((item) => (
                            <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <span 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                  style={{ backgroundColor: categoria.cor }}
                                >
                                  {item.number}
                                </span>
                              </td>
                              <td className="px-4 py-2 font-medium text-gray-800">
                                {item.name}
                              </td>
                              <td className="px-4 py-2 text-gray-600 text-xs">
                                {item.ambiente}
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  value={item.fornecedor}
                                  onChange={(e) => atualizarItem(item.id, { fornecedor: e.target.value })}
                                  placeholder="Fornecedor"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => atualizarItem(item.id, { quantidade: parseInt(e.target.value) || 1 })}
                                  className="h-8 text-sm text-center w-16"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.valorProduto || ''}
                                  onChange={(e) => atualizarItem(item.id, { valorProduto: parseFloat(e.target.value) || 0 })}
                                  placeholder="0,00"
                                  className="h-8 text-sm text-right"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.valorInstalacao || ''}
                                  onChange={(e) => atualizarItem(item.id, { valorInstalacao: parseFloat(e.target.value) || 0 })}
                                  placeholder="0,00"
                                  className="h-8 text-sm text-right"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.valorFrete || ''}
                                  onChange={(e) => atualizarItem(item.id, { valorFrete: parseFloat(e.target.value) || 0 })}
                                  placeholder="0,00"
                                  className="h-8 text-sm text-right"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.valorExtras || ''}
                                  onChange={(e) => atualizarItem(item.id, { valorExtras: parseFloat(e.target.value) || 0 })}
                                  placeholder="0,00"
                                  className="h-8 text-sm text-right"
                                />
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-green-600">
                                {formatCurrency(item.valorCompleto)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Total Geral */}
          {items.length > 0 && (
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-lg font-semibold">ORÇAMENTO ESTIMADO TOTAL:</span>
              <span className="text-2xl font-bold">{formatCurrency(totalGeral)}</span>
            </div>
          )}

          {/* Estado vazio */}
          {items.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum item no orçamento</h3>
              <p className="mb-4">Os itens aparecem automaticamente quando você cadastra no Layout</p>
              <Button onClick={() => navigate('/planta-layout')}>
                <Plus size={16} className="mr-2" />
                Ir para Layout de Projeto
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Budget;
