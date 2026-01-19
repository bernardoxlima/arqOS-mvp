import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  FileDown, 
  Presentation,
  ShoppingCart,
  Calculator,
  CheckCircle,
  Circle,
  Loader2,
  Eye
} from "lucide-react";
import { BudgetItem } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";
import { SlidePreview } from "@/components/SlidePreview";
import { generatePresentation } from "@/utils/generatePresentation";
import { generateShoppingListPPT } from "@/utils/generateShoppingListPPT";
import { generateBudgetPPT } from "@/utils/generateBudgetPPT";
import { useToast } from "@/hooks/use-toast";

interface TabExportarProps {
  data: StoredPresentationData;
}

interface ExportSection {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isReady: boolean;
  count?: number;
}

export function TabExportar({ data }: TabExportarProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "apresentacao",
    "shopping",
    "orcamento"
  ]);

  const allItems = useMemo(() => {
    return [...data.floorPlanLayout.items, ...data.complementaryItems.items];
  }, [data.floorPlanLayout.items, data.complementaryItems.items]);

  const itemsWithPrice = allItems.filter(i => (i.valorProduto || 0) > 0);

  const sections: ExportSection[] = [
    {
      id: "apresentacao",
      label: "Apresentação do Projeto",
      description: "Capa, dados do cliente, fotos antes, moodboard, referências e renders",
      icon: Presentation,
      isReady: data.projectName.trim().length > 0 && (data.images.renders?.length || 0) > 0,
      count: (data.images.renders?.length || 0) + (data.images.photosBefore?.length || 0) + 
             (data.images.moodboard?.length || 0) + (data.images.references?.length || 0),
    },
    {
      id: "shopping",
      label: "Lista de Compras",
      description: "Itens organizados por ambiente com fotos e links",
      icon: ShoppingCart,
      isReady: allItems.length > 0,
      count: allItems.length,
    },
    {
      id: "orcamento",
      label: "Orçamento Detalhado",
      description: "Valores por categoria, resumo e totais",
      icon: Calculator,
      isReady: itemsWithPrice.length > 0,
      count: itemsWithPrice.length,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const canExport = selectedSections.some(id => 
    sections.find(s => s.id === id)?.isReady
  );

  const handleGenerateComplete = async () => {
    if (!canExport) return;

    setIsGenerating(true);

    try {
      // Generate selected sections
      if (selectedSections.includes("apresentacao") && sections[0].isReady) {
        await generatePresentation({
          projectName: data.projectName.trim(),
          projectPhase: data.projectPhase,
          clientData: data.clientData,
          photosBefore: data.images.photosBefore || [],
          moodboard: data.images.moodboard || [],
          references: data.images.references || [],
          floorPlan: [],
          floorPlanLayout: data.floorPlanLayout,
          complementaryItems: data.complementaryItems,
          renders: data.images.renders || [],
        });
      }

      if (selectedSections.includes("shopping") && sections[1].isReady) {
        await generateShoppingListPPT({
          projectName: data.projectName || "Projeto",
          items: allItems,
        });
      }

      if (selectedSections.includes("orcamento") && sections[2].isReady) {
        // Prepare budget items - convert FloorPlanItem to BudgetItem format
        const budgetItems: BudgetItem[] = allItems.map((item, index) => ({
          ...item,
          id: `item-${item.number}`,
          descricao: item.name,
          quantidade: item.quantidade || 1,
          unidade: (item.unidade as BudgetItem['unidade']) || 'Qt.',
          fornecedor: item.fornecedor || '',
          valorProduto: item.valorProduto || 0,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          valorCompleto: item.valorProduto || 0,
        }));

        await generateBudgetPPT({
          projectName: data.projectName || "Projeto",
          clientName: data.clientData.clientName || "Cliente",
          address: data.clientData.address,
          items: allItems,
          budgetItems,
        });
      }

      toast({
        title: "Arquivos gerados com sucesso!",
        description: `${selectedSections.length} arquivo(s) PPT foram baixados.`,
      });
    } catch (error) {
      console.error("Error generating files:", error);
      toast({
        title: "Erro ao gerar arquivos",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate project completeness
  const completenessChecks = [
    { label: "Nome do projeto", done: data.projectName.trim().length > 0 },
    { label: "Dados do cliente", done: !!data.clientData.clientName },
    { label: "Fotos antes", done: (data.images.photosBefore?.length || 0) > 0 },
    { label: "Moodboard", done: (data.images.moodboard?.length || 0) > 0 },
    { label: "Referências", done: (data.images.references?.length || 0) > 0 },
    { label: "Renders", done: (data.images.renders?.length || 0) > 0 },
    { label: "Itens do layout", done: allItems.length > 0 },
    { label: "Preços definidos", done: itemsWithPrice.length > 0 },
  ];

  const completenessPercent = Math.round(
    (completenessChecks.filter(c => c.done).length / completenessChecks.length) * 100
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Completeness Overview */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Completude do Projeto</h2>
            <p className="text-sm text-muted-foreground">
              Verifique se todas as etapas estão completas antes de exportar
            </p>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {completenessPercent}%
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completenessPercent}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full rounded-full ${
              completenessPercent === 100 ? "bg-emerald-500" : 
              completenessPercent >= 70 ? "bg-amber-500" : "bg-red-500"
            }`}
          />
        </div>
        
        {/* Checklist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {completenessChecks.map((check, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              {check.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={check.done ? "text-foreground" : "text-muted-foreground"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Selecione o que deseja exportar
        </h2>
        
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isSelected = selectedSections.includes(section.id);
            
            return (
              <div
                key={section.id}
                className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-muted-foreground"
                } ${!section.isReady ? "opacity-50" : ""}`}
                onClick={() => section.isReady && toggleSection(section.id)}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isSelected}
                    disabled={!section.isReady}
                    onCheckedChange={() => section.isReady && toggleSection(section.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-foreground" />
                      <h3 className="font-medium text-foreground">{section.label}</h3>
                      {section.count !== undefined && section.count > 0 && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {section.count} itens
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                    {!section.isReady && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Seção incompleta - adicione os dados necessários
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Export Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Preview Button */}
        <Button
          size="lg"
          variant="outline"
          className="w-full h-14"
          disabled={!sections[0].isReady}
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-5 h-5 mr-2" />
          Pré-visualizar Slides
        </Button>

        {/* Generate Button */}
        <Button
          size="lg"
          className="w-full h-16 bg-foreground text-background hover:bg-foreground/90 text-lg font-semibold uppercase tracking-wider"
          disabled={!canExport || isGenerating}
          onClick={handleGenerateComplete}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando arquivos...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5 mr-2" />
              Gerar {selectedSections.length} Arquivo(s) PPT
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Os arquivos serão baixados automaticamente no formato PowerPoint (3:2)
        </p>
      </motion.div>

      {/* Slide Preview Modal */}
      <SlidePreview
        open={showPreview}
        onOpenChange={setShowPreview}
        data={{
          projectName: data.projectName.trim(),
          projectPhase: data.projectPhase,
          clientData: data.clientData,
          photosBefore: data.images.photosBefore || [],
          moodboard: data.images.moodboard || [],
          references: data.images.references || [],
          floorPlan: [],
          floorPlanLayout: data.floorPlanLayout,
          complementaryItems: data.complementaryItems,
          renders: data.images.renders || [],
        }}
        onConfirm={async () => {
          await handleGenerateComplete();
          setShowPreview(false);
        }}
        isGenerating={isGenerating}
      />
    </div>
  );
}
