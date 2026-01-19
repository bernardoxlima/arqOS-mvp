import React, { useState } from 'react';
import { Project, getStagesForService } from '@/types/project';
import { SavedBudget } from '@/types/budget';
import { ArrowLeft, LayoutGrid, Clock, TrendingUp, Play, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOUR_VALUE } from '@/data/pricingData';
import ProjectKanban from './ProjectKanban';
import ProjectModal from './ProjectModal';
import StartProjectModal from './StartProjectModal';

interface ProjectDashboardProps {
  projects: Project[];
  pendingBudgets: SavedBudget[];
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  onAdvanceStage: (project: Project, hours: number, description: string) => void;
  onStartProject: (budget: SavedBudget, arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => void;
}

type ViewTab = 'kanban' | 'pendentes' | 'timesheet';

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  pendingBudgets,
  onBack,
  onUpdateProject,
  onAdvanceStage,
  onStartProject,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('kanban');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null);
  const [filterService, setFilterService] = useState<'all' | 'decorexpress' | 'producao' | 'projetexpress'>('all');

  const activeProjects = projects.filter(p => p.status !== 'finalizado');
  const finishedProjects = projects.filter(p => p.status === 'finalizado');

  // Stats
  const totalHorasGastas = projects.reduce((sum, p) => sum + p.entries.reduce((s, e) => s + e.hours, 0), 0);
  const totalValor = projects.reduce((sum, p) => sum + p.valor, 0);
  const valorHoraMedio = totalHorasGastas > 0 ? totalValor / totalHorasGastas : 0;

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'kanban', label: 'Kanban', icon: <LayoutGrid className="w-4 h-4" />, count: activeProjects.length },
    { id: 'pendentes', label: 'Aguardando Início', icon: <Play className="w-4 h-4" />, count: pendingBudgets.length },
    { id: 'timesheet', label: 'Timesheet', icon: <Clock className="w-4 h-4" /> },
  ];

  const handleStartProject = (arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => {
    if (selectedBudget) {
      onStartProject(selectedBudget, arquiteta, squad, dataBriefing, prazoEstimado);
      setSelectedBudget(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Visão Geral
      </button>

      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Projetos</h1>
            <p className="text-sm text-muted-foreground">Acompanhe o fluxo e a rentabilidade</p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-muted/50 rounded-lg px-4 py-2 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Projetos Ativos</div>
              <div className="text-xl font-bold">{activeProjects.length}</div>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-2 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">R$/Hora Médio</div>
              <div className={cn("text-xl font-bold", valorHoraMedio >= HOUR_VALUE ? 'text-success' : 'text-destructive')}>
                R$ {valorHoraMedio.toFixed(0)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-2 text-center">
              <div className="text-[10px] uppercase text-muted-foreground">Horas Trabalhadas</div>
              <div className="text-xl font-bold">{totalHorasGastas.toFixed(0)}h</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 p-1 bg-secondary rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-muted/50 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter */}
      {activeTab === 'kanban' && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <div className="flex gap-1">
            {(['all', 'decorexpress', 'producao', 'projetexpress'] as const).map((service) => (
              <button
                key={service}
                onClick={() => setFilterService(service)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-lg transition-colors",
                  filterService === service
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {service === 'all' ? 'Todos' : service === 'decorexpress' ? 'Decor' : service === 'producao' ? 'Produz' : 'Projet'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'kanban' && (
        <ProjectKanban 
          projects={activeProjects} 
          onProjectClick={setSelectedProject}
          onAdvanceStage={onAdvanceStage}
          filterService={filterService}
        />
      )}

      {activeTab === 'pendentes' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Orçamentos Aguardando Início</h2>
            <p className="text-xs text-muted-foreground">Clique para iniciar o projeto</p>
          </div>
          {pendingBudgets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum orçamento pendente. Salve um orçamento na calculadora para iniciar um projeto.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 text-xs uppercase text-muted-foreground">Cliente</th>
                  <th className="text-left p-3 text-xs uppercase text-muted-foreground">Serviço</th>
                  <th className="text-left p-3 text-xs uppercase text-muted-foreground">Valor</th>
                  <th className="text-left p-3 text-xs uppercase text-muted-foreground">Horas</th>
                  <th className="text-left p-3 text-xs uppercase text-muted-foreground">Data</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {pendingBudgets.map((budget) => (
                  <tr key={budget.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{budget.clientName}</td>
                    <td className="p-3 text-sm">
                      {budget.service === 'decorexpress' ? 'DecorExpress' :
                       budget.service === 'producao' ? 'ProduzExpress' : 'ProjetExpress'}
                    </td>
                    <td className="p-3 text-sm">R$ {budget.calculation?.priceWithDiscount.toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-sm">{budget.calculation?.estimatedHours.toFixed(0)}h</td>
                    <td className="p-3 text-sm text-muted-foreground">{budget.date}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedBudget(budget)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-success text-success-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-colors"
                      >
                        <Play className="w-3 h-3" /> Iniciar Projeto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'timesheet' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Histórico de Horas</h2>
          </div>
          {projects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum projeto ainda. Inicie um projeto para ver o timesheet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project) => {
                const totalHours = project.entries.reduce((s, e) => s + e.hours, 0);
                const valorHora = totalHours > 0 ? project.valor / totalHours : 0;
                const horasRestantes = project.horasEstimadas - totalHours;

                return (
                  <div key={project.id} className="bg-background">
                    {/* Project Header */}
                    <div className="bg-foreground text-background p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{project.clientName}</h3>
                        <p className="text-sm opacity-70">{project.codigo} • {project.service === 'decorexpress' ? 'DecorExpress' : project.service === 'producao' ? 'ProduzExpress' : 'ProjetExpress'}</p>
                      </div>
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-xs opacity-60">Horas Gastas</div>
                          <div className="text-lg font-bold">{totalHours.toFixed(1)}h</div>
                        </div>
                        <div>
                          <div className="text-xs opacity-60">Horas Disponíveis</div>
                          <div className={cn("text-lg font-bold", horasRestantes < 0 ? 'text-red-400' : 'text-green-400')}>
                            {horasRestantes.toFixed(1)}h
                          </div>
                        </div>
                        <div>
                          <div className="text-xs opacity-60">R$/Hora</div>
                          <div className={cn("text-lg font-bold", valorHora >= HOUR_VALUE ? 'text-green-400' : valorHora >= HOUR_VALUE * 0.9 ? 'text-yellow-400' : 'text-red-400')}>
                            R$ {valorHora.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Entries */}
                    {project.entries.length > 0 ? (
                      project.entries.map((entry, i) => (
                        <div key={i} className="grid grid-cols-[180px_80px_1fr_100px] gap-4 p-3 border-b border-border last:border-none hover:bg-muted/30">
                          <div>
                            <div className="text-sm font-medium">{entry.stageName}</div>
                          </div>
                          <div className="text-sm font-bold">{entry.hours.toFixed(1)}h</div>
                          <div className="text-sm text-muted-foreground">{entry.description || '-'}</div>
                          <div className="text-sm text-muted-foreground text-right">
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        Nenhuma hora registrada ainda
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={(updated) => {
            onUpdateProject(updated);
            setSelectedProject(null);
          }}
          onAdvanceStage={(proj, hours, desc) => {
            onAdvanceStage(proj, hours, desc);
            setSelectedProject(null);
          }}
        />
      )}

      {selectedBudget && (
        <StartProjectModal
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
          onStart={handleStartProject}
        />
      )}
    </div>
  );
};

export default ProjectDashboard;
