import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, FileSpreadsheet, Calculator, MapPin, ShoppingBag, Wand2, Archive, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { SlidePreview } from "@/components/SlidePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { ImageData, SectionConfig, ClientData } from "@/types/presentation";
import { generatePresentation } from "@/utils/generatePresentation";
import { generateBudgetExcel } from "@/utils/generateBudget";
import logoArqexpress from "@/assets/logo-arqexpress.png";
import { ProjectArchiveModal, ArchivedProject, archiveCurrentProject } from "@/components/ProjectArchiveModal";
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

const SECTIONS: SectionConfig[] = [
  {
    id: "photosBefore",
    title: "Fotos Antes",
    subtitle: "Estado atual do ambiente (máximo 4 fotos)",
    icon: "📸",
    maxFiles: 4,
  },
  {
    id: "moodboard",
    title: "Moodboard",
    subtitle: "Paleta de cores e conceito (1 imagem)",
    icon: "🎨",
    maxFiles: 1,
  },
  {
    id: "references",
    title: "Referências",
    subtitle: "Inspirações e estilos similares (máximo 6)",
    icon: "🖼️",
    maxFiles: 6,
  },
  {
    id: "floorPlan",
    title: "Planta Baixa",
    subtitle: "Planta do ambiente sem marcações (1 imagem)",
    icon: "📐",
    maxFiles: 1,
  },
  {
    id: "renders",
    title: "Renders 3D",
    subtitle: "Visualizações do projeto (máximo 10, mínimo 1 obrigatório)",
    icon: "🏠",
    maxFiles: 10,
    required: true,
  },
];

