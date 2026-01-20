import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone as PhoneIcon,
  FileText,
  Building,
  Instagram,
  MapPin,
  MessageSquare,
  Check,
  X,
  Send,
  Download,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  formatCurrency, 
  formatDate,
  formatDateTime,
  getStatusConfig,
  PAYMENT_OPTIONS,
  SERVICE_TYPES,
  Budget
} from '@/lib/arqexpress-data';

export function BudgetDetailView() {
  const { 
    getCurrentBudget,
    setBudgets,
    budgets,
    setView,
    getTemplate,
    setPendingBudgetId
  } = useArqExpress();

  const budget = getCurrentBudget();
  const [showMoreClient, setShowMoreClient] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!budget) {
    return (
      <div className="p-8 text-center">
        <p>Orçamento não encontrado</p>
        <button onClick={() => setView('budgets')} className="arq-btn-primary mt-4">
          Voltar
        </button>
      </div>
    );
  }

  const template = getTemplate(budget.service);
  const serviceName = SERVICE_TYPES.find(s => s.id === budget.service)?.name || budget.service;
  const statusConfig = getStatusConfig(budget.status);

  const updateBudget = (updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => 
      b.id === budget.id ? { ...b, ...updates } : b
    ));
  };

  const updateClient = (field: keyof Budget['client'], value: string) => {
    updateBudget({
      client: { ...budget.client, [field]: value }
    });
  };

  const toggleScope = (phaseId: string) => {
    const newScope = budget.scope.includes(phaseId)
      ? budget.scope.filter(s => s !== phaseId)
      : [...budget.scope, phaseId];
    updateBudget({ scope: newScope });
  };

  const addHistory = (action: string, note?: string) => {
    updateBudget({
      history: [...budget.history, { date: new Date().toISOString(), action, note }]
    });
  };

  const sendBudget = () => {
    updateBudget({ status: 'sent' });
    addHistory('sent', 'Proposta enviada ao cliente');
  };

  const approveBudget = () => {
    updateBudget({ status: 'approved' });
    addHistory('approved', 'Cliente aprovou a proposta');
    setPendingBudgetId(budget.id);
    setView('project-register');
  };

  const rejectBudget = () => {
    updateBudget({ 
      status: 'rejected',
      rejectionReason: rejectionReason
    });
    addHistory('rejected', rejectionReason || 'Cliente recusou a proposta');
    setShowRejectModal(false);
  };

  const isComplete = budget.client.name && budget.client.email && budget.scope.length > 0;

  const phases = template?.phases.filter(p => p.id !== 'finalizado') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('budgets')} className="arq-btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-light">{budget.code}</h2>
              <span className={`text-xs px-2 py-1 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Criado em {formatDate(budget.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="arq-btn-outline">
            <Download className="w-4 h-4" />
            Baixar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Client Data */}
          <div className="arq-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados do Cliente
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={budget.client.name}
                    onChange={(e) => updateClient('name', e.target.value)}
                    placeholder="Nome do cliente"
                    className="arq-input"
                    disabled={budget.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={budget.client.email}
                    onChange={(e) => updateClient('email', e.target.value)}
                    placeholder="email@cliente.com"
                    className="arq-input"
                    disabled={budget.status !== 'draft'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={budget.client.phone}
                    onChange={(e) => updateClient('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="arq-input"
                    disabled={budget.status !== 'draft'}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={budget.client.document}
                    onChange={(e) => updateClient('document', e.target.value)}
                    placeholder="000.000.000-00"
                    className="arq-input"
                    disabled={budget.status !== 'draft'}
                  />
                </div>
              </div>

              {/* Expandable section */}
              <button
                onClick={() => setShowMoreClient(!showMoreClient)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {showMoreClient ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showMoreClient ? 'Menos informações' : 'Mais informações'}
              </button>

              {showMoreClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        <Building className="w-3 h-3 inline mr-1" />
                        Empresa / Razão Social
                      </label>
                      <input
                        type="text"
                        value={budget.client.company}
                        onChange={(e) => updateClient('company', e.target.value)}
                        className="arq-input"
                        disabled={budget.status !== 'draft'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        <Instagram className="w-3 h-3 inline mr-1" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={budget.client.instagram}
                        onChange={(e) => updateClient('instagram', e.target.value)}
                        placeholder="@usuario"
                        className="arq-input"
                        disabled={budget.status !== 'draft'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Endereço do Projeto
                    </label>
                    <input
                      type="text"
                      value={budget.client.address}
                      onChange={(e) => updateClient('address', e.target.value)}
                      className="arq-input"
                      disabled={budget.status !== 'draft'}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      <MessageSquare className="w-3 h-3 inline mr-1" />
                      Observações sobre o cliente
                    </label>
                    <textarea
                      value={budget.client.notes}
                      onChange={(e) => updateClient('notes', e.target.value)}
                      className="arq-input min-h-[80px]"
                      disabled={budget.status !== 'draft'}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalhes do Projeto
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Serviço</p>
                <p className="font-medium">{serviceName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {budget.calcMode === 'sqm' ? 'Área' : 'Ambientes'}
                </p>
                <p className="font-medium">
                  {budget.calcMode === 'sqm' ? `${budget.area}m²` : `${budget.rooms} amb.`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Complexidade</p>
                <p className="font-medium capitalize">{budget.complexity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Acabamento</p>
                <p className="font-medium capitalize">{budget.finish.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="arq-card">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Escopo da Proposta</h3>
              <p className="text-xs text-muted-foreground">
                Selecione as fases incluídas nesta proposta
              </p>
            </div>
            <div className="p-4 space-y-2">
              {phases.map(phase => (
                <button
                  key={phase.id}
                  onClick={() => budget.status === 'draft' && toggleScope(phase.id)}
                  disabled={budget.status !== 'draft'}
                  className={`w-full p-3 border-2 flex items-center gap-3 transition-colors ${
                    budget.scope.includes(phase.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ borderLeftWidth: 4, borderLeftColor: phase.color }}
                >
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    budget.scope.includes(phase.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  }`}>
                    {budget.scope.includes(phase.id) && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{phase.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {phase.steps.map(s => s.deliverable).join(' • ')}
                    </p>
                  </div>
                </button>
              ))}
              {budget.scope.length === 0 && budget.status === 'draft' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Selecione pelo menos uma fase
                </div>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-4">Condições Comerciais</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={budget.paymentTerms}
                  onChange={(e) => updateBudget({ paymentTerms: e.target.value as any })}
                  className="arq-select"
                  disabled={budget.status !== 'draft'}
                >
                  {PAYMENT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {budget.paymentTerms === 'personalizado' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Condições personalizadas
                  </label>
                  <textarea
                    value={budget.customPaymentTerms || ''}
                    onChange={(e) => updateBudget({ customPaymentTerms: e.target.value })}
                    className="arq-input min-h-[60px]"
                    placeholder="Descreva as condições de pagamento..."
                    disabled={budget.status !== 'draft'}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Validade da proposta (dias)
                  </label>
                  <input
                    type="number"
                    value={budget.validity}
                    onChange={(e) => updateBudget({ validity: Number(e.target.value) })}
                    className="arq-input"
                    disabled={budget.status !== 'draft'}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Observações
                </label>
                <textarea
                  value={budget.notes}
                  onChange={(e) => updateBudget({ notes: e.target.value })}
                  className="arq-input min-h-[80px]"
                  placeholder="Observações adicionais..."
                  disabled={budget.status !== 'draft'}
                />
              </div>
            </div>
          </div>

          {/* History */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-4">Histórico</h3>
            <div className="space-y-3">
              {budget.history.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <p className="text-sm font-medium capitalize">
                    {item.action === 'created' && '📝 Criado'}
                    {item.action === 'sent' && '📤 Enviado'}
                    {item.action === 'approved' && '✅ Aprovado'}
                    {item.action === 'rejected' && '❌ Recusado'}
                    {item.action === 'followup' && '📞 Follow-up'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.date)}</p>
                  {item.note && <p className="text-sm text-muted-foreground mt-1">{item.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-4">
          {/* Value Summary */}
          <div className="arq-card-dark p-5 sticky top-4">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Valor Total
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(budget.value)}</p>
            <p className="text-sm text-muted-foreground mb-4">{serviceName}</p>
            
            <div className="space-y-2 text-sm pt-4 border-t border-muted">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {budget.calcMode === 'sqm' ? 'Área' : 'Ambientes'}
                </span>
                <span>{budget.calcMode === 'sqm' ? `${budget.area}m²` : `${budget.rooms}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horas estimadas
                </span>
                <span>{budget.estimatedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo estimado</span>
                <span>{formatCurrency(budget.hourCost * budget.estimatedHours)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Lucro previsto</span>
                <span>{formatCurrency(budget.profit)}</span>
              </div>
            </div>
          </div>

          {/* Checklist (draft only) */}
          {budget.status === 'draft' && (
            <div className="arq-card p-4">
              <h4 className="font-medium mb-3">Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {budget.client.name ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span>Nome do cliente</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {budget.client.email ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span>Email do cliente</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {budget.scope.length > 0 ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span>Escopo definido</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {budget.status === 'draft' && (
              <button
                onClick={sendBudget}
                disabled={!isComplete}
                className="arq-btn-primary w-full"
              >
                <Send className="w-4 h-4" />
                Salvar e Enviar Proposta
              </button>
            )}

            {budget.status === 'sent' && (
              <>
                <button
                  onClick={approveBudget}
                  className="arq-btn w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                  Cliente Aprovou
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="arq-btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Cliente Recusou
                </button>
                <button
                  onClick={() => addHistory('followup', 'Follow-up realizado')}
                  className="arq-btn-ghost w-full"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Registrar Follow-up
                </button>
              </>
            )}

            {budget.status === 'approved' && budget.projectId && (
              <button
                onClick={() => setView('projects')}
                className="arq-btn-primary w-full"
              >
                <FileText className="w-4 h-4" />
                Ver Projeto
              </button>
            )}

            {budget.status === 'rejected' && (
              <div className="arq-card p-4 bg-red-50 border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">Motivo da recusa:</p>
                <p className="text-sm text-red-700">
                  {budget.rejectionReason || 'Não informado'}
                </p>
              </div>
            )}
          </div>

          {/* AI Actions */}
          <div className="arq-card p-4 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-800">IAs de Apoio</span>
            </div>
            <div className="space-y-2">
              <button className="w-full arq-btn-ghost text-sm text-violet-700 justify-start">
                ✨ Gerar texto da proposta
              </button>
              <button className="w-full arq-btn-ghost text-sm text-violet-700 justify-start">
                📧 Redigir email de envio
              </button>
              <button className="w-full arq-btn-ghost text-sm text-violet-700 justify-start">
                📋 Sugerir escopo ideal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 max-w-md w-full mx-4 rounded-lg"
          >
            <h3 className="font-medium mb-4">Registrar Recusa</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motivo da recusa (opcional)"
              className="arq-input min-h-[100px] mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="arq-btn-ghost"
              >
                Cancelar
              </button>
              <button
                onClick={rejectBudget}
                className="arq-btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirmar Recusa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Phone(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
