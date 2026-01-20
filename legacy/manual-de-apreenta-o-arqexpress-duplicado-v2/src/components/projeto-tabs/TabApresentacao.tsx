import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { SlidePreview } from "@/components/SlidePreview";
import { ImageData, SectionConfig, ClientData } from "@/types/presentation";
import { StoredPresentationData } from "@/hooks/usePresentationStorage";
import { generatePresentation } from "@/utils/generatePresentation";
import { useToast } from "@/hooks/use-toast";

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

interface TabApresentacaoProps {
  data: StoredPresentationData;
  setProjectName: (name: string) => void;
  setProjectPhase: (phase: string) => void;
  setClientData: (clientData: ClientData) => void;
  updateImages: (sectionId: string, images: ImageData[]) => void;
  syncFloorPlanToLayout: (imageBase64: string | null) => void;
}

export function TabApresentacao({
  data,
  setProjectName,
  setProjectPhase,
  setClientData,
  updateImages,
  syncFloorPlanToLayout,
}: TabApresentacaoProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleClientDataChange = (field: keyof ClientData, value: string) => {
    setClientData({ ...data.clientData, [field]: value });
  };

  const handleImagesChange = (sectionId: string, newImages: ImageData[]) => {
    updateImages(sectionId, newImages);
    
    // Sync floor plan image to layout when uploaded
    if (sectionId === 'floorPlan' && newImages.length > 0) {
      // Get the image preview (base64) and sync to floorPlanLayout
      const floorPlanImage = newImages[0];
      if (floorPlanImage?.preview) {
        syncFloorPlanToLayout(floorPlanImage.preview);
      }
    } else if (sectionId === 'floorPlan' && newImages.length === 0) {
      // Clear the floor plan from layout if removed
      syncFloorPlanToLayout(null);
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      {/* Auto-Preenchimento Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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

      {/* Validation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <ValidationChecklist items={validationItems} />
      </motion.div>

      {/* Preview Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          size="lg"
          className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 text-base font-semibold uppercase tracking-wider"
          disabled={!canGenerate}
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-5 h-5" />
          Pré-visualizar Apresentação
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-5 gap-3"
      >
        {[
          { label: "Antes", count: data.images.photosBefore?.length || 0, max: 4 },
          { label: "Moodboard", count: data.images.moodboard?.length || 0, max: 1 },
          { label: "Referências", count: data.images.references?.length || 0, max: 6 },
          { label: "Planta", count: data.images.floorPlan?.length || 0, max: 1 },
          { label: "Renders", count: data.images.renders?.length || 0, max: 10 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border p-3 text-center"
          >
            <div className="text-xl font-light text-foreground font-mono">
              {stat.count}/{stat.max}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              {stat.label}
            </div>
          </div>
        ))}
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
    </div>
  );
}
