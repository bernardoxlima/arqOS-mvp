import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Presentation, 
  Layout, 
  ShoppingCart, 
  FileDown, 
  ChevronLeft,
  Calculator,
  FileText
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePresentationStorage } from "@/hooks/usePresentationStorage";
import { useToast } from "@/hooks/use-toast";

// Tab Components
import { TabApresentacao } from "@/components/projeto-tabs/TabApresentacao";
import { TabLayout } from "@/components/projeto-tabs/TabLayout";
import { TabCompras } from "@/components/projeto-tabs/TabCompras";
import { TabDetalhamento } from "@/components/projeto-tabs/TabDetalhamento";
import { TabOrcamento } from "@/components/projeto-tabs/TabOrcamento";
import { TabExportar } from "@/components/projeto-tabs/TabExportar";

// Tab configuration - easy to add more tabs later
const TABS_CONFIG = [
  { 
    id: "apresentacao", 
    label: "Apresentação", 
    icon: Presentation,
    description: "Dados do projeto, imagens e renders"
  },
  { 
    id: "layout", 
    label: "Layout", 
    icon: Layout,
    description: "Planta baixa e itens do projeto"
  },
  { 
    id: "compras", 
    label: "Lista de Compras", 
    icon: ShoppingCart,
    description: "Lista completa de itens"
  },
  { 
    id: "detalhamento", 
    label: "Detalhamento", 
    icon: FileText,
    description: "Planta baixa + itens por categoria"
  },
  { 
    id: "orcamento", 
    label: "Orçamento", 
    icon: Calculator,
    description: "Preços e exportação do orçamento"
  },
  { 
    id: "exportar", 
    label: "Exportar PPT", 
    icon: FileDown,
    description: "Gerar apresentação completa"
  },
];

const ProjetoManager = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get initial tab from URL or default to first tab
  const initialTab = searchParams.get("tab") || TABS_CONFIG[0].id;
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Use persistent storage
  const {
    data,
    isLoaded,
    setProjectName,
    setProjectPhase,
    setClientData,
    updateImages,
    setFloorPlanLayout,
    setComplementaryItems,
  } = usePresentationStorage();

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && TABS_CONFIG.some(t => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const totalItems = data.floorPlanLayout.items.length + data.complementaryItems.items.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button and project info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="border-l border-border pl-4">
              <h1 className="text-lg font-semibold text-foreground">
                {data.projectName || "Novo Projeto"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {data.projectPhase} • {totalItems} itens
              </p>
            </div>
          </div>
          
          {data.lastSaved && (
            <span className="text-xs text-muted-foreground">
              Salvos • {new Date(data.lastSaved).toLocaleString('pt-BR')}
            </span>
          )}
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full h-auto p-1 bg-muted/50" style={{ gridTemplateColumns: `repeat(${TABS_CONFIG.length}, 1fr)` }}>
            {TABS_CONFIG.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col sm:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab: Apresentação */}
          <TabsContent value="apresentacao" className="mt-6">
            <TabApresentacao
              data={data}
              setProjectName={setProjectName}
              setProjectPhase={setProjectPhase}
              setClientData={setClientData}
              updateImages={updateImages}
              syncFloorPlanToLayout={(imageBase64) => {
                setFloorPlanLayout({
                  ...data.floorPlanLayout,
                  originalImage: imageBase64,
                });
              }}
            />
          </TabsContent>

          {/* Tab: Layout */}
          <TabsContent value="layout" className="mt-6">
            <TabLayout
              data={data}
              setFloorPlanLayout={setFloorPlanLayout}
              setComplementaryItems={setComplementaryItems}
            />
          </TabsContent>

          {/* Tab: Lista de Compras */}
          <TabsContent value="compras" className="mt-6">
            <TabCompras
              data={data}
              setFloorPlanLayout={setFloorPlanLayout}
              setComplementaryItems={setComplementaryItems}
            />
          </TabsContent>

          {/* Tab: Detalhamento */}
          <TabsContent value="detalhamento" className="mt-6">
            <TabDetalhamento data={data} />
          </TabsContent>

          {/* Tab: Orçamento */}
          <TabsContent value="orcamento" className="mt-6">
            <TabOrcamento
              data={data}
              setFloorPlanLayout={setFloorPlanLayout}
              setComplementaryItems={setComplementaryItems}
            />
          </TabsContent>

          {/* Tab: Exportar PPT */}
          <TabsContent value="exportar" className="mt-6">
            <TabExportar data={data} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjetoManager;
