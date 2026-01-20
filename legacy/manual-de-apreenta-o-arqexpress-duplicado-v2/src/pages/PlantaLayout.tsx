import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, CheckCircle, Trash2, Eye, Layers } from "lucide-react";
import { Header } from "@/components/Header";
import { FloorPlanLayout } from "@/components/FloorPlanLayout";
import { ComplementaryItems } from "@/components/ComplementaryItems";
import { LayoutSlidePreview } from "@/components/LayoutSlidePreview";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FloorPlanLayoutData, ComplementaryItemsData } from "@/types/presentation";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { organizeAndNumberItems } from "@/utils/categoryDetection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PlantaLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoaded, setFloorPlanLayout, setComplementaryItems } = usePresentationStorage();
  
  const [localFloorPlan, setLocalFloorPlan] = useState<FloorPlanLayoutData>({
    originalImage: null,
    items: [],
  });
  const [localComplementary, setLocalComplementary] = useState<ComplementaryItemsData>({
    items: [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load data when storage is ready
  useEffect(() => {
    if (isLoaded) {
      setLocalFloorPlan(data.floorPlanLayout);
      setLocalComplementary(data.complementaryItems);
    }
  }, [isLoaded, data.floorPlanLayout, data.complementaryItems]);

  const handleFloorPlanChange = (newData: FloorPlanLayoutData) => {
    setLocalFloorPlan(newData);
    setHasChanges(true);
  };

  const handleComplementaryChange = (items: ComplementaryItemsData['items']) => {
    setLocalComplementary({ items });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Organizar itens por categoria e renumerar sequencialmente
    const organizedLayoutItems = organizeAndNumberItems(localFloorPlan.items);
    const layoutCount = organizedLayoutItems.length;
    
    // Organizar itens complementares e continuar numeração
    const organizedComplementaryItems = organizeAndNumberItems(localComplementary.items).map((item, index) => ({
      ...item,
      number: layoutCount + index + 1,
    }));
    
    const organizedFloorPlan = {
      ...localFloorPlan,
      items: organizedLayoutItems,
    };
    
    const organizedComplementary = {
      items: organizedComplementaryItems,
    };
    
    // Atualizar state local com itens organizados
    setLocalFloorPlan(organizedFloorPlan);
    setLocalComplementary(organizedComplementary);
    
    // Salvar no storage
    setFloorPlanLayout(organizedFloorPlan);
    setComplementaryItems(organizedComplementary);
    setHasChanges(false);
    
    toast({
      title: "Dados salvos e organizados!",
      description: `${layoutCount + organizedComplementaryItems.length} itens organizados por categoria e numerados sequencialmente.`,
    });
  };

  const handleSaveAndContinue = () => {
    handleSave();
    navigate('/');
  };

  const handleClearAll = () => {
    setLocalFloorPlan({
      originalImage: null,
      items: [],
    });
    setLocalComplementary({
      items: [],
    });
    setFloorPlanLayout({
      originalImage: null,
      items: [],
    });
    setComplementaryItems({
      items: [],
    });
    setHasChanges(false);
    toast({
      title: "Dados limpos!",
      description: "Todos os itens foram removidos. Você pode começar um novo projeto.",
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const totalItems = localFloorPlan.items.length + localComplementary.items.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header with navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para Apresentação</span>
          </button>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Alterações não salvas
              </span>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover todos os itens do layout e itens complementares. 
                    A planta baixa também será removida. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-4"
        >
          <h1 className="text-2xl font-bold text-foreground uppercase tracking-wide">
            Layout de Projeto
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Configure os itens do projeto separados por categoria e ambiente
          </p>
        </motion.div>

        {/* Project Info */}
        {data.projectName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-muted/50 border border-border p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Projeto</p>
                <p className="font-medium text-foreground">{data.projectName}</p>
              </div>
              {data.clientData.clientName && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase">Cliente</p>
                  <p className="font-medium text-foreground">{data.clientData.clientName}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Floor Plan Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloorPlanLayout
            originalImage={localFloorPlan.originalImage}
            items={localFloorPlan.items}
            onDataChange={handleFloorPlanChange}
          />
        </motion.div>

        {/* Complementary Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ComplementaryItems
            items={localComplementary.items}
            startingNumber={localFloorPlan.items.length + 1}
            onDataChange={handleComplementaryChange}
          />
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="border border-border p-4 text-center">
            <div className="text-2xl font-light text-foreground font-mono">
              {localFloorPlan.items.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Itens Layout
            </div>
          </div>
          <div className="border border-border p-4 text-center">
            <div className="text-2xl font-light text-foreground font-mono">
              {localComplementary.items.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Itens Complementares
            </div>
          </div>
          <div className="border border-border p-4 text-center">
            <div className="text-2xl font-light text-foreground font-mono">
              {totalItems}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              Total de Itens
            </div>
          </div>
        </motion.div>

        {/* Preview Button - Always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="w-5 h-5 mr-2" />
            Pré-visualizar Slide do Layout
            {(!localFloorPlan.originalImage || localFloorPlan.items.length === 0) && (
              <span className="ml-2 text-xs opacity-70">(demonstração)</span>
            )}
          </Button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-12"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Alterações
          </Button>
          
          <Button
            size="lg"
            className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90"
            onClick={handleSaveAndContinue}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Salvar e Voltar
          </Button>
        </motion.div>

        {/* Layout Slide Preview Modal */}
        <LayoutSlidePreview
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          floorPlanImage={localFloorPlan.originalImage}
          items={localFloorPlan.items}
          projectName={data.projectName}
        />

        {/* Last saved info */}
        {data.lastSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground"
          >
            Último salvamento: {new Date(data.lastSaved).toLocaleString('pt-BR')}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PlantaLayout;
