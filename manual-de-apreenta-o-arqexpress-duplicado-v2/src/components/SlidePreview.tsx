import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PresentationData, FloorPlanItem, ITEM_CATEGORIES, ItemCategory } from "@/types/presentation";
import logoArqexpress from "@/assets/logo-arqexpress.png";

interface SlidePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PresentationData;
  onConfirm: () => void;
  isGenerating: boolean;
}

interface SlideData {
  title: string;
  type: "cover" | "intro" | "before" | "moodboard" | "references" | "floorPlan" | "floorPlanLayout" | "shoppingList" | "render";
  images?: string[];
  layoutItems?: FloorPlanItem[];
  ambiente?: string;
  ambienteItems?: FloorPlanItem[];
}

const getCategoryConfig = (categoryId: ItemCategory) => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId) || ITEM_CATEGORIES[0];
};

export function SlidePreview({ open, onOpenChange, data, onConfirm, isGenerating }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Build slides array based on available data
  const buildSlides = (): SlideData[] => {
    const slides: SlideData[] = [];
    
    // Cover slide
    slides.push({ title: "Capa", type: "cover" });
    
    // Intro slide (if has render)
    if (data.renders.length > 0) {
      slides.push({ title: "Introdução", type: "intro", images: [data.renders[0].preview] });
    }
    
    // Before photos slide
    if (data.photosBefore.length > 0) {
      slides.push({ 
        title: "Fotos Antes", 
        type: "before", 
        images: data.photosBefore.map(img => img.preview) 
      });
    }
    
    // Moodboard slide
    if (data.moodboard.length > 0) {
      slides.push({ 
        title: "Moodboard", 
        type: "moodboard", 
        images: data.moodboard.map(img => img.preview) 
      });
    }
    
    // References slides (3 per slide)
    if (data.references.length > 0) {
      for (let i = 0; i < data.references.length; i += 3) {
        const chunk = data.references.slice(i, i + 3);
        slides.push({ 
          title: `Referências ${Math.floor(i/3) + 1}`, 
          type: "references", 
          images: chunk.map(img => img.preview) 
        });
      }
    }
    
    // Floor Plan slides (2 per slide)
    if (data.floorPlan.length > 0) {
      for (let i = 0; i < data.floorPlan.length; i += 2) {
        const chunk = data.floorPlan.slice(i, i + 2);
        slides.push({ 
          title: `Planta Baixa ${Math.floor(i/2) + 1}`, 
          type: "floorPlan", 
          images: chunk.map(img => img.preview) 
        });
      }
    }
    
    // Floor Plan Layout with item list
    // Use layout image if available, otherwise use first floorPlan image
    const layoutImage = data.floorPlanLayout?.originalImage 
      || (data.floorPlan.length > 0 ? data.floorPlan[0].preview : null);
      
    if (layoutImage && data.floorPlanLayout?.items && data.floorPlanLayout.items.length > 0) {
      slides.push({ 
        title: "Layout de Projeto", 
        type: "floorPlanLayout", 
        images: [layoutImage],
        layoutItems: data.floorPlanLayout.items
      });
    }
    
    // Shopping List slides (one per ambiente) - includes both layout and complementary items
    const layoutItems = data.floorPlanLayout?.items || [];
    const complementaryItems = data.complementaryItems?.items || [];
    const allItems = [...layoutItems, ...complementaryItems];
    
    if (allItems.length > 0) {
      const groupedByAmbiente = allItems.reduce((acc, item) => {
        if (!acc[item.ambiente]) {
          acc[item.ambiente] = [];
        }
        acc[item.ambiente].push(item);
        return acc;
      }, {} as Record<string, FloorPlanItem[]>);
      
      Object.entries(groupedByAmbiente).forEach(([ambiente, items]) => {
        slides.push({
          title: `Compras - ${ambiente.substring(0, 10)}...`,
          type: "shoppingList",
          ambiente: ambiente,
          ambienteItems: items
        });
      });
    }
    
    // Render slides (1 per slide)
    data.renders.forEach((render, index) => {
      slides.push({ 
        title: `Render ${index + 1}`, 
        type: "render", 
        images: [render.preview] 
      });
    });
    
    return slides;
  };

  const slides = buildSlides();

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const currentSlideData = slides[currentSlide];

  const renderSlideContent = () => {
    switch (currentSlideData?.type) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white">
            <div className="w-24 h-px bg-black mb-8" />
            <img src={logoArqexpress} alt="ARQEXPRESS" className="h-10 mb-6" />
            <p className="text-lg font-light tracking-[0.4em] text-black mb-2">
              {data.projectPhase?.toUpperCase() || "ENTREGA FINAL"}
            </p>
            <p className="text-sm text-muted-foreground">
              {data.projectName}
            </p>
            <div className="w-24 h-px bg-black mt-8" />
          </div>
        );
      
      case "intro":
        const client = data.clientData;
        const phases = [
          { key: "Apresentação de Projeto", label: "APRESENTAÇÃO DE PROJETO" },
          { key: "Revisão de Projeto", label: "REVISÃO DE PROJETO" },
          { key: "Manual de Detalhamento", label: "MANUAL DE DETALHAMENTO" },
          { key: "Entrega Final", label: "ENTREGA FINAL" },
        ];
        return (
          <div className="flex h-full bg-white">
            <div className="w-1/2 flex flex-col p-5 text-left">
              {/* Client name big */}
              <h1 className="text-lg font-bold text-black mb-0.5">
                {client?.clientName?.toUpperCase() || "NOME DO CLIENTE"}
              </h1>
              <p className="text-[10px] text-gray-500 mb-3">
                {client?.projectCode || ""}
              </p>
              
              {/* Project name */}
              <h2 className="text-sm font-bold text-black mb-3 underline underline-offset-4">
                {data.projectName.toUpperCase()}
              </h2>
              
              {/* Client data */}
              <div className="text-[9px] text-black space-y-0.5 mb-4">
                <p>Nome: {client?.clientName || ""}</p>
                <p>Telefone: {client?.phone || ""}</p>
                <p>Endereço: {client?.address || ""}</p>
                <p>CEP/BAIRRO: {client?.cepBairro || ""}</p>
                <p>CPF: {client?.cpf || ""}</p>
                <p>Arquiteta Responsável: {client?.architect || ""}</p>
                <p>Data de Início: {client?.startDate || ""}</p>
              </div>
              
              {/* Divider */}
              <div className="w-full h-px bg-gray-200 mb-3" />
              
              {/* Phases */}
              <div className="text-[9px] space-y-1">
                {phases.map((phase, idx) => {
                  const isActive = data.projectPhase === phase.key;
                  return (
                    <p 
                      key={idx} 
                      className={isActive ? "font-bold text-black" : "text-gray-400"}
                    >
                      • {phase.label}
                    </p>
                  );
                })}
              </div>
            </div>
            <div className="w-1/2 p-3">
              {currentSlideData.images?.[0] && (
                <img 
                  src={currentSlideData.images[0]} 
                  alt="Render" 
                  className="w-full h-full object-contain border-2 border-black"
                />
              )}
            </div>
          </div>
        );
      
      case "before":
        return (
          <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black">FOTOS ANTES</h2>
              <div className="w-16 h-px bg-black mt-1" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {currentSlideData.images?.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Before ${idx + 1}`} 
                    className="w-full h-full object-contain bg-muted"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      
      case "moodboard":
        return (
          <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black">MOODBOARD</h2>
              <div className="w-16 h-px bg-black mt-1" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              {currentSlideData.images?.[0] && (
                <img 
                  src={currentSlideData.images[0]} 
                  alt="Moodboard" 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        );
      
      case "references":
        return (
          <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black">REFERÊNCIAS</h2>
              <div className="w-16 h-px bg-black mt-1" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {currentSlideData.images?.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Reference ${idx + 1}`} 
                    className="w-full h-full object-contain bg-muted"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      
      case "floorPlan":
        return (
          <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-black">PLANTA BAIXA</h2>
              <div className="w-16 h-px bg-black mt-1" />
            </div>
            <div className={`flex-1 grid gap-2 ${currentSlideData.images?.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {currentSlideData.images?.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={img} 
                    alt={`Floor Plan ${idx + 1}`} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      
      case "floorPlanLayout":
        return (
          <div className="flex h-full bg-white p-4">
            <div className="flex-1 flex flex-col">
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-black">LAYOUT DE PROJETO</h2>
                <div className="w-16 h-px bg-black mt-1" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                {currentSlideData.images?.[0] && (
                  <img 
                    src={currentSlideData.images[0]} 
                    alt="Layout de Projeto" 
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </div>
            {/* Legend with category colors */}
            <div className="w-40 pl-4 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-black mb-2 uppercase">Legenda</h3>
              <div className="space-y-1 text-[8px]">
                {currentSlideData.layoutItems?.map((item) => {
                  const catConfig = getCategoryConfig(item.category);
                  return (
                    <div key={item.number} className="flex items-center gap-2">
                      <span 
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${catConfig.bgColor} ${catConfig.textColor}`}
                      >
                        {item.number}
                      </span>
                      <span className="text-black">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case "shoppingList":
        const categoryOrder: ItemCategory[] = ['mobiliario', 'marcenaria', 'marmoraria', 'decoracao', 'iluminacao', 'materiais', 'eletrica', 'hidraulica', 'maoDeObra', 'outros'];
        return (
          <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-black">LISTA DE COMPRAS</h2>
              <div className="w-16 h-px bg-black mt-1" />
            </div>
            <h3 className="text-sm text-gray-600 mb-3">{currentSlideData.ambiente?.toUpperCase()}</h3>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {currentSlideData.ambienteItems
                  ?.sort((a, b) => {
                    const aIdx = categoryOrder.indexOf(a.category);
                    const bIdx = categoryOrder.indexOf(b.category);
                    return aIdx - bIdx;
                  })
                  .map((item) => {
                    const catConfig = getCategoryConfig(item.category);
                    return (
                      <div key={item.number} className="flex items-center gap-2">
                        <span 
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${catConfig.bgColor} ${catConfig.textColor}`}
                        >
                          {item.number}
                        </span>
                        <span className="text-[11px] text-black">{item.name.toUpperCase()}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            {/* Category legend */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 mt-2">
              {ITEM_CATEGORIES.filter(cat => 
                currentSlideData.ambienteItems?.some(item => item.category === cat.id)
              ).map((cat) => (
                <div key={cat.id} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm ${cat.bgColor}`} />
                  <span className="text-[8px] text-gray-500">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "render":
        return (
          <div className="flex items-center justify-center h-full bg-white p-2">
            {currentSlideData.images?.[0] && (
              <img 
                src={currentSlideData.images[0]} 
                alt="Render" 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold uppercase tracking-wide">
                Pré-visualização
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Revise os slides antes de gerar a apresentação
              </DialogDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} de {slides.length}
            </div>
          </div>
        </DialogHeader>
        
        {/* Slide Preview */}
        <div className="flex-1 relative bg-muted p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full bg-white border border-border shadow-lg"
              style={{ aspectRatio: "3/2" }}
            >
              {renderSlideContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Slide Navigation */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto flex-1 mr-4">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`
                    flex-shrink-0 px-3 py-1.5 text-xs font-medium border transition-colors
                    ${currentSlide === idx 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-background text-foreground border-border hover:border-foreground"
                    }
                  `}
                >
                  {slide.title}
                </button>
              ))}
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToSlide(currentSlide - 1)}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToSlide(currentSlide + 1)}
                disabled={currentSlide === slides.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                className="bg-foreground text-background hover:bg-foreground/90 ml-2"
                onClick={onConfirm}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>Gerando...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PPTX
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
