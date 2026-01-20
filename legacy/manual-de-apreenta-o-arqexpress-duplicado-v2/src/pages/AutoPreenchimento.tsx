import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wand2, Check, Plus, X, ArrowRight, Upload, Loader2, Image, FileText, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { AMBIENTES, LAYOUT_BASE, COMPLEMENTARY_BASE, AmbienteId } from "@/data/ambientesBase";
import { ItemCategory, LAYOUT_CATEGORIES, COMPLEMENTARY_CATEGORIES } from "@/types/presentation";
import { detectCategory } from "@/utils/categoryDetection";
import { supabase } from "@/integrations/supabase/client";
import { DuplicateAnalysis } from "@/components/DuplicateAnalysis";
interface GeneratedItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  selected: boolean;
  isLayout: boolean;
  isExtra?: boolean;
}

const AutoPreenchimento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, setFloorPlanAndComplementary } = usePresentationStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteId[]>([]);
  const [extras, setExtras] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  
  // Upload da planta
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string[]>([]);
  
  // Lista manual da arquiteta
  const [manualList, setManualList] = useState("");
  const [useManualMode, setUseManualMode] = useState(false);

  const toggleAmbiente = (id: AmbienteId) => {
    setSelectedAmbientes(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id) 
        : [...prev, id]
    );
  };

  // Função para upload e análise da planta
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      
      // Analisar com IA
      await analyzeFloorPlan(base64);
    };
    reader.readAsDataURL(file);
  };

  // Limpar todos os dados da análise anterior
  const clearAnalysisData = useCallback(() => {
    setSelectedAmbientes([]);
    setExtras("");
    setShowExtras(false);
    setAnalysisResult([]);
    setGeneratedItems([]);
  }, []);

  const analyzeFloorPlan = async (imageBase64: string, isReanalyze = false) => {
    setIsAnalyzing(true);
    
    // IMPORTANTE: Limpar dados anteriores antes de nova análise
    if (!isReanalyze) {
      clearAnalysisData();
    } else {
      // Re-análise: limpar apenas resultados, manter seleções manuais do usuário
      setAnalysisResult([]);
    }

    try {
      const { data: result, error } = await supabase.functions.invoke('extract-product-info', {
        body: { imageBase64, mode: 'floor-plan' }
      });

      if (error) throw error;

      if (result?.ambientes && Array.isArray(result.ambientes)) {
        // Mapear ambientes detectados para IDs conhecidos
        const detectedAmbientes: AmbienteId[] = [];
        const unmatchedAmbientes: string[] = [];

        result.ambientes.forEach((amb: string) => {
          const normalizedAmb = amb.toUpperCase().trim()
            .replace(/\s+/g, ' '); // Normaliza espaços
          
          // MELHOR MATCHING: Prioriza match exato, depois parcial com regras
          const match = AMBIENTES.find(a => {
            const ambienteNome = a.nome.toUpperCase();
            
            // Match exato
            if (normalizedAmb === ambienteNome) return true;
            
            // Match específico para quartos (evitar confundir casal/solteiro/bebê/infantil)
            if (normalizedAmb.includes('QUARTO') || ambienteNome.includes('QUARTO')) {
              const tiposQuarto = ['CASAL', 'SOLTEIRO', 'BEBÊ', 'BEBE', 'INFANTIL'];
              const tipoDetectado = tiposQuarto.find(t => normalizedAmb.includes(t));
              const tipoAmbiente = tiposQuarto.find(t => ambienteNome.includes(t));
              
              if (tipoDetectado && tipoAmbiente) {
                // Trata BEBÊ e BEBE como equivalentes
                const normTipo = (t: string) => t.replace('BEBÊ', 'BEBE');
                return normTipo(tipoDetectado) === normTipo(tipoAmbiente);
              }
              
              // Se IA retornou "QUARTO" genérico (sem tipo), mapeia para QUARTO DE CASAL como fallback
              if (!tipoDetectado && tipoAmbiente === 'CASAL') {
                return true;
              }
              
              // Se um tem tipo específico e outro não, não faz match
              if (tipoDetectado || tipoAmbiente) return false;
            }
            
            // Match para sala de estar/jantar (evitar confundir)
            if (normalizedAmb.includes('SALA') || ambienteNome.includes('SALA')) {
              const temEstarDetectado = normalizedAmb.includes('ESTAR');
              const temJantarDetectado = normalizedAmb.includes('JANTAR');
              const temEstarAmbiente = ambienteNome.includes('ESTAR');
              const temJantarAmbiente = ambienteNome.includes('JANTAR');
              
              // Sala de Estar e Jantar (integrada)
              if (temEstarDetectado && temJantarDetectado && temEstarAmbiente && temJantarAmbiente) {
                return true;
              }
              // Só Sala de Estar
              if (temEstarDetectado && !temJantarDetectado && temEstarAmbiente && !temJantarAmbiente) {
                return true;
              }
              // Só Sala de Jantar
              if (temJantarDetectado && !temEstarDetectado && temJantarAmbiente && !temEstarAmbiente) {
                return true;
              }
              // Living/Sala genérica -> Sala de Estar e Jantar
              if (!temEstarDetectado && !temJantarDetectado && (normalizedAmb.includes('LIVING') || normalizedAmb === 'SALA')) {
                return ambienteNome.includes('ESTAR') && ambienteNome.includes('JANTAR');
              }
              return false;
            }
            
            // Match parcial para outros ambientes (cozinha, banheiro, etc.)
            return normalizedAmb.includes(ambienteNome) || ambienteNome.includes(normalizedAmb);
          });
          
          if (match && !detectedAmbientes.includes(match.id)) {
            detectedAmbientes.push(match.id);
          } else if (!match) {
            unmatchedAmbientes.push(amb);
          }
        });

        // SUBSTITUIR seleção (não acumular)
        setSelectedAmbientes(detectedAmbientes);
        setAnalysisResult(result.ambientes);

        toast({
          title: "Planta analisada com sucesso!",
          description: `${detectedAmbientes.length} ambiente(s) identificado(s)${unmatchedAmbientes.length > 0 ? `. Não mapeados: ${unmatchedAmbientes.join(', ')}` : ''}`,
        });

        // Se tiver itens extras detectados, SUBSTITUIR (não acumular)
        if (result.extras && Array.isArray(result.extras) && result.extras.length > 0) {
          const extrasText = result.extras.join('\n');
          setExtras(extrasText);
          setShowExtras(true);
        }
      } else {
        toast({
          title: "Nenhum ambiente identificado",
          description: "Tente selecionar manualmente os ambientes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao analisar planta:", error);
      toast({
        title: "Erro ao analisar planta",
        description: "Não foi possível processar a imagem. Selecione os ambientes manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mapeamento de categorias da IA para categorias do sistema
  const mapAICategory = (aiCategory: string): { category: ItemCategory; isLayout: boolean } => {
    const categoryMap: Record<string, { category: ItemCategory; isLayout: boolean }> = {
      'MOBILIARIO': { category: 'mobiliario', isLayout: true },
      'DECORACAO': { category: 'decoracao', isLayout: true },
      'ILUMINACAO': { category: 'iluminacao', isLayout: true },
      'CORTINAS': { category: 'cortinas', isLayout: true },
      'MARCENARIA': { category: 'marcenaria', isLayout: true },
      'MARMORARIA': { category: 'marmoraria', isLayout: true },
      'MATERIAIS': { category: 'materiais', isLayout: false },
      'MAO_DE_OBRA': { category: 'maoDeObra', isLayout: false },
      'ELETRICA': { category: 'eletrica', isLayout: false },
      'HIDRAULICA': { category: 'hidraulica', isLayout: false },
      'ACABAMENTOS': { category: 'acabamentos', isLayout: false },
      'OUTROS': { category: 'outros', isLayout: false },
    };
    
    const mapped = categoryMap[aiCategory.toUpperCase()];
    if (mapped) return mapped;
    
    // Fallback: tenta detectar pelo nome
    return { category: 'outros', isLayout: false };
  };

  // Gerar itens a partir da descrição usando IA
  const generateFromManualList = useCallback(async () => {
    if (!manualList.trim()) {
      toast({
        title: "Descrição vazia",
        description: "Descreva o que será feito no ambiente",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Chama a IA para interpretar a descrição
      const { data: result, error } = await supabase.functions.invoke('parse-project-description', {
        body: { 
          description: manualList,
          ambiente: selectedAmbientes.length === 1 
            ? AMBIENTES.find(a => a.id === selectedAmbientes[0])?.nome 
            : undefined
        }
      });

      if (error) throw error;

      if (!result?.success || !result?.itens?.length) {
        toast({
          title: "Nenhum item identificado",
          description: "Tente descrever com mais detalhes o que será feito",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const items: GeneratedItem[] = result.itens.map((item: any, idx: number) => {
        const { category, isLayout } = mapAICategory(item.categoria);
        return {
          id: `ai${idx}`,
          nome: `${item.nome.toUpperCase()} - ${result.ambiente?.toUpperCase() || 'GERAL'}`,
          categoria: category,
          quantidade: item.quantidade || 1,
          selected: true,
          isLayout: isLayout,
          isExtra: false,
        };
      });

      setGeneratedItems(items);
      setIsGenerating(false);
      setStep(2);

      const layoutCount = items.filter(i => i.isLayout).length;
      const compCount = items.filter(i => !i.isLayout).length;

      toast({
        title: "Itens extraídos com sucesso!",
        description: `${layoutCount} itens de layout e ${compCount} itens complementares identificados`,
      });
    } catch (error) {
      console.error("Erro ao processar descrição:", error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível interpretar a descrição. Tente novamente.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  }, [manualList, selectedAmbientes, toast]);

  const generateItems = useCallback(() => {
    if (selectedAmbientes.length === 0) {
      toast({
        title: "Selecione ao menos um ambiente",
        variant: "destructive",
      });
      return;
    }

    const items: GeneratedItem[] = [];
    let itemId = 0;

    // Gera itens de LAYOUT para cada ambiente selecionado
    selectedAmbientes.forEach(ambienteId => {
      const ambienteNome = AMBIENTES.find(a => a.id === ambienteId)?.nome || ambienteId;
      const layoutItems = LAYOUT_BASE[ambienteId] || [];
      
      layoutItems.forEach(item => {
        items.push({
          id: `l${itemId++}`,
          nome: `${item.nome} - ${ambienteNome}`,
          categoria: item.cat,
          quantidade: item.qtd,
          selected: true,
          isLayout: true,
        });
      });

      // Gera itens COMPLEMENTARES para cada ambiente
      const compItems = COMPLEMENTARY_BASE[ambienteId] || [];
      compItems.forEach(item => {
        items.push({
          id: `c${itemId++}`,
          nome: `${item.nome} - ${ambienteNome}`,
          categoria: item.cat,
          quantidade: 1,
          selected: true,
          isLayout: false,
        });
      });
    });

    // Adiciona extras se houver
    if (extras.trim()) {
      const extraLines = extras.split('\n').filter(l => l.trim());
      const ambienteNome = selectedAmbientes.length === 1 
        ? AMBIENTES.find(a => a.id === selectedAmbientes[0])?.nome || ""
        : "Geral";

      extraLines.forEach((line, idx) => {
        // Parse: "2x Luminária" ou "Luminária x2" ou apenas "Luminária"
        const match = line.match(/^(\d+)\s*[x×]?\s*(.+)|(.+?)\s*[x×]\s*(\d+)$/i);
        let nome = line.trim();
        let qtd = 1;
        
        if (match) {
          if (match[1]) {
            qtd = parseInt(match[1]);
            nome = match[2].trim();
          } else if (match[4]) {
            qtd = parseInt(match[4]);
            nome = match[3].trim();
          }
        }

        if (nome.length > 1) {
          // Detecta categoria automaticamente
          const detectionResult = detectCategory(nome.toUpperCase());
          
          items.push({
            id: `e${itemId++}`,
            nome: ambienteNome ? `${nome} - ${ambienteNome}` : nome,
            categoria: detectionResult.category,
            quantidade: qtd,
            selected: true,
            isLayout: true,
            isExtra: true,
          });
        }
      });
    }

    setGeneratedItems(items);
    setStep(2);
  }, [selectedAmbientes, extras, toast]);

  const toggleItem = (id: string) => {
    setGeneratedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setGeneratedItems(prev => prev.filter(item => item.id !== id));
  };

  const mergeItems = (keepId: string, removeIds: string[], totalQty: number) => {
    setGeneratedItems(prev => {
      return prev
        .filter(item => !removeIds.includes(item.id))
        .map(item => item.id === keepId ? { ...item, quantidade: totalQty } : item);
    });
    toast({
      title: "Itens mesclados",
      description: `Quantidade total: ${totalQty}`,
    });
  };

  const selectAll = (type: 'layout' | 'comp', value: boolean) => {
    setGeneratedItems(prev => 
      prev.map(item => 
        (type === 'layout' ? item.isLayout : !item.isLayout) 
          ? { ...item, selected: value } 
          : item
      )
    );
  };

  const applyToProject = () => {
    const selectedItems = generatedItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        variant: "destructive",
      });
      return;
    }

    // Separa itens de layout e complementares
    const layoutItems = selectedItems
      .filter(item => item.isLayout)
      .map((item, idx) => ({
        number: idx + 1,
        name: item.nome.toUpperCase(),
        ambiente: item.nome.split(' - ').pop()?.toUpperCase() || "GERAL",
        category: item.categoria as ItemCategory,
        quantidade: item.quantidade,
        unidade: "un",
        valorProduto: 0,
        fornecedor: "",
        link: "",
        imagem: "",
      }));

    const compItems = selectedItems
      .filter(item => !item.isLayout)
      .map((item, idx) => ({
        number: idx + 1,
        name: item.nome.toUpperCase(),
        ambiente: item.nome.split(' - ').pop()?.toUpperCase() || "GERAL",
        category: item.categoria as ItemCategory,
        quantidade: item.quantidade,
        unidade: "un",
        valorProduto: 0,
        fornecedor: "",
        link: "",
        imagem: "",
      }));

    // Merge com itens existentes
    const existingLayoutItems = data.floorPlanLayout.items || [];
    const existingCompItems = data.complementaryItems.items || [];

    // Salvar layout e complementares juntos para evitar race condition
    const newFloorPlanLayout = {
      originalImage: data.floorPlanLayout.originalImage,
      items: [...existingLayoutItems, ...layoutItems],
    };
    
    const newComplementaryItems = {
      items: [...existingCompItems, ...compItems],
    };

    setFloorPlanAndComplementary(newFloorPlanLayout, newComplementaryItems);

    toast({
      title: "Itens adicionados com sucesso!",
      description: `${layoutItems.length} itens de layout e ${compItems.length} itens complementares foram adicionados.`,
    });

    navigate('/projeto?tab=layout');
  };

  const getCategoryConfig = (catId: string) => {
    return [...LAYOUT_CATEGORIES, ...COMPLEMENTARY_CATEGORIES].find(c => c.id === catId);
  };

  // Helper para separar nome do item e ambiente
  const parseItemName = (fullName: string) => {
    const parts = fullName.split(' - ');
    if (parts.length >= 2) {
      const ambiente = parts.pop() || '';
      const nome = parts.join(' - ');
      return { nome, ambiente };
    }
    return { nome: fullName, ambiente: '' };
  };

  // Verificar se há múltiplos ambientes nos itens
  const getUniqueAmbientes = (items: GeneratedItem[]) => {
    const ambientes = new Set<string>();
    items.forEach(item => {
      const { ambiente } = parseItemName(item.nome);
      if (ambiente) ambientes.add(ambiente);
    });
    return Array.from(ambientes);
  };

  const layoutItemsGenerated = generatedItems.filter(i => i.isLayout);
  const compItemsGenerated = generatedItems.filter(i => !i.isLayout);
  const selectedCount = generatedItems.filter(i => i.selected).length;
  const uniqueAmbientes = getUniqueAmbientes(generatedItems);
  const showAmbienteTag = uniqueAmbientes.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Apresentação
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Wand2 className="w-6 h-6 text-amber-500" />
            Auto-Preenchimento de Itens
          </h1>
          <p className="text-muted-foreground">
            Selecione os ambientes do projeto e gere automaticamente a lista de itens base
          </p>
        </motion.div>

        {/* Step 1: Select Ambientes */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Toggle Mode: IA vs Manual */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setUseManualMode(false)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  !useManualMode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                IA Auto-Preenche
              </button>
              <button
                onClick={() => setUseManualMode(true)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  useManualMode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                Listar Manualmente
              </button>
            </div>

            {/* Modo IA */}
            {!useManualMode && (
              <>
                {/* Upload da Planta - ÁREA PRINCIPAL GRANDE */}
                <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/30 dark:to-orange-950/50 border border-amber-200 dark:border-amber-800 p-8 rounded-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                      <Wand2 className="w-5 h-5 text-amber-600" />
                      Upload da Planta Baixa
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      A IA identificará automaticamente os ambientes e itens do projeto
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {!uploadedImage ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer group"
                    >
                      <div className="w-full h-56 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl bg-white/50 dark:bg-black/20 flex flex-col items-center justify-center gap-4 transition-all group-hover:border-amber-500 group-hover:bg-amber-100/30 dark:group-hover:bg-amber-900/20">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">Arraste ou clique para selecionar</p>
                          <p className="text-sm text-muted-foreground mt-1">JPG, PNG ou WebP - máx 10MB</p>
                        </div>
                      </div>
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-white">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <span className="text-sm font-medium">Analisando com IA...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
                        <img 
                          src={uploadedImage} 
                          alt="Planta" 
                          className="w-full max-h-64 object-contain"
                        />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-white">
                              <Loader2 className="w-10 h-10 animate-spin" />
                              <span className="text-sm font-medium">Analisando com IA...</span>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            clearAnalysisData(); // Limpa TUDO ao remover imagem
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-background/90 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {analysisResult.length > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Ambientes detectados pela IA:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.map((amb, idx) => (
                              <span key={idx} className="px-3 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-full text-sm font-medium">
                                {amb}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => analyzeFloorPlan(uploadedImage, true)}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />}
                          Re-analisar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider OR */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground">ou selecione manualmente</span>
                  </div>
                </div>
              </>
            )}

            {/* Modo Manual - Descrição para IA interpretar */}
            {useManualMode && (
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/30 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 p-8 rounded-xl">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Descreva o Projeto
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Explique o que será feito no ambiente - a IA extrai e organiza todos os itens automaticamente
                  </p>
                </div>

                {/* Seleção de ambiente para contexto */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Ambiente (opcional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AMBIENTES.slice(0, 8).map(ambiente => (
                      <button
                        key={ambiente.id}
                        onClick={() => {
                          if (selectedAmbientes.includes(ambiente.id)) {
                            setSelectedAmbientes([]);
                          } else {
                            setSelectedAmbientes([ambiente.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedAmbientes.includes(ambiente.id)
                            ? "bg-blue-500 text-white"
                            : "bg-white/80 dark:bg-black/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-foreground border border-blue-200 dark:border-blue-700"
                        }`}
                      >
                        {selectedAmbientes.includes(ambiente.id) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {ambiente.nome}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Textarea
                  placeholder="Descreva tudo que será feito no ambiente. Por exemplo:&#10;&#10;Neste quarto de bebê vamos comprar o berço, a cômoda, fazer o armário de marcenaria planejado, instalar cortina blackout, pintar a parede de branco e prender 3 quadros decorativos.&#10;&#10;A IA vai extrair automaticamente:&#10;• Berço, Cômoda (mobiliário)&#10;• Armário planejado (marcenaria)&#10;• Cortina blackout (cortinas)&#10;• Quadros (decoração)&#10;• Tinta branca (materiais)&#10;• Pintura, Instalação cortina, Instalação quadros (mão de obra)"
                  value={manualList}
                  onChange={(e) => setManualList(e.target.value)}
                  className="min-h-[200px] text-sm resize-none bg-white/80 dark:bg-black/30"
                />
                
                <div className="mt-4 p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">🤖 A IA vai identificar:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <div>
                      <p className="font-semibold mb-1">Layout de Projeto:</p>
                      <ul className="space-y-0.5">
                        <li>• Mobiliário (sofás, camas, mesas)</li>
                        <li>• Marcenaria (armários, painéis)</li>
                        <li>• Decoração (quadros, espelhos)</li>
                        <li>• Iluminação e Cortinas</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Complementares:</p>
                      <ul className="space-y-0.5">
                        <li>• Materiais (tintas, papéis)</li>
                        <li>• Mão de obra (pintura, instalação)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ambiente Selection e Extras - Apenas no modo IA */}
            {!useManualMode && (
              <>
                {/* Ambiente Selection - COMPACTO */}
                <div className="bg-card border border-border p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Ambientes do Projeto
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {AMBIENTES.map(ambiente => (
                      <button
                        key={ambiente.id}
                        onClick={() => toggleAmbiente(ambiente.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedAmbientes.includes(ambiente.id)
                            ? "bg-emerald-500 text-white"
                            : "bg-muted hover:bg-muted-foreground/20 text-foreground"
                        }`}
                      >
                        {selectedAmbientes.includes(ambiente.id) && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {ambiente.nome}
                      </button>
                    ))}
                  </div>
                  {selectedAmbientes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {selectedAmbientes.length} ambiente(s) selecionado(s)
                    </p>
                  )}
                </div>

                {/* Extras - CAMPO DE TEXTO AMPLIADO */}
                <div className="bg-card border border-border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Itens Adicionais (Opcional)
                    </h3>
                    <button
                      onClick={() => setShowExtras(!showExtras)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {showExtras ? (
                        <>
                          <X className="w-3 h-3" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Adicionar itens específicos
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showExtras && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Textarea
                        placeholder="Digite itens específicos do projeto, um por linha:&#10;&#10;2x Luminária pendente especial&#10;Mesa de centro oval&#10;Poltrona de leitura&#10;Cortina blackout sob medida"
                        value={extras}
                        onChange={(e) => setExtras(e.target.value)}
                        className="min-h-[140px] text-sm resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Dica: Use "2x Item" ou "Item x3" para indicar quantidade
                      </p>
                    </motion.div>
                  )}
                </div>
              </>
            )}

            {/* Generate Button - Condicional por modo */}
            {useManualMode ? (
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                onClick={generateFromManualList}
                disabled={!manualList.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Extrair e Organizar Itens
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold"
                onClick={generateItems}
                disabled={selectedAmbientes.length === 0}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Gerar Lista de Itens ({selectedAmbientes.length} ambiente{selectedAmbientes.length !== 1 ? 's' : ''})
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 2: Review Items */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Header */}
            <div className="bg-foreground text-background p-4 rounded-lg flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  {selectedAmbientes.map(id => AMBIENTES.find(a => a.id === id)?.nome).join(', ')}
                </h2>
                <p className="text-sm opacity-70">
                  {layoutItemsGenerated.length} layout • {compItemsGenerated.length} complementares
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>

            {/* Duplicate Analysis */}
            <DuplicateAnalysis 
              items={generatedItems}
              onRemoveItem={removeItem}
              onMergeItems={mergeItems}
            />

            {/* Layout Items */}
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  📐 Layout de Projeto
                  <span className="text-sm text-muted-foreground">
                    ({layoutItemsGenerated.filter(i => i.selected).length}/{layoutItemsGenerated.length})
                  </span>
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => selectAll('layout', true)}>
                    Marcar todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAll('layout', false)}>
                    Desmarcar
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {layoutItemsGenerated.map(item => {
                  const catConfig = getCategoryConfig(item.categoria);
                  const { nome, ambiente } = parseItemName(item.nome);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        item.selected
                          ? "bg-emerald-50 dark:bg-emerald-950 border border-emerald-300"
                          : "bg-muted/50 opacity-50"
                      }`}
                    >
                      <Checkbox checked={item.selected} />
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${catConfig?.bgColor} ${catConfig?.textColor}`}>
                        {catConfig?.label}
                      </span>
                      <span className="flex-1 text-sm font-medium">{nome}</span>
                      {showAmbienteTag && ambiente && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded shrink-0">
                          {ambiente}
                        </span>
                      )}
                      {item.isExtra && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded shrink-0">Extra</span>
                      )}
                      <span className="text-sm text-muted-foreground shrink-0">×{item.quantidade}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complementary Items */}
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  🔧 Itens Complementares
                  <span className="text-sm text-muted-foreground">
                    ({compItemsGenerated.filter(i => i.selected).length}/{compItemsGenerated.length})
                  </span>
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => selectAll('comp', true)}>
                    Marcar todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAll('comp', false)}>
                    Desmarcar
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {compItemsGenerated.map(item => {
                  const catConfig = getCategoryConfig(item.categoria);
                  const { nome, ambiente } = parseItemName(item.nome);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        item.selected
                          ? "bg-emerald-50 dark:bg-emerald-950 border border-emerald-300"
                          : "bg-muted/50 opacity-50"
                      }`}
                    >
                      <Checkbox checked={item.selected} />
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${catConfig?.bgColor} ${catConfig?.textColor}`}>
                        {catConfig?.label}
                      </span>
                      <span className="flex-1 text-sm font-medium">{nome}</span>
                      {showAmbienteTag && ambiente && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded shrink-0">
                          {ambiente}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground shrink-0">×{item.quantidade}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">📊 Resumo</h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">Selecionados</p>
                  <p className="text-3xl font-bold">{selectedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Layout</p>
                  <p className="text-3xl font-bold">{layoutItemsGenerated.filter(i => i.selected).length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Complementares</p>
                  <p className="text-3xl font-bold">{compItemsGenerated.filter(i => i.selected).length}</p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
              onClick={applyToProject}
              disabled={selectedCount === 0}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Aplicar {selectedCount} Itens e Continuar para Layout
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AutoPreenchimento;
