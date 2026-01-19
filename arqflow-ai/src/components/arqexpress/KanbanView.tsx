import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Calendar,
  Sparkles,
  FileText,
  FolderOpen,
  Bot,
  Upload
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  formatDate,
  SERVICE_TYPES,
  getPriorityConfig,
  Project
} from '@/lib/arqexpress-data';
import { BriefingAIModal } from './BriefingAIModal';

export function KanbanView() {
  const { 
    projects, 
    setProjects,
    office,
    getTemplate,
    setView,
    setCurrentProjectId
  } = useArqExpress();

  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [architectFilter, setArchitectFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const openAIModal = (project: Project) => {
    setSelectedProject(project);
    setIsAIModalOpen(true);
  };

  // Get active projects (not finalized)
  const activeProjects = useMemo(() => {
    return projects.filter(p => {
      if (serviceFilter !== 'all' && p.service !== serviceFilter) return false;
      if (architectFilter !== 'all' && p.architect !== Number(architectFilter)) return false;
      return true;
    });
  }, [projects, serviceFilter, architectFilter]);

  // Group projects by stage
  const getProjectsByStage = (stageId: string) => {
    return activeProjects.filter(p => p.stage === stageId);
  };

  // Get phases for the most common service or first active service
  const getKanbanPhases = () => {
    const serviceId = serviceFilter !== 'all' ? serviceFilter : office.services[0];
    if (!serviceId) return [];
    const template = getTemplate(serviceId);
    return template?.phases.filter(p => p.id !== 'finalizado') || [];
  };

  const phases = getKanbanPhases();

  // Move project to next/prev stage
  const moveProject = (projectId: number, direction: 'prev' | 'next') => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      const template = getTemplate(p.service);
      if (!template) return p;
      
      const currentIndex = template.phases.findIndex(ph => ph.id === p.stage);
      const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      
      if (newIndex < 0 || newIndex >= template.phases.length) return p;
      
      return { ...p, stage: template.phases[newIndex].id };
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-light">Kanban de Projetos</h2>
          <p className="text-sm text-muted-foreground">
            {activeProjects.length} projetos em andamento
          </p>
        </div>
        <button 
          onClick={() => setView('calculator')}
          className="arq-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Serviço</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="arq-select w-48"
          >
            <option value="all">Todos</option>
            {office.services.map(svc => {
              const service = SERVICE_TYPES.find(s => s.id === svc);
              return <option key={svc} value={svc}>{service?.name}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Arquiteto</label>
          <select
            value={architectFilter}
            onChange={(e) => setArchitectFilter(e.target.value)}
            className="arq-select w-48"
          >
            <option value="all">Todos</option>
            {office.team.map(member => (
              <option key={member.id} value={member.id}>{member.name || 'Sem nome'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {phases.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map(phase => {
            const stageProjects = getProjectsByStage(phase.id);
            
            return (
              <div 
                key={phase.id}
                className="flex-shrink-0 w-80"
              >
                {/* Column Header */}
                <div 
                  className="p-3 mb-3 flex items-center justify-between"
                  style={{ 
                    borderLeft: `4px solid ${phase.color}`,
                    backgroundColor: `${phase.color}15`
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{phase.name}</span>
                    <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded">
                      {stageProjects.length}
                    </span>
                  </div>
                  {/* Phase AI & Documents */}
                  <div className="flex items-center gap-1">
                    <button 
                      className="p-1.5 hover:bg-black/10 rounded transition-colors"
                      title="IA de apoio da fase"
                    >
                      <Bot className="w-4 h-4 text-violet-600" />
                    </button>
                    <button 
                      className="p-1.5 hover:bg-black/10 rounded transition-colors"
                      title="Documentos da fase"
                    >
                      <FolderOpen className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {stageProjects.map((project, index) => {
                    const priorityConfig = getPriorityConfig(project.priority);
                    const progress = project.estimatedHours > 0 
                      ? (project.hoursUsed / project.estimatedHours) * 100 
                      : 0;
                    const architect = office.team.find(m => m.id === project.architect);
                    const template = getTemplate(project.service);
                    const currentPhaseIndex = template?.phases.findIndex(p => p.id === project.stage) ?? -1;
                    const prevPhase = currentPhaseIndex > 0 ? template?.phases[currentPhaseIndex - 1] : null;
                    const nextPhase = currentPhaseIndex < (template?.phases.length || 0) - 1 
                      ? template?.phases[currentPhaseIndex + 1] 
                      : null;

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="kanban-card"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{project.code}</span>
                          {project.priority !== 'normal' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              project.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                              project.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {priorityConfig.label}
                            </span>
                          )}
                        </div>

                        {/* Client */}
                        <p className="text-sm truncate">{project.client}</p>

                        {/* Architect */}
                        {architect && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                              style={{ backgroundColor: phase.color }}
                            >
                              {architect.name?.[0] || 'A'}
                            </div>
                            <span>{architect.name}</span>
                          </div>
                        )}

                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {project.hoursUsed}h / {project.estimatedHours}h
                            </span>
                            <span className={
                              progress > 100 ? 'text-red-600' :
                              progress > 80 ? 'text-amber-600' :
                              'text-emerald-600'
                            }>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${
                                progress > 100 ? 'bg-red-500' :
                                progress > 80 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* AI & Documents Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <button 
                            onClick={() => openAIModal(project)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 rounded transition-colors"
                            title="Usar IA nesta fase"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>IA</span>
                          </button>
                          <button 
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 rounded transition-colors"
                            title="Documentos do projeto"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Docs</span>
                          </button>
                          <button 
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                            title="Upload de arquivo"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                          <div className="flex items-center gap-3">
                            {project.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {project.comments.length}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(project.deadline)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (prevPhase) moveProject(project.id, 'prev');
                            }}
                            disabled={!prevPhase}
                            className={`text-xs flex items-center gap-1 ${
                              prevPhase ? 'text-muted-foreground hover:text-foreground' : 'opacity-30'
                            }`}
                          >
                            <ChevronLeft className="w-3 h-3" />
                            {prevPhase?.name || '-'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setCurrentProjectId(project.id);
                              setView('project-detail');
                            }}
                            className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
                          >
                            Abrir
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (nextPhase && nextPhase.id !== 'finalizado') moveProject(project.id, 'next');
                            }}
                            disabled={!nextPhase || nextPhase.id === 'finalizado'}
                            className={`text-xs flex items-center gap-1 ${
                              nextPhase && nextPhase.id !== 'finalizado' 
                                ? 'text-muted-foreground hover:text-foreground' 
                                : 'opacity-30'
                            }`}
                          >
                            {nextPhase?.name || '-'}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Empty State */}
                  {stageProjects.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-border text-center">
                      <p className="text-sm text-muted-foreground">
                        Nenhum projeto nesta fase
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Finalized Column */}
          <div className="flex-shrink-0 w-80">
            <div 
              className="p-3 mb-3 flex items-center justify-between bg-muted"
              style={{ borderLeft: '4px solid #6B7280' }}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">Finalizados</span>
                <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded">
                  {projects.filter(p => p.stage === 'finalizado').length}
                </span>
              </div>
              <button 
                className="p-1.5 hover:bg-black/20 rounded transition-colors"
                title="Pasta completa do cliente"
              >
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {projects
                .filter(p => p.stage === 'finalizado')
                .slice(0, 3)
                .map(project => (
                  <div key={project.id} className="arq-card p-3 opacity-60">
                    <p className="font-medium text-sm">{project.code}</p>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                    <button className="flex items-center gap-1 mt-2 text-xs text-amber-600 hover:text-amber-700">
                      <FolderOpen className="w-3 h-3" />
                      Ver pasta do projeto
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      ) : (
        <div className="arq-card p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Nenhum projeto ainda</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Aprove um orçamento para começar
          </p>
          <button onClick={() => setView('budgets')} className="arq-btn-primary">
            Ver Orçamentos
          </button>
        </div>
      )}

      {/* AI Assistant */}
      {activeProjects.length > 0 && (
        <div className="arq-card p-5 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-violet-900 mb-1">IA de Apoio por Fase</h3>
              <p className="text-sm text-violet-700 mb-3">
                Cada fase tem IA para gerar memoriais, checklists, emails e documentação. 
                Os documentos são salvos automaticamente na pasta do cliente.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
                  <Bot className="w-4 h-4 text-violet-600" />
                  <span className="text-violet-800">IA por fase do projeto</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span className="text-violet-800">Documentos salvos por etapa</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-violet-800">Upload de arquivos</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  <span className="text-violet-800">Pasta completa do cliente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Briefing AI Modal */}
      {selectedProject && (
        <BriefingAIModal
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </div>
  );
}