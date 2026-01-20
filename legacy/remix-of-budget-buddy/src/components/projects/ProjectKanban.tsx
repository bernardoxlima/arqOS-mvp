import React, { useState } from 'react';
import { Project, ProjectStage, getStagesForService } from '@/types/project';
import { cn } from '@/lib/utils';
import { Clock, User, Users, DollarSign, Calendar, ArrowRight, Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectKanbanProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onAdvanceStage: (project: Project, hours: number, description: string) => void;
  filterService?: 'decorexpress' | 'producao' | 'projetexpress' | 'all';
}

const stageColorClasses: Record<string, { bg: string; border: string; text: string; headerBg: string }> = {
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-400', text: 'text-purple-700 dark:text-purple-300', headerBg: 'bg-purple-100 dark:bg-purple-900/50' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-400', text: 'text-blue-700 dark:text-blue-300', headerBg: 'bg-blue-100 dark:bg-blue-900/50' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-400', text: 'text-cyan-700 dark:text-cyan-300', headerBg: 'bg-cyan-100 dark:bg-cyan-900/50' },
  green: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-400', text: 'text-green-700 dark:text-green-300', headerBg: 'bg-green-100 dark:bg-green-900/50' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', headerBg: 'bg-yellow-100 dark:bg-yellow-900/50' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-400', text: 'text-orange-700 dark:text-orange-300', headerBg: 'bg-orange-100 dark:bg-orange-900/50' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-400', text: 'text-pink-700 dark:text-pink-300', headerBg: 'bg-pink-100 dark:bg-pink-900/50' },
  gray: { bg: 'bg-gray-50 dark:bg-gray-950/30', border: 'border-gray-400', text: 'text-gray-700 dark:text-gray-300', headerBg: 'bg-gray-100 dark:bg-gray-900/50' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-400', text: 'text-emerald-700 dark:text-emerald-300', headerBg: 'bg-emerald-100 dark:bg-emerald-900/50' },
};

const arquitetaColors: Record<string, string> = {
  'Larissa (SP)': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  'Luiza': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'Elo': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'Ana Silva': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  'Beatriz Santos': 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  'Carla Oliveira': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
};

