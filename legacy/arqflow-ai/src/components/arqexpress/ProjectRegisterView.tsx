import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  Calendar,
  User,
  Users,
  Clock,
  DollarSign,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  formatCurrency, 
  formatDate,
  SERVICE_TYPES,
  generateProjectCode,
  Project,
  ScheduleItem
} from '@/lib/arqexpress-data';

export function ProjectRegisterView() {
  const { 
    pendingBudgetId,
    budgets,
    setBudgets,
    projects,
    setProjects,
    office,
    getTemplate,
    setView,
    setPendingBudgetId,
    finances,
    setFinances
  } = useArqExpress();

  const budget = budgets.find(b => b.id === pendingBudgetId);
  
  const [architect, setArchitect] = useState<number | null>(null);
  const [team, setTeam] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<Project['priority']>('normal');
  const [notes, setNotes] = useState('');

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
  const scopePhases = template?.phases.filter(p => budget.scope.includes(p.id)) || [];

  // Generate schedule based on hours and phases
  const generateSchedule = (): ScheduleItem[] => {
    // Parse date correctly without timezone issues
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    
    const schedule: ScheduleItem[] = [];
    const hoursPerDay = 8;
    const daysPerPhase = Math.ceil(budget.estimatedHours / scopePhases.length / hoursPerDay);
    
    schedule.push({
      date: start.toISOString(),
      type: 'start',
      phase: 'inicio',
      description: 'Início do projeto - Pagamento confirmado'
    });

    let currentDate = new Date(start);
    scopePhases.forEach((phase, index) => {
      currentDate.setDate(currentDate.getDate() + daysPerPhase);
      schedule.push({
        date: currentDate.toISOString(),
        type: index === scopePhases.length - 1 ? 'end' : 'delivery',
        phase: phase.id,
        description: `Entrega: ${phase.name}`
      });
    });

    return schedule;
  };

  const createProject = () => {
    if (!architect) return;

    const projectCode = generateProjectCode(budget.service, projects.length);
    const schedule = generateSchedule();
    const endDate = schedule[schedule.length - 1]?.date || startDate;

    const newProject: Project = {
      id: Date.now(),
      code: projectCode,
      client: budget.client.name,
      clientEmail: budget.client.email,
      clientPhone: budget.client.phone,
      service: budget.service,
      serviceName,
      value: budget.value,
      estimatedHours: budget.estimatedHours,
      architect,
      team,
      deadline: endDate,
      priority,
      stage: scopePhases[0]?.id || 'briefing',
      scope: budget.scope,
      schedule,
      entries: [],
      comments: [],
      hoursUsed: 0,
      budgetId: budget.id,
      startDate,
      createdAt: new Date().toISOString(),
      notes: notes || budget.client.notes,
    };

    // Create finance records based on payment terms
    const paymentOption = budget.paymentTerms;
    const paymentSplits = paymentOption === '50_50' ? [0.5, 0.5] :
                          paymentOption === '30_30_40' ? [0.3, 0.3, 0.4] :
                          paymentOption === '40_30_30' ? [0.4, 0.3, 0.3] :
                          paymentOption === 'a_vista' ? [0.95] : [0.5, 0.5];

    const newFinances = paymentSplits.map((split, index) => {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + (index * 30));
      
      return {
        id: Date.now() + index,
        type: 'income' as const,
        description: `${projectCode} - Parcela ${index + 1}/${paymentSplits.length} (${(split * 100).toFixed(0)}%)`,
        value: budget.value * split,
        date: startDate,
        dueDate: dueDate.toISOString().split('T')[0],
        status: index === 0 ? 'paid' as const : 'pending' as const,
        projectId: newProject.id,
        projectCode,
        client: budget.client.name,
        installment: `${index + 1}/${paymentSplits.length}`
      };
    });

    // Update state
    setProjects(prev => [...prev, newProject]);
    setFinances(prev => [...prev, ...newFinances]);
    setBudgets(prev => prev.map(b => 
      b.id === budget.id 
        ? { ...b, projectId: newProject.id, projectCode } 
        : b
    ));
    setPendingBudgetId(null);
    setView('finances');
  };

  const isValid = architect !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => {
          setPendingBudgetId(null);
          setView('budgets');
        }} className="arq-btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-light">Cadastro do Projeto</h2>
            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
              ✓ Proposta Aprovada
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {budget.code} • {budget.client.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Client Info */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-3">Cliente</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{budget.client.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{budget.client.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium">{budget.client.phone || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Serviço</p>
                <p className="font-medium">{serviceName}</p>
              </div>
            </div>
          </div>

          {/* Architect Selection */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              Arquiteto Responsável *
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Selecione o responsável principal pelo projeto
            </p>
            
            {office.team.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {office.team.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setArchitect(member.id)}
                    className={`p-3 border-2 text-center transition-colors ${
                      architect === member.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-1">
                      <span className="text-sm font-medium">
                        {member.name?.[0] || '?'}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{member.name || 'Sem nome'}</p>
                    <p className="text-xs opacity-70">{member.role}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Nenhum membro na equipe. Cadastre primeiro em Configurações.
              </div>
            )}
          </div>

          {/* Support Team */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe de Apoio
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Opcional - selecione outros membros que apoiarão
            </p>
            
            <div className="flex flex-wrap gap-2">
              {office.team
                .filter(m => m.id !== architect)
                .map(member => (
                  <button
                    key={member.id}
                    onClick={() => setTeam(prev => 
                      prev.includes(member.id) 
                        ? prev.filter(id => id !== member.id)
                        : [...prev, member.id]
                    )}
                    className={`px-3 py-1.5 border-2 text-sm flex items-center gap-2 transition-colors ${
                      team.includes(member.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {team.includes(member.id) && <Check className="w-3 h-3" />}
                    {member.name || 'Sem nome'}
                  </button>
                ))
              }
            </div>
          </div>

          {/* Schedule */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Prazo e Cronograma
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Data de Início (pagamento)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="arq-input"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Project['priority'])}
                  className="arq-select"
                >
                  <option value="baixa">🟢 Baixa</option>
                  <option value="normal">🔵 Normal</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="urgente">🔴 Urgente</option>
                </select>
              </div>
            </div>

            {/* Auto Schedule Preview */}
            <div className="arq-card-dark p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                AGENDA DE ENTREGAS
              </p>
              <p className="text-sm font-medium mb-1">{budget.client.name}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {serviceName} • {budget.calcMode === 'sqm' ? `${budget.area}m²` : `${budget.rooms} amb.`}
              </p>
              
              <div className="space-y-3">
                {generateSchedule().map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="text-xs text-muted-foreground w-20">
                      {formatDate(item.date)}
                    </div>
                    <div>
                      <span className="mr-2">
                        {item.type === 'start' ? '🚀' : 
                         item.type === 'end' ? '🏁' : '●'}
                      </span>
                      <span className={
                        item.type === 'start' ? 'font-medium' :
                        item.type === 'end' ? 'font-bold text-emerald-400' :
                        ''
                      }>
                        {item.type === 'start' ? 'INÍCIO DO PROJETO' :
                         item.type === 'end' ? 'ENTREGA FINAL' :
                         `ENTREGA: ${item.description.replace('Entrega: ', '').toUpperCase()}`}
                      </span>
                      {item.type === 'start' && (
                        <p className="text-xs text-muted-foreground ml-6">
                          Pagamento confirmado
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="arq-card p-4">
            <h3 className="font-medium mb-3">Observações</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções adicionais para o projeto..."
              className="arq-input min-h-[100px]"
            />
            {budget.client.notes && (
              <div className="mt-3 p-3 bg-muted text-sm">
                <p className="text-xs text-muted-foreground mb-1">Observações do orçamento:</p>
                <p>{budget.client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-4">
          {/* Value Summary */}
          <div className="arq-card-dark p-5 sticky top-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Valor do Projeto
            </p>
            <p className="text-3xl font-bold mb-4">{formatCurrency(budget.value)}</p>
            
            <div className="space-y-2 text-sm pt-4 border-t border-muted">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horas estimadas
                </span>
                <span>{budget.estimatedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de pagamento</span>
                <span className="text-right text-xs">
                  {budget.paymentTerms === '50_50' ? '50% + 50%' :
                   budget.paymentTerms === '30_30_40' ? '30% + 30% + 40%' :
                   budget.paymentTerms === '40_30_30' ? '40% + 30% + 30%' :
                   budget.paymentTerms === 'a_vista' ? 'À vista' :
                   'Personalizado'}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Lucro previsto</span>
                <span>{formatCurrency(budget.profit)}</span>
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="arq-card p-4">
            <h4 className="font-medium mb-3">Escopo</h4>
            <div className="space-y-1">
              {scopePhases.map(phase => (
                <div 
                  key={phase.id}
                  className="flex items-center gap-2 text-sm"
                  style={{ borderLeft: `3px solid ${phase.color}`, paddingLeft: 8 }}
                >
                  {phase.name}
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="arq-card p-4">
            <h4 className="font-medium mb-3">Checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {architect ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span>Arquiteto responsável</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Prazo definido</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="arq-card-info p-4">
            <h4 className="font-medium mb-2">📋 Próximos passos:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Lançar parcelas no Financeiro</li>
              <li>Confirmar pagamento da entrada</li>
              <li>Projeto aparece no Kanban</li>
            </ol>
          </div>

          {/* Actions */}
          <button
            onClick={createProject}
            disabled={!isValid}
            className="arq-btn-primary w-full"
          >
            <DollarSign className="w-4 h-4" />
            Criar Projeto e Ir para Financeiro
          </button>

          <button
            onClick={() => {
              setPendingBudgetId(null);
              setView('budgets');
            }}
            className="arq-btn-ghost w-full"
          >
            Cancelar
          </button>

          {/* AI */}
          <div className="arq-card p-4 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-800">IA de Apoio</span>
            </div>
            <button className="w-full arq-btn-ghost text-sm text-violet-700 justify-start">
              ✨ Gerar cronograma detalhado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
