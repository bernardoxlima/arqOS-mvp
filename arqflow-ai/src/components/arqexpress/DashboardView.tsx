import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Briefcase,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { formatCurrency, getStatusConfig, getPriorityConfig } from '@/lib/arqexpress-data';

export function DashboardView() {
  const { 
    office, 
    officeTotals, 
    budgets, 
    projects, 
    finances,
    setView,
    setCurrentBudgetId,
    setCurrentProjectId
  } = useArqExpress();

  const stats = useMemo(() => {
    const totalBudgets = budgets.length;
    const draftBudgets = budgets.filter(b => b.status === 'draft').length;
    const sentBudgets = budgets.filter(b => b.status === 'sent').length;
    const approvedBudgets = budgets.filter(b => b.status === 'approved').length;
    const rejectedBudgets = budgets.filter(b => b.status === 'rejected').length;
    
    const conversionRate = totalBudgets > 0 
      ? ((approvedBudgets / (approvedBudgets + rejectedBudgets)) * 100) || 0 
      : 0;

    const totalProjectValue = projects.reduce((sum, p) => sum + p.value, 0);
    const activeProjects = projects.filter(p => p.stage !== 'finalizado').length;
    
    const totalHoursEstimated = projects.reduce((sum, p) => sum + p.estimatedHours, 0);
    const totalHoursUsed = projects.reduce((sum, p) => sum + p.hoursUsed, 0);
    
    const totalReceived = finances.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.value, 0);
    const totalPending = finances.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.value, 0);
    const totalOverdue = finances.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.value, 0);

    return {
      totalBudgets,
      draftBudgets,
      sentBudgets,
      approvedBudgets,
      conversionRate,
      totalProjectValue,
      activeProjects,
      totalHoursEstimated,
      totalHoursUsed,
      totalReceived,
      totalPending,
      totalOverdue,
    };
  }, [budgets, projects, finances]);

  const recentBudgets = budgets.slice(-3).reverse();
  const activeProjectsList = projects.filter(p => p.stage !== 'finalizado').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-light">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral do {office.name || 'escritório'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Custo/hora</p>
          <p className="text-2xl font-bold">{formatCurrency(officeTotals.hourly)}</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="metric-label">Orçamentos</span>
          </div>
          <p className="metric-value">{stats.totalBudgets}</p>
          <p className="text-xs text-muted-foreground">
            {stats.sentBudgets} aguardando • {stats.draftBudgets} rascunhos
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="metric-label">Conversão</span>
          </div>
          <p className="metric-value">{stats.conversionRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">
            {stats.approvedBudgets} aprovados
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span className="metric-label">Projetos Ativos</span>
          </div>
          <p className="metric-value">{stats.activeProjects}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(stats.totalProjectValue)} total
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="metric-label">Horas</span>
          </div>
          <p className="metric-value">{stats.totalHoursUsed}h</p>
          <p className="text-xs text-muted-foreground">
            de {stats.totalHoursEstimated}h estimadas
          </p>
        </motion.div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="arq-card-success p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Recebido</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalReceived)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="arq-card-amber p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Pendente</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalPending)}</p>
        </motion.div>

        {stats.totalOverdue > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="arq-card p-4 bg-red-50 border-red-200 text-red-900"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Vencido</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalOverdue)}</p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Budgets */}
        <div className="arq-card">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Orçamentos Recentes</h3>
            <button 
              onClick={() => setView('budgets')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentBudgets.length > 0 ? recentBudgets.map(budget => {
              const statusConfig = getStatusConfig(budget.status);
              return (
                <button
                  key={budget.id}
                  onClick={() => {
                    setCurrentBudgetId(budget.id);
                    setView('budget-detail');
                  }}
                  className="w-full p-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{budget.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {budget.client.name || 'Cliente não definido'}
                  </p>
                  <p className="text-sm font-medium mt-1">{formatCurrency(budget.value)}</p>
                </button>
              );
            }) : (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum orçamento ainda</p>
                <button 
                  onClick={() => setView('calculator')}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Criar primeiro orçamento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="arq-card">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Projetos Ativos</h3>
            <button 
              onClick={() => setView('projects')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Ver Kanban <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {activeProjectsList.length > 0 ? activeProjectsList.map(project => {
              const priorityConfig = getPriorityConfig(project.priority);
              const progress = project.estimatedHours > 0 
                ? (project.hoursUsed / project.estimatedHours) * 100 
                : 0;
              
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProjectId(project.id);
                    setView('project-detail');
                  }}
                  className="w-full p-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{project.code}</span>
                    {project.priority !== 'normal' && (
                      <span className={`text-xs ${priorityConfig.textColor}`}>
                        {priorityConfig.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.client}
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{project.hoursUsed}h / {project.estimatedHours}h</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${
                          progress > 100 ? 'bg-red-500' : 
                          progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            }) : (
              <div className="p-8 text-center text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum projeto ativo</p>
                <button 
                  onClick={() => setView('budgets')}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Aprovar um orçamento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="arq-card p-5 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-violet-900 mb-1">Insights da IA</h3>
            <p className="text-sm text-violet-700">
              {stats.activeProjects === 0 
                ? 'Comece criando seu primeiro orçamento na calculadora. A IA irá ajudar em cada etapa do projeto.'
                : stats.conversionRate < 30
                  ? 'Sua taxa de conversão está abaixo da média. Considere revisar os valores ou adicionar mais detalhes às propostas.'
                  : `Excelente! Sua taxa de conversão de ${stats.conversionRate.toFixed(0)}% está acima da média do mercado.`
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
