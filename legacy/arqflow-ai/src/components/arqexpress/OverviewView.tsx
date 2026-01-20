import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  Users,
  DollarSign,
  Briefcase,
  FileText,
  CheckCircle2,
  ChevronRight,
  Settings,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
  Sparkles,
  Edit,
  Eye
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  formatCurrency, 
  SERVICE_TYPES, 
  ROLES 
} from '@/lib/arqexpress-data';
import { BrandArchitectureForm } from './BrandArchitectureForm';

type TabType = 'overview' | 'brand';

export function OverviewView() {
  const { 
    office, 
    officeTotals, 
    budgets, 
    projects, 
    finances,
    setView 
  } = useArqExpress();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Calculate summary stats
  const stats = useMemo(() => {
    const pendingBudgets = budgets.filter(b => b.status === 'draft' || b.status === 'sent').length;
    const approvedBudgets = budgets.filter(b => b.status === 'approved').length;
    const activeProjects = projects.filter(p => p.stage !== 'finalizado').length;
    const completedProjects = projects.filter(p => p.stage === 'finalizado').length;
    const totalRevenue = budgets.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.value, 0);
    const pendingFinances = finances.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.value, 0);

    return {
      pendingBudgets,
      approvedBudgets,
      activeProjects,
      completedProjects,
      totalRevenue,
      pendingFinances
    };
  }, [budgets, projects, finances]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-light">Visão Geral</h2>
        <p className="text-sm text-muted-foreground">
          Resumo completo do escritório e arquitetura da marca
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'overview' 
              ? 'text-primary border-primary' 
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          <Eye className="w-4 h-4" />
          Resumo do Escritório
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'brand' 
              ? 'text-primary border-primary' 
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          <Target className="w-4 h-4" />
          Arquitetura da Marca
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="arq-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.pendingBudgets}</p>
                    <p className="text-xs text-muted-foreground">Orçamentos pendentes</p>
                  </div>
                </div>
              </div>
              <div className="arq-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.activeProjects}</p>
                    <p className="text-xs text-muted-foreground">Projetos ativos</p>
                  </div>
                </div>
              </div>
              <div className="arq-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Receita aprovada</p>
                  </div>
                </div>
              </div>
              <div className="arq-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stats.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Projetos concluídos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Office Details */}
              <div className="arq-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Dados do Escritório
                  </h3>
                  <button 
                    onClick={() => setView('setup')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Nome</span>
                    <span className="text-sm font-medium">{office.name || 'Não definido'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Porte</span>
                    <span className="text-sm font-medium">
                      {office.size === 'solo' ? 'Solo' : 
                       office.size === 'small' ? 'Pequeno' : 
                       office.size === 'medium' ? 'Médio' : 
                       office.size === 'large' ? 'Grande' : 'Não definido'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Margem Desejada</span>
                    <span className="text-sm font-medium">{office.margin}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Custo/Hora</span>
                    <span className="text-sm font-medium">{formatCurrency(officeTotals.hourly)}</span>
                  </div>
                </div>
              </div>

              {/* Team Summary */}
              <div className="arq-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Equipe ({office.team.length} pessoas)
                  </h3>
                  <button 
                    onClick={() => setView('team')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                </div>
                <div className="space-y-2">
                  {office.team.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: ROLES[member.role]?.color || '#666' }}
                        >
                          {member.name?.[0] || 'A'}
                        </div>
                        <span className="text-sm">{member.name || 'Sem nome'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {ROLES[member.role]?.name || member.role}
                      </span>
                    </div>
                  ))}
                  {office.team.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{office.team.length - 5} membros
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Services & Costs */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Services */}
              <div className="arq-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Serviços Ativos
                  </h3>
                  <button 
                    onClick={() => setView('templates')}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                </div>
                {office.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {office.services.map(serviceId => {
                      const service = SERVICE_TYPES.find(s => s.id === serviceId);
                      return (
                        <span 
                          key={serviceId}
                          className="px-3 py-1.5 bg-muted text-sm rounded-md"
                        >
                          {service?.name || serviceId}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum serviço configurado</p>
                )}
              </div>

              {/* Monthly Costs */}
              <div className="arq-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Custos Mensais
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Folha</span>
                    <span>{formatCurrency(officeTotals.salaries)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custos Fixos</span>
                    <span>{formatCurrency(officeTotals.costs)}</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-2 border-t border-border font-medium">
                    <span>Total Mensal</span>
                    <span>{formatCurrency(officeTotals.monthly)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Flow */}
            <div className="arq-card p-5">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Fluxo do Processo
              </h3>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {[
                  { icon: FileText, label: 'Orçamento', count: budgets.length, color: 'bg-blue-100 text-blue-600' },
                  { icon: CheckCircle2, label: 'Aprovação', count: stats.approvedBudgets, color: 'bg-emerald-100 text-emerald-600' },
                  { icon: Briefcase, label: 'Projeto', count: stats.activeProjects, color: 'bg-violet-100 text-violet-600' },
                  { icon: DollarSign, label: 'Financeiro', count: finances.length, color: 'bg-amber-100 text-amber-600' },
                ].map((step, index, arr) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${step.color}`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                      <span className="text-lg font-semibold">{step.count}</span>
                    </div>
                    {index < arr.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="brand"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BrandArchitectureForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