const PROJECT_PHASES = [
  "Apresentação de Projeto",
  "Revisão de Projeto",
  "Manual de Detalhamento",
  "Entrega Final",
];

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  // Use persistent storage
  const {
    data,
    isLoaded,
    clearData,
    setProjectName,
    setProjectPhase,
    setClientData,
    updateImages,
  } = usePresentationStorage();

  const handleArchiveAndNew = () => {
    // Archive first
    archiveCurrentProject();
    
    // Clear localStorage completely
    localStorage.removeItem('arqexpress_presentation_data');
    
    setShowArchiveModal(false);
    
    toast({
      title: "Novo projeto iniciado! 🎉",
      description: "O projeto anterior foi arquivado no histórico.",
    });
    
    // Force full page reload to ensure completely fresh state
    window.location.reload();
  };

  const handleRestoreProject = (project: ArchivedProject) => {
    // Restore the project data from archive
    try {
      localStorage.setItem('arqexpress_presentation_data', JSON.stringify(project.data));
      window.location.reload();
    } catch (error) {
      console.error('Error restoring project:', error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleClearLayout = () => {
    // Clear layout data via localStorage directly and reload
    try {
      const stored = localStorage.getItem('arqexpress_presentation_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.floorPlanLayout = { originalImage: null, items: [] };
        parsed.complementaryItems = { items: [] };
        parsed.lastSaved = new Date().toISOString();
        localStorage.setItem('arqexpress_presentation_data', JSON.stringify(parsed));
        
        toast({
          title: "Layout limpo!",
          description: "Todos os itens do layout foram removidos.",
        });
        
        // Reload to update state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing layout:', error);
      toast({
        title: "Erro ao limpar",
        description: "Não foi possível limpar os itens.",
        variant: "destructive",
      });
    }
  };

  const handleClientDataChange = (field: keyof ClientData, value: string) => {
    setClientData({ ...data.clientData, [field]: value });
  };

  const handleImagesChange = (sectionId: string, newImages: ImageData[]) => {
    updateImages(sectionId, newImages);
  };

  const validationItems = [
    {
      id: "name",
      label: "Nome do projeto preenchido",
      isValid: data.projectName.trim().length > 0,
      required: true,
    },
    {
      id: "renders",
      label: "Pelo menos 1 render adicionado",
      isValid: data.images.renders?.length > 0,
      required: true,
    },
    {
      id: "photos",
      label: "Fotos ANTES adicionadas",
      isValid: data.images.photosBefore?.length > 0,
    },
    {
      id: "moodboard",
      label: "Moodboard adicionado",
      isValid: data.images.moodboard?.length > 0,
    },
    {
      id: "layout",
      label: "Itens de layout adicionados",
      isValid: data.floorPlanLayout.items.length > 0,
    },
  ];

  const canGenerate = validationItems
    .filter((item) => item.required)
    .every((item) => item.isValid);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    
    try {
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

      toast({
        title: "Apresentação PPT gerada!",
        description: "O download do PowerPoint iniciou automaticamente.",
      });
      setShowPreview(false);
    } catch (error) {
      console.error("Error generating presentation:", error);
      toast({
        title: "Erro ao gerar apresentação",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExcel = () => {
    const allItems = [...data.floorPlanLayout.items, ...data.complementaryItems.items];
    
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
        projectName: data.projectName.trim() || "Projeto",
        clientName: data.clientData.clientName || "Cliente",
        items: allItems,
      });

      toast({
        title: "Orçamento Excel gerado!",
        description: "O download da planilha iniciou automaticamente.",
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Erro ao gerar orçamento",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const totalLayoutItems = data.floorPlanLayout.items.length + data.complementaryItems.items.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Top Actions - New Project Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          {/* Last saved indicator */}
          {data.lastSaved ? (
            <span className="text-xs text-muted-foreground">
              Salvos • {new Date(data.lastSaved).toLocaleString('pt-BR')}
            </span>
          ) : (
            <span></span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowArchiveModal(true)}
          >
            <Archive className="w-4 h-4" />
            Gerenciar Projetos
          </Button>
        </motion.div>

        {/* Archive Modal */}
        <ProjectArchiveModal
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          onArchiveAndNew={handleArchiveAndNew}
          onRestore={handleRestoreProject}
        />

        {/* Project Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Nome do Projeto
            </h3>
            <span className="text-xs border border-foreground px-2 py-0.5 font-medium">
              Obrigatório
            </span>
          </div>
          <Input
            type="text"
            placeholder="Ex: Dormitório Kids - Maria Silva"
            value={data.projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-12 text-base border-border focus:border-foreground focus:ring-foreground"
          />
        </motion.div>

        {/* Project Phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Fase do Projeto
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {PROJECT_PHASES.map((phase) => (
              <button
                key={phase}
                onClick={() => setProjectPhase(phase)}
                className={`px-4 py-2 border text-sm font-medium transition-colors ${
                  data.projectPhase === phase
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground"
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Client Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-card border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
              Dados do Cliente
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Nome do Cliente"
              value={data.clientData.clientName}
              onChange={(e) => handleClientDataChange("clientName", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="Código do Projeto (ex: 011_010_2024 – FK.ARQ)"
              value={data.clientData.projectCode}
              onChange={(e) => handleClientDataChange("projectCode", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="Telefone"
              value={data.clientData.phone}
              onChange={(e) => handleClientDataChange("phone", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="CPF"
              value={data.clientData.cpf}
              onChange={(e) => handleClientDataChange("cpf", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="Endereço"
              value={data.clientData.address}
              onChange={(e) => handleClientDataChange("address", e.target.value)}
              className="h-10 text-sm border-border col-span-full"
            />
            <Input
              type="text"
              placeholder="CEP / Bairro"
              value={data.clientData.cepBairro}
              onChange={(e) => handleClientDataChange("cepBairro", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="Arquiteta Responsável"
              value={data.clientData.architect}
              onChange={(e) => handleClientDataChange("architect", e.target.value)}
              className="h-10 text-sm border-border"
            />
            <Input
              type="text"
              placeholder="Data de Início (ex: 01/01/2026)"
              value={data.clientData.startDate}
              onChange={(e) => handleClientDataChange("startDate", e.target.value)}
              className="h-10 text-sm border-border"
            />
          </div>
        </motion.div>

        {/* Upload Sections */}
        {SECTIONS.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <ImageUploadZone
              config={section}
              images={data.images[section.id] || []}
              onImagesChange={(newImages) => handleImagesChange(section.id, newImages)}
            />
          </motion.div>
        ))}

        {/* Auto-Preenchimento Button - NEW STEP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
        >
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wand2 className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
                  Auto-Preenchimento de Itens
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gere automaticamente a lista base de itens por ambiente
                </p>
              </div>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-12 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900"
              onClick={() => navigate('/auto-preenchimento')}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Iniciar Auto-Preenchimento
            </Button>
          </div>
        </motion.div>

        {/* Layout Button - Opens dedicated page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
                    Layout de Projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Itens da planta e complementares
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totalLayoutItems > 0 && (
                  <>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded">
                      {totalLayoutItems} itens
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar itens do layout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover todos os {totalLayoutItems} itens do layout e itens complementares. 
                            Os outros dados do projeto (nome, cliente, imagens) serão mantidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearLayout}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, limpar itens
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={() => navigate('/projeto?tab=layout')}
            >
              <MapPin className="w-5 h-5 mr-2" />
              {totalLayoutItems > 0 ? "Editar Layout e Itens" : "Configurar Layout e Itens"}
            </Button>
          </div>
        </motion.div>

        {/* Validation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ValidationChecklist items={validationItems} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          {/* Preview & Generate PPT Button */}
          <Button
            size="lg"
            className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold uppercase tracking-wider"
            disabled={!canGenerate}
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-5 h-5" />
            Pré-visualizar e Gerar PPT
          </Button>
          
          {/* Generate Excel Button */}
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-base font-semibold uppercase tracking-wider"
            onClick={handleGenerateExcel}
            disabled={totalLayoutItems === 0}
          >
            <FileSpreadsheet className="w-5 h-5" />
            Gerar Orçamento Excel (Rápido)
          </Button>

          {/* Go to Project Management (new unified tabs) */}
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 border-blue-500 text-blue-600 hover:bg-blue-50 text-base font-semibold uppercase tracking-wider"
            onClick={() => navigate('/projeto?tab=apresentacao')}
          >
            <Calculator className="w-5 h-5" />
            Abrir Gestão do Projeto (4 Abas)
          </Button>
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
          onConfirm={handleGenerate}
          isGenerating={isGenerating}
        />

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-6 gap-3"
        >
          {[
            { label: "Antes", count: data.images.photosBefore?.length || 0, max: 4 },
            { label: "Moodboard", count: data.images.moodboard?.length || 0, max: 1 },
            { label: "Referências", count: data.images.references?.length || 0, max: 6 },
            { label: "Planta", count: data.images.floorPlan?.length || 0, max: 1 },
            { label: "Layout", count: totalLayoutItems, max: 100 },
            { label: "Renders", count: data.images.renders?.length || 0, max: 10 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-border p-4 text-center"
            >
              <div className="text-2xl font-light text-foreground font-mono">
                {stat.count}/{stat.max}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center py-12 border-t border-border mt-12"
        >
          <img 
            src={logoArqexpress} 
            alt="ARQEXPRESS" 
            className="h-8 mx-auto mb-2"
          />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Sistema Automático de Apresentações
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