const ProjectKanban: React.FC<ProjectKanbanProps> = ({ 
  projects, 
  onProjectClick, 
  onAdvanceStage,
  filterService = 'all' 
}) => {
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [timeHours, setTimeHours] = useState(1);
  const [timeDescription, setTimeDescription] = useState('');

  // Get all unique stages from active projects
  const getAllStages = (): ProjectStage[] => {
    if (filterService !== 'all') {
      return getStagesForService(filterService);
    }
    return getStagesForService('decorexpress');
  };

  const stages = getAllStages();
  const filteredProjects = filterService === 'all' 
    ? projects 
    : projects.filter(p => p.service === filterService);

  const getProjectsForStage = (stageId: string) => {
    return filteredProjects.filter(p => p.currentStage === stageId);
  };

  const getTotalHours = (project: Project) => {
    return project.entries.reduce((sum, e) => sum + e.hours, 0);
  };

  const getDeadlineStatus = (project: Project) => {
    if (!project.prazoEstimado) return 'gray';
    const prazo = new Date(project.prazoEstimado);
    const diff = Math.ceil((prazo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'red';
    if (diff <= 3) return 'yellow';
    return 'green';
  };

  const deadlineColorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    gray: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  const getNextStage = (project: Project) => {
    const projectStages = getStagesForService(project.service);
    const currentIndex = projectStages.findIndex(s => s.id === project.currentStage);
    return projectStages[currentIndex + 1];
  };

  const getCurrentStageName = (project: Project) => {
    const projectStages = getStagesForService(project.service);
    const stage = projectStages.find(s => s.id === project.currentStage);
    return stage?.name || 'Desconhecido';
  };

  const handleAdvanceClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setTimeHours(1);
    setTimeDescription('');
    setAdvanceModalOpen(true);
  };

  const handleConfirmAdvance = () => {
    if (selectedProject && timeHours > 0) {
      onAdvanceStage(selectedProject, timeHours, timeDescription);
      setAdvanceModalOpen(false);
      setSelectedProject(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageProjects = getProjectsForStage(stage.id);
            const colors = stageColorClasses[stage.color] || stageColorClasses.gray;

            return (
              <div 
                key={stage.id} 
                className="w-80 flex-shrink-0 bg-background border border-border rounded-xl overflow-hidden"
              >
                {/* Column Header */}
                <div className={cn("p-3 border-b-2", colors.headerBg, colors.border)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={cn("text-sm font-semibold", colors.text)}>
                        {stage.name}
                      </span>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                      )}
                    </div>
                    <span className="bg-background text-foreground text-xs font-bold px-2 py-0.5 rounded-full border">
                      {stageProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {stageProjects.map((project) => {
                    const hours = getTotalHours(project);
                    const deadlineStatus = getDeadlineStatus(project);
                    const nextStage = getNextStage(project);
                    const isLastStage = !nextStage;

                    return (
                      <div
                        key={project.id}
                        className="bg-background border border-border rounded-lg overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-md group"
                      >
                        {/* Card Content - Clickable */}
                        <div 
                          onClick={() => onProjectClick(project)}
                          className="p-3"
                        >
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.arquiteta && (
                              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", arquitetaColors[project.arquiteta] || 'bg-gray-100 text-gray-700')}>
                                {project.arquiteta.split(' ')[0]}
                              </span>
                            )}
                            {project.squad && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {project.squad.replace('Squad ', '')}
                              </span>
                            )}
                            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                              project.service === 'decorexpress' ? 'bg-purple-100 text-purple-700' :
                              project.service === 'producao' ? 'bg-cyan-100 text-cyan-700' :
                              'bg-blue-100 text-blue-700'
                            )}>
                              {project.service === 'decorexpress' ? 'Decor' : 
                               project.service === 'producao' ? 'Produz' : 'Projet'}
                            </span>
                          </div>

                          {/* Title & Code */}
                          <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                            {project.clientName}
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {project.codigo}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {project.serviceDetails}
                            </span>
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                R$ {(project.valor / 1000).toFixed(1)}k
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3" />
                                {hours.toFixed(1)}h / {project.horasEstimadas.toFixed(0)}h
                              </span>
                            </div>
                            {project.prazoEstimado && (
                              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1", deadlineColorClasses[deadlineStatus])}>
                                <Calendar className="w-3 h-3" />
                                {new Date(project.prazoEstimado).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Advance Button - Always visible */}
                        {!isLastStage && (
                          <div 
                            className="border-t border-border bg-muted/30 p-2"
                            onClick={(e) => handleAdvanceClick(e, project)}
                          >
                            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors">
                              <span className="flex items-center gap-2">
                                <Play className="w-3 h-3" />
                                Avançar para:
                              </span>
                              <span className="flex items-center gap-1 font-semibold">
                                {nextStage?.name}
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </button>
                          </div>
                        )}
                        
                        {isLastStage && (
                          <div className="border-t border-border bg-emerald-50 dark:bg-emerald-950/30 p-2 text-center">
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              ✓ Projeto Finalizado
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {stageProjects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      Nenhum projeto
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Advance Modal */}
      <Dialog open={advanceModalOpen} onOpenChange={setAdvanceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="text-5xl mb-4">⏱️</div>
              Registrar Tempo
            </DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <strong className="text-foreground">{selectedProject.clientName}</strong>
                <br />
                Concluindo: <span className="font-medium">{getCurrentStageName(selectedProject)}</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Input
                  type="number"
                  value={timeHours}
                  onChange={(e) => setTimeHours(parseFloat(e.target.value) || 0)}
                  min="0.5"
                  step="0.5"
                  className="w-24 text-center text-2xl font-bold"
                  autoFocus
                />
                <span className="text-muted-foreground">horas</span>
              </div>

              <Textarea
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
                placeholder="O que foi feito nesta etapa? (opcional)"
                className="min-h-[80px]"
              />

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Próxima etapa:</p>
                <p className="font-semibold text-primary flex items-center justify-center gap-2">
                  {getNextStage(selectedProject)?.name}
                  <ArrowRight className="w-4 h-4" />
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setAdvanceModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleConfirmAdvance}
                  disabled={timeHours <= 0}
                >
                  ✓ Registrar e Avançar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectKanban;
