import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Check,
  Percent,
  Users,
  Building,
  Briefcase,
  DollarSign,
  Target
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  ROLES, 
  SERVICE_TYPES, 
  formatCurrency,
  RoleId 
} from '@/lib/arqexpress-data';

const STEPS = [
  { id: 1, label: 'Tamanho', icon: Building },
  { id: 2, label: 'Nome', icon: Briefcase },
  { id: 3, label: 'Equipe', icon: Users },
  { id: 4, label: 'Custos', icon: DollarSign },
  { id: 5, label: 'Serviços', icon: Briefcase },
  { id: 6, label: 'Margem', icon: Target },
];

const OFFICE_SIZES = [
  { id: 'solo', name: 'Solo', desc: '1 pessoa' },
  { id: 'small', name: 'Pequeno', desc: '2-5 pessoas' },
  { id: 'medium', name: 'Médio', desc: '6-15 pessoas' },
  { id: 'large', name: 'Grande', desc: '16+ pessoas' },
] as const;

const COST_FIELDS = [
  { key: 'rent', label: 'Aluguel' },
  { key: 'utilities', label: 'Contas (luz, água)' },
  { key: 'software', label: 'Softwares' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'accountant', label: 'Contador' },
  { key: 'internet', label: 'Internet' },
  { key: 'others', label: 'Outros' },
] as const;

