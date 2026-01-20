import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { formatCurrency, formatDate } from '@/lib/arqexpress-data';

export function FinancesView() {
  const { finances, setFinances, projects } = useArqExpress();

  const stats = useMemo(() => {
    const totalSold = finances.reduce((sum, f) => sum + f.value, 0);
    const received = finances.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.value, 0);
    const pending = finances.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.value, 0);
    
    // Check for overdue
    const today = new Date();
    const overdueRecords = finances.filter(f => 
      f.status === 'pending' && new Date(f.dueDate) < today
    );
    const overdue = overdueRecords.reduce((sum, f) => sum + f.value, 0);
    
    // Next 30 days
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    const upcoming = finances.filter(f => 
      f.status === 'pending' && 
      new Date(f.dueDate) >= today && 
      new Date(f.dueDate) <= next30
    ).reduce((sum, f) => sum + f.value, 0);

    return { totalSold, received, pending, overdue, upcoming, overdueCount: overdueRecords.length };
  }, [finances]);

  const markAsPaid = (id: number) => {
    setFinances(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'paid' as const } : f
    ));
  };

  // Group by project
  const groupedFinances = useMemo(() => {
    const groups: Record<number, typeof finances> = {};
    finances.forEach(f => {
      if (!groups[f.projectId]) groups[f.projectId] = [];
      groups[f.projectId].push(f);
    });
    return groups;
  }, [finances]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light">Financeiro</h2>
        <p className="text-sm text-muted-foreground">
          Controle de receitas e parcelas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-card"
        >
          <span className="metric-label">Total Vendido</span>
          <p className="metric-value">{formatCurrency(stats.totalSold)}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="arq-card-success p-4"
        >
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">Recebido</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            {formatCurrency(stats.received)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="arq-card-amber p-4"
        >
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {formatCurrency(stats.pending)}
          </p>
        </motion.div>

        {stats.overdue > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="arq-card p-4 bg-red-50 border-red-200"
          >
            <div className="flex items-center gap-1 text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Vencido</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(stats.overdue)}
            </p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="metric-card"
        >
          <span className="metric-label">Próximos 30 dias</span>
          <p className="metric-value">{formatCurrency(stats.upcoming)}</p>
        </motion.div>
      </div>

      {/* Overdue Alert */}
      {stats.overdueCount > 0 && (
        <div className="arq-card p-4 bg-red-50 border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">
            <strong>{stats.overdueCount} parcelas vencidas</strong> totalizando{' '}
            <strong>{formatCurrency(stats.overdue)}</strong>
          </p>
        </div>
      )}

      {/* Finances by Project */}
      {Object.keys(groupedFinances).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedFinances).map(([projectId, records]) => {
            const project = projects.find(p => p.id === Number(projectId));
            const projectTotal = records.reduce((sum, r) => sum + r.value, 0);
            const projectReceived = records.filter(r => r.status === 'paid')
              .reduce((sum, r) => sum + r.value, 0);
            const progressPercent = projectTotal > 0 
              ? (projectReceived / projectTotal) * 100 
              : 0;

            return (
              <div key={projectId} className="arq-card">
                {/* Project Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {records[0]?.projectCode || project?.code} • {records[0]?.client || project?.client}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(projectReceived)} de {formatCurrency(projectTotal)} recebido
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="progress-bar h-2">
                      <div 
                        className="progress-fill bg-emerald-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {progressPercent.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Installments */}
                <div className="divide-y divide-border">
                  {records
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map(record => {
                      const isOverdue = record.status === 'pending' && 
                        new Date(record.dueDate) < new Date();

                      return (
                        <div 
                          key={record.id}
                          className="p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              record.status === 'paid' ? 'bg-emerald-100' :
                              isOverdue ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                              {record.status === 'paid' ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              ) : isOverdue ? (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{record.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Vencimento: {formatDate(record.dueDate)}
                                {isOverdue && (
                                  <span className="text-red-600 ml-2">• Vencido</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold text-lg">
                              {formatCurrency(record.value)}
                            </p>
                            {record.status === 'pending' && (
                              <button
                                onClick={() => markAsPaid(record.id)}
                                className="arq-btn-primary text-sm py-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Marcar Recebido
                              </button>
                            )}
                            {record.status === 'paid' && (
                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                ✓ Recebido
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="arq-card p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Nenhum registro financeiro</h3>
          <p className="text-sm text-muted-foreground">
            Os registros aparecem após criar um projeto
          </p>
        </div>
      )}
    </div>
  );
}
