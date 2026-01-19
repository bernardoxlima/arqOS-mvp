import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Search,
  ArrowUpRight,
  User,
  Mail,
  Phone,
  Clock,
  DollarSign
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { formatCurrency, formatDate, getStatusConfig, SERVICE_TYPES } from '@/lib/arqexpress-data';

type StatusFilter = 'all' | 'draft' | 'sent' | 'approved' | 'rejected';

export function BudgetsListView() {
  const { 
    budgets, 
    setView, 
    setCurrentBudgetId 
  } = useArqExpress();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBudgets = useMemo(() => {
    return budgets
      .filter(b => statusFilter === 'all' || b.status === statusFilter)
      .filter(b => 
        searchQuery === '' || 
        b.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [budgets, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const draft = budgets.filter(b => b.status === 'draft').length;
    const sent = budgets.filter(b => b.status === 'sent').length;
    const approved = budgets.filter(b => b.status === 'approved').length;
    const rejected = budgets.filter(b => b.status === 'rejected').length;
    
    const totalValue = budgets.reduce((sum, b) => sum + b.value, 0);
    const pendingValue = budgets.filter(b => b.status === 'sent').reduce((sum, b) => sum + b.value, 0);
    const approvedValue = budgets.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.value, 0);
    const conversionRate = (approved + rejected) > 0 
      ? (approved / (approved + rejected)) * 100 
      : 0;

    return { draft, sent, approved, rejected, totalValue, pendingValue, approvedValue, conversionRate };
  }, [budgets]);

  const statusFilters: { id: StatusFilter; label: string; count: number; color: string }[] = [
    { id: 'all', label: 'Todos', count: budgets.length, color: 'bg-muted' },
    { id: 'draft', label: '📝 Rascunhos', count: stats.draft, color: 'bg-amber-100' },
    { id: 'sent', label: '📤 Enviadas', count: stats.sent, color: 'bg-blue-100' },
    { id: 'approved', label: '✅ Aprovadas', count: stats.approved, color: 'bg-emerald-100' },
    { id: 'rejected', label: '❌ Recusadas', count: stats.rejected, color: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-light">Orçamentos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie propostas e acompanhe conversões
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

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.id
                ? 'bg-primary text-primary-foreground'
                : `${filter.color} hover:opacity-80`
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                statusFilter === filter.id ? 'bg-white/20' : 'bg-black/10'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente ou código..."
          className="arq-input pl-10"
        />
      </div>

      {/* Budgets Grid */}
      {filteredBudgets.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredBudgets.map((budget, index) => {
            const statusConfig = getStatusConfig(budget.status);
            const serviceName = SERVICE_TYPES.find(s => s.id === budget.service)?.name || budget.service;

            return (
              <motion.button
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setCurrentBudgetId(budget.id);
                  setView('budget-detail');
                }}
                className="arq-card p-4 text-left hover:border-primary/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {budget.client.name ? budget.client.name[0].toUpperCase() : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{budget.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(budget.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{budget.client.name || 'Cliente não definido'}</span>
                  </div>
                  {budget.client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{budget.client.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">{serviceName}</p>
                    <p className="text-sm">
                      {budget.calcMode === 'sqm' ? `${budget.area}m²` : `${budget.rooms} ambientes`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {budget.estimatedHours}h
                    </p>
                    <p className="font-semibold">{formatCurrency(budget.value)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex justify-end">
                  {budget.status === 'draft' && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      Continuar editando <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                  {budget.status === 'sent' && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      Aguardando resposta <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                  {budget.status === 'approved' && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      Ver projeto <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                  {budget.status === 'rejected' && (
                    <span className="text-xs text-muted-foreground">
                      {budget.rejectionReason || 'Sem motivo informado'}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="arq-card p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">
            {searchQuery || statusFilter !== 'all' 
              ? 'Nenhum orçamento encontrado' 
              : 'Nenhum orçamento ainda'
            }
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Crie seu primeiro orçamento na calculadora'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button onClick={() => setView('calculator')} className="arq-btn-primary">
              <Plus className="w-4 h-4" />
              Criar Orçamento
            </button>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="arq-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Total em Propostas</p>
            <p className="text-xl font-bold">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="arq-card p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-600 mb-1">Aguardando Resposta</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(stats.pendingValue)}</p>
          </div>
          <div className="arq-card p-4 bg-emerald-50 border-emerald-200">
            <p className="text-xs text-emerald-600 mb-1">Convertido</p>
            <p className="text-xl font-bold text-emerald-900">{formatCurrency(stats.approvedValue)}</p>
          </div>
          <div className="arq-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
            <p className="text-xl font-bold">{stats.conversionRate.toFixed(0)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