export function SetupWizard() {
  const { 
    setView, 
    setupStep, 
    setSetupStep, 
    office, 
    setOffice,
    officeTotals 
  } = useArqExpress();

  const canProceed = () => {
    switch (setupStep) {
      case 1: return !!office.size;
      case 2: return office.name.length > 0;
      case 3: return office.team.length > 0;
      case 5: return office.services.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (setupStep < 6) {
      setSetupStep(setupStep + 1);
    } else {
      setView('templates');
    }
  };

  const handleBack = () => {
    if (setupStep > 1) {
      setSetupStep(setupStep - 1);
    }
  };

  const addTeamMember = () => {
    setOffice(prev => ({
      ...prev,
      team: [
        ...prev.team,
        { id: Date.now(), name: '', role: 'junior' as RoleId, salary: 2000, hours: 160 }
      ]
    }));
  };

  const updateTeamMember = (id: number, updates: Partial<typeof office.team[0]>) => {
    setOffice(prev => ({
      ...prev,
      team: prev.team.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const removeTeamMember = (id: number) => {
    if (office.team.length > 1) {
      setOffice(prev => ({
        ...prev,
        team: prev.team.filter(m => m.id !== id)
      }));
    }
  };

  const toggleService = (serviceId: string) => {
    setOffice(prev => ({
      ...prev,
      services: prev.services.includes(serviceId as any)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId as any]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <h1 className="text-sm tracking-widest-xl font-semibold">ARQEXPRESS</h1>
          <div className="flex items-center gap-1">
            {STEPS.map(s => (
              <div 
                key={s.id}
                className={`wizard-step ${setupStep >= s.id ? 'wizard-step-active' : 'wizard-step-inactive'}`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Step Labels */}
      <div className="max-w-3xl mx-auto px-8 pt-6">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map(s => (
            <span 
              key={s.id}
              className={setupStep === s.id ? 'text-foreground font-semibold' : ''}
            >
              {s.id}. {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={setupStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Size */}
            {setupStep === 1 && (
              <div>
                <h2 className="text-2xl font-light mb-8">Qual o tamanho do seu escritório?</h2>
                <div className="grid grid-cols-2 gap-4">
                  {OFFICE_SIZES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setOffice(prev => ({ ...prev, size: s.id }))}
                      className={`size-card ${office.size === s.id ? 'size-card-active' : 'size-card-inactive'}`}
                    >
                      <h3 className="font-semibold text-lg">{s.name}</h3>
                      <p className="text-sm opacity-70">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Name */}
            {setupStep === 2 && (
              <div>
                <h2 className="text-2xl font-light mb-8">Nome do escritório</h2>
                <input
                  type="text"
                  value={office.name}
                  onChange={(e) => setOffice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Studio Arquitetura"
                  className="arq-input max-w-md text-lg py-3"
                  autoFocus
                />
              </div>
            )}

            {/* Step 3: Team */}
            {setupStep === 3 && (
              <div>
                <h2 className="text-2xl font-light mb-4">Monte sua equipe</h2>
                
                {/* Role legend */}
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-card border border-border">
                  {Object.entries(ROLES).map(([id, r]) => (
                    <div key={id} className="flex items-center gap-1.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: r.color }} 
                      />
                      <span className="text-xs">{r.name}</span>
                    </div>
                  ))}
                </div>

                {/* Team members */}
                <div className="space-y-2">
                  {office.team.map((member) => (
                    <div 
                      key={member.id}
                      className="team-member-row"
                      style={{ borderLeftWidth: 4, borderLeftColor: ROLES[member.role]?.color }}
                    >
                      <input
                        type="text"
                        value={member.name}
                        placeholder="Nome"
                        onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                        className="arq-input flex-1"
                      />
                      <select
                        value={member.role}
                        onChange={(e) => {
                          const role = e.target.value as RoleId;
                          updateTeamMember(member.id, { 
                            role, 
                            salary: ROLES[role]?.salary || 0,
                            hours: ROLES[role]?.hours || 160
                          });
                        }}
                        className="arq-select w-36"
                      >
                        {Object.entries(ROLES).map(([id, r]) => (
                          <option key={id} value={id}>{r.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">R$</span>
                        <input
                          type="number"
                          value={member.salary || ''}
                          onChange={(e) => updateTeamMember(member.id, { salary: Number(e.target.value) })}
                          className="arq-input w-24"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={member.hours || ''}
                          onChange={(e) => updateTeamMember(member.id, { hours: Number(e.target.value) })}
                          className="arq-input w-16 text-center"
                        />
                        <span className="text-muted-foreground text-xs">h/mês</span>
                      </div>
                      {office.team.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="p-2 hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addTeamMember}
                  className="arq-btn-outline mt-3"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Membro
                </button>

                {/* Summary */}
                <div className="mt-6 p-4 arq-card-dark grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Folha</p>
                    <p className="text-lg font-bold">{formatCurrency(officeTotals.salaries)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Horas/mês</p>
                    <p className="text-lg font-bold">{officeTotals.hours}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Custo/hora</p>
                    <p className="text-lg font-bold">{formatCurrency(officeTotals.hourly)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Costs */}
            {setupStep === 4 && (
              <div>
                <h2 className="text-2xl font-light mb-6">Custos fixos mensais</h2>
                <div className="space-y-3 max-w-lg">
                  {COST_FIELDS.map(({ key, label }) => (
                    <div key={key} className="cost-input-row">
                      <label className="text-sm w-32 text-right">{label}</label>
                      <span className="text-muted-foreground">R$</span>
                      <input
                        type="number"
                        value={office.costs[key as keyof typeof office.costs] || ''}
                        onChange={(e) => setOffice(prev => ({
                          ...prev,
                          costs: { ...prev.costs, [key]: Number(e.target.value) }
                        }))}
                        placeholder="0"
                        className="arq-input flex-1"
                      />
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-8 max-w-lg">
                  <div className="p-5 arq-card-dark grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Folha</p>
                      <p className="text-lg font-bold">{formatCurrency(officeTotals.salaries)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custos</p>
                      <p className="text-lg font-bold">{formatCurrency(officeTotals.costs)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{formatCurrency(officeTotals.monthly)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">R$/Hora</p>
                      <p className="text-lg font-bold">{formatCurrency(officeTotals.hourly)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    💡 R$/Hora = (Folha + Custos) ÷ Horas da equipe = {formatCurrency(officeTotals.monthly)} ÷ {officeTotals.hours}h = {formatCurrency(officeTotals.hourly)}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Services */}
            {setupStep === 5 && (
              <div>
                <h2 className="text-2xl font-light mb-6">Serviços oferecidos</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os tipos de projeto que seu escritório realiza
                </p>
                <div className="space-y-2">
                  {SERVICE_TYPES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={`w-full p-4 border-2 text-left flex justify-between items-center transition-colors ${
                        office.services.includes(s.id as any)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-medium">{s.name}</span>
                      {office.services.includes(s.id as any) && (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Margin */}
            {setupStep === 6 && (
              <div>
                <h2 className="text-2xl font-light mb-2">Margem de Lucro</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Defina o percentual de lucro que deseja ter sobre seus projetos
                </p>

                <div className="max-w-lg">
                  <div className="bg-card border border-border p-6 mb-6">
                    <label className="text-sm font-medium block mb-3">
                      Margem de Lucro Desejada
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={office.margin}
                        onChange={(e) => setOffice(prev => ({ ...prev, margin: Number(e.target.value) }))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex items-center gap-1 arq-card-dark px-4 py-2 min-w-[100px] justify-center">
                        <span className="text-2xl font-bold">{office.margin}</span>
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>10% (mínimo)</span>
                      <span>50% (recomendado)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="arq-card-amber p-4 mb-6">
                    <p className="text-sm font-medium mb-2">💡 O que é a Margem de Lucro?</p>
                    <p className="text-sm">
                      É o percentual que você adiciona sobre o <strong>custo das horas</strong> para 
                      formar o preço do projeto. Uma margem de {office.margin}% significa que a cada 
                      R$ 100 de custo, você cobrará R$ {(100 * (1 + office.margin / 100)).toFixed(0)}.
                    </p>
                  </div>

                  {/* Tabela de referência simples - sem inventar escopo */}
                  <div className="arq-card-dark p-5">
                    <p className="text-xs text-muted-foreground mb-3">TABELA DE REFERÊNCIA (por hora)</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between pb-2 border-b border-muted/30">
                        <span className="text-muted-foreground">Seu custo/hora</span>
                        <span className="font-semibold">{formatCurrency(officeTotals.hourly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">+ Margem ({office.margin}%)</span>
                        <span className="text-amber-400">+{formatCurrency(officeTotals.hourly * (office.margin / 100))}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-muted">
                        <span className="font-semibold">Valor/hora para cobrar</span>
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(officeTotals.hourly * (1 + office.margin / 100))}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4 mb-2">MULTIPLICADORES</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-background/10 rounded">
                        <p className="text-muted-foreground">10 horas</p>
                        <p className="font-semibold">{formatCurrency(officeTotals.hourly * 10 * (1 + office.margin / 100))}</p>
                      </div>
                      <div className="p-2 bg-background/10 rounded">
                        <p className="text-muted-foreground">50 horas</p>
                        <p className="font-semibold">{formatCurrency(officeTotals.hourly * 50 * (1 + office.margin / 100))}</p>
                      </div>
                      <div className="p-2 bg-background/10 rounded">
                        <p className="text-muted-foreground">100 horas</p>
                        <p className="font-semibold">{formatCurrency(officeTotals.hourly * 100 * (1 + office.margin / 100))}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 italic">
                    ⏱️ Os valores de projeto serão calculados após você configurar as etapas de cada serviço.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          {setupStep > 1 ? (
            <button onClick={handleBack} className="arq-btn-ghost">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="arq-btn-primary"
          >
            {setupStep < 6 ? 'CONTINUAR' : 'CONFIGURAR SERVIÇOS'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
