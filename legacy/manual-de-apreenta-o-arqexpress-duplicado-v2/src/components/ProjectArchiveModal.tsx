import { useState, useEffect } from "react";
import { Archive, Trash2, Download, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const ARCHIVE_KEY = 'arqexpress_archived_projects';
const STORAGE_KEY = 'arqexpress_presentation_data';

export interface ArchivedProject {
  id: string;
  projectName: string;
  clientName: string;
  projectCode: string;
  archivedAt: string;
  totalItems: number;
  data: any; // Full project data
}

interface ProjectArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchiveAndNew: () => void;
  onRestore: (project: ArchivedProject) => void;
}

export const getArchivedProjects = (): ArchivedProject[] => {
  try {
    const stored = localStorage.getItem(ARCHIVE_KEY);
    if (stored) {
      return JSON.parse(stored) as ArchivedProject[];
    }
  } catch (error) {
    console.error('Error getting archived projects:', error);
  }
  return [];
};

export const archiveCurrentProject = (): boolean => {
  try {
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (!currentData) return false;

    const parsed = JSON.parse(currentData);
    
    // Check if there's anything to archive
    const hasContent = 
      parsed.projectName?.trim() ||
      parsed.clientData?.clientName?.trim() ||
      (parsed.floorPlanLayout?.items?.length > 0) ||
      (parsed.complementaryItems?.items?.length > 0) ||
      Object.values(parsed.images || {}).some((arr: any) => arr?.length > 0);

    if (!hasContent) return false;

    const archived: ArchivedProject = {
      id: Date.now().toString(),
      projectName: parsed.projectName || "Sem nome",
      clientName: parsed.clientData?.clientName || "Sem cliente",
      projectCode: parsed.clientData?.projectCode || "",
      archivedAt: new Date().toISOString(),
      totalItems: (parsed.floorPlanLayout?.items?.length || 0) + (parsed.complementaryItems?.items?.length || 0),
      data: parsed,
    };

    const existing = getArchivedProjects();
    existing.unshift(archived);

    // Keep only last 20 projects
    const trimmed = existing.slice(0, 20);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed));
    
    return true;
  } catch (error) {
    console.error('Error archiving project:', error);
    return false;
  }
};

export const deleteArchivedProject = (id: string): void => {
  try {
    const projects = getArchivedProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting archived project:', error);
  }
};

export const ProjectArchiveModal = ({
  isOpen,
  onClose,
  onArchiveAndNew,
  onRestore,
}: ProjectArchiveModalProps) => {
  const { toast } = useToast();
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setArchivedProjects(getArchivedProjects());
    }
  }, [isOpen]);

  const handleArchiveAndNew = () => {
    const success = archiveCurrentProject();
    
    if (success) {
      toast({
        title: "Projeto arquivado! 📦",
        description: "O projeto atual foi salvo no histórico.",
      });
    }
    
    onArchiveAndNew();
  };

  const handleDelete = (id: string) => {
    deleteArchivedProject(id);
    setArchivedProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Projeto removido",
      description: "O projeto foi removido do histórico.",
    });
  };

  const handleRestore = (project: ArchivedProject) => {
    onRestore(project);
    onClose();
    toast({
      title: "Projeto restaurado! 🎉",
      description: `"${project.projectName}" foi carregado.`,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Gerenciar Projetos
          </DialogTitle>
          <DialogDescription>
            Arquive o projeto atual e comece um novo, ou restaure um projeto anterior.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4 space-y-4">
          {/* Current Project Action */}
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-2">Projeto Atual</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Salve o projeto atual no histórico e comece um novo projeto limpo.
            </p>
            <Button onClick={handleArchiveAndNew} className="w-full gap-2">
              <Archive className="w-4 h-4" />
              Arquivar e Começar Novo
            </Button>
          </div>

          {/* Archived Projects */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Projetos Arquivados
              <span className="text-xs text-muted-foreground">
                ({archivedProjects.length})
              </span>
            </h4>

            {archivedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum projeto arquivado ainda.
              </p>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-4">
                  <AnimatePresence>
                    {archivedProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-background border border-border rounded-lg overflow-hidden"
                      >
                        <div 
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {project.projectName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {project.clientName}
                              {project.projectCode && ` • ${project.projectCode}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(project.archivedAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {project.totalItems} itens
                            </p>
                          </div>
                          {expandedId === project.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>

                        <AnimatePresence>
                          {expandedId === project.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-border"
                            >
                              <div className="p-3 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(project);
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                  Restaurar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(project.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
