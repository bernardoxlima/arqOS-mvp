import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  SERVICE_TYPES,
  COMPLEXITY_FACTORS,
  FINISH_FACTORS,
  formatCurrency,
  getTemplateHours,
  generateBudgetCode,
  ComplexityId,
  FinishId,
  Room,
  Budget,
  CalculatorState
} from '@/lib/arqexpress-data';

const ROOM_SIZES = [
  { id: 'P' as const, label: 'P', name: 'Pequeno', desc: 'até 12m²' },
  { id: 'M' as const, label: 'M', name: 'Médio', desc: '12-25m²' },
  { id: 'G' as const, label: 'G', name: 'Grande', desc: 'acima 25m²' },
];

export function CalculatorView() {
  const { 
    office, 
    officeTotals, 
    getTemplate, 
    roomPricing,
    budgets,
    setBudgets,
    setView,
    setCurrentBudgetId
  } = useArqExpress();

  const [calc, setCalc] = useState<CalculatorState>({
    service: '',
    calcMode: 'sqm',
    area: 0,
    rooms: 0,
    roomList: [],
    complexity: 'padrao',
    finish: 'padrao',
  });

  // Calculate values
  const calculations = useMemo(() => {
    if (!calc.service) return null;

    const template = getTemplate(calc.service);
    if (!template) return null;

    const baseHours = getTemplateHours(template);
    const baseArea = template.baseRef.area;
    const complexFactor = COMPLEXITY_FACTORS[calc.complexity].factor;
    const finishFactor = FINISH_FACTORS[calc.finish].factor;

    let estimatedHours = 0;
    let baseValue = 0;

    if (calc.calcMode === 'sqm' && calc.area > 0) {
      // Calculate by square meters
      const areaFactor = calc.area / baseArea;
      estimatedHours = Math.round(baseHours * areaFactor * complexFactor);
    } else if (calc.calcMode === 'room' && calc.roomList.length > 0) {
      // Calculate by rooms
      const pricing = roomPricing[calc.service as keyof typeof roomPricing];
      if (pricing) {
        baseValue = calc.roomList.reduce((sum, room) => {
          return sum + (pricing[room.size] || 0);
        }, 0);
      }
      estimatedHours = Math.round(
        calc.roomList.length * (baseHours / template.baseRef.rooms) * complexFactor
      );
    }

    const hourCost = officeTotals.hourly;
    const costValue = estimatedHours * hourCost;
    
    // Reference prices
    const minPrice = costValue * 2;
    const adequatePrice = costValue * 2.5;
    const idealPrice = costValue * 3;
    
    // Final value with margin
    const marginMultiplier = 1 + (office.margin / 100);
    let finalValue = calc.calcMode === 'room' && baseValue > 0 
      ? baseValue * finishFactor 
      : costValue * marginMultiplier * finishFactor;

    // Ensure minimum price
    if (finalValue < minPrice) {
      finalValue = minPrice;
    }

    const profit = finalValue - costValue;
    const hourlyRate = estimatedHours > 0 ? finalValue / estimatedHours : 0;
    const sqmPrice = calc.area > 0 ? finalValue / calc.area : 0;
    
    // Health indicator
    const priceMultiplier = costValue > 0 ? finalValue / costValue : 0;
    let healthStatus: 'danger' | 'warning' | 'good' = 'good';
    if (priceMultiplier < 2) healthStatus = 'danger';
    else if (priceMultiplier < 2.5) healthStatus = 'warning';

    return {
      estimatedHours,
      hourCost,
      costValue,
      minPrice,
      adequatePrice,
      idealPrice,
      finalValue,
      profit,
      hourlyRate,
      sqmPrice,
      priceMultiplier,
      healthStatus,
      template,
    };
  }, [calc, office.margin, officeTotals.hourly, getTemplate, roomPricing]);

  const activeServices = SERVICE_TYPES.filter(s => office.services.includes(s.id as any));
  const selectedService = SERVICE_TYPES.find(s => s.id === calc.service);

  const addRoom = () => {
    setCalc(prev => ({
      ...prev,
      roomList: [...prev.roomList, { id: Date.now(), name: 'Ambiente ' + (prev.roomList.length + 1), size: 'M' }]
    }));
  };

  const updateRoom = (id: number, updates: Partial<Room>) => {
    setCalc(prev => ({
      ...prev,
      roomList: prev.roomList.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const removeRoom = (id: number) => {
    setCalc(prev => ({
      ...prev,
      roomList: prev.roomList.filter(r => r.id !== id)
    }));
  };

  const generateBudget = () => {
    if (!calculations) return;

    const newBudget: Budget = {
      id: Date.now(),
      code: generateBudgetCode(budgets.length),
      status: 'draft',
      createdAt: new Date().toISOString(),
      service: calc.service as any,
      calcMode: calc.calcMode,
      area: calc.area,
      rooms: calc.roomList.length,
      roomList: calc.roomList,
      complexity: calc.complexity,
      finish: calc.finish,
      estimatedHours: calculations.estimatedHours,
      value: calculations.finalValue,
      hourCost: calculations.hourCost,
      profit: calculations.profit,
      client: {
        name: '',
        email: '',
        phone: '',
        document: '',
        company: '',
        instagram: '',
        address: '',
        notes: '',
      },
      scope: calculations.template.phases
        .filter(p => p.id !== 'finalizado')
        .map(p => p.id),
      notes: '',
      paymentTerms: '50_50',
      validity: 15,
      history: [{ date: new Date().toISOString(), action: 'created', note: 'Orçamento criado via calculadora' }],
    };

    setBudgets(prev => [...prev, newBudget]);
    setCurrentBudgetId(newBudget.id);
    setView('budget-detail');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light">Calculadora de Orçamentos</h2>
        <p className="text-sm text-muted-foreground">
          Calcule valores baseados no custo real do seu escritório
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Inputs */}
        <div className="col-span-7 space-y-6">
          {/* Service Selection */}
          <div className="arq-card p-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
              1. Selecione o Serviço
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setCalc(prev => ({ 
                    ...prev, 
                    service: s.id,
                    calcMode: s.calcMode === 'sqm' ? 'sqm' : 'sqm'
                  }))}
                  className={`p-3 border-2 text-left transition-colors ${
                    calc.service === s.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium text-sm">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Mode (for services that support both) */}
          {selectedService?.calcMode === 'both' && (
            <div className="arq-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
                2. Modo de Cálculo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalc(prev => ({ ...prev, calcMode: 'sqm' }))}
                  className={`toggle-option flex-1 ${
                    calc.calcMode === 'sqm' ? 'toggle-option-active' : 'toggle-option-inactive'
                  }`}
                >
                  Por m²
                </button>
                <button
                  onClick={() => setCalc(prev => ({ ...prev, calcMode: 'room' }))}
                  className={`toggle-option flex-1 ${
                    calc.calcMode === 'room' ? 'toggle-option-active' : 'toggle-option-inactive'
                  }`}
                >
                  Por Ambiente
                </button>
              </div>
            </div>
          )}

          {/* Area/Rooms Input */}
          {calc.service && (
            <div className="arq-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
                {selectedService?.calcMode === 'both' ? '3.' : '2.'} Dados do Projeto
              </label>
              
              {calc.calcMode === 'sqm' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={calc.area || ''}
                    onChange={(e) => setCalc(prev => ({ ...prev, area: Number(e.target.value) }))}
                    placeholder="0"
                    className="arq-input w-32 text-lg text-center"
                  />
                  <span className="text-muted-foreground">m²</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {calc.roomList.map((room, idx) => (
                    <div key={room.id} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                        className="arq-input flex-1"
                        placeholder="Nome do ambiente"
                      />
                      <div className="flex gap-1">
                        {ROOM_SIZES.map(size => (
                          <button
                            key={size.id}
                            onClick={() => updateRoom(room.id, { size: size.id })}
                            className={`w-8 h-8 text-xs font-medium border-2 transition-colors ${
                              room.size === size.id
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border hover:border-primary/50'
                            }`}
                            title={`${size.name} (${size.desc})`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="p-1.5 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addRoom} className="arq-btn-outline w-full">
                    <Plus className="w-4 h-4" />
                    Adicionar Ambiente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Complexity */}
          {calc.service && (
            <div className="arq-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
                Complexidade
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(COMPLEXITY_FACTORS).map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => setCalc(prev => ({ ...prev, complexity: id as ComplexityId }))}
                    className={`p-3 border-2 text-center transition-colors ${
                      calc.complexity === id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{config.label}</div>
                    <div className="text-xs opacity-70">{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Finish */}
          {calc.service && (
            <div className="arq-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-3">
                Acabamento
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(FINISH_FACTORS).map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => setCalc(prev => ({ ...prev, finish: id as FinishId }))}
                    className={`p-3 border-2 text-center transition-colors ${
                      calc.finish === id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{config.label}</div>
                    <div className="text-xs opacity-70">{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="col-span-5 space-y-4">
          {calculations ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Hours Card */}
              <div className="arq-card-amber p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Horas Estimadas</span>
                </div>
                <div className="text-3xl font-bold">{calculations.estimatedHours}h</div>
                <div className="text-sm mt-2">
                  Custo das horas: <strong>{formatCurrency(calculations.costValue)}</strong>
                </div>
              </div>

              {/* Reference Prices */}
              <div className="arq-card p-4">
                <div className="text-xs font-medium uppercase tracking-wide mb-3">
                  Referência de Precificação
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Mínimo (2x custo)
                    </span>
                    <span className="font-medium">{formatCurrency(calculations.minPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Adequado (2.5x)
                    </span>
                    <span className="font-medium">{formatCurrency(calculations.adequatePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Ideal (3x custo)
                    </span>
                    <span className="font-medium">{formatCurrency(calculations.idealPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Final Value */}
              <div className="arq-card-dark p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Valor do Projeto
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    calculations.healthStatus === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                    calculations.healthStatus === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {calculations.priceMultiplier.toFixed(1)}x custo
                  </span>
                </div>
                <div className="text-4xl font-bold mb-1">
                  {formatCurrency(calculations.finalValue)}
                </div>
                {calc.calcMode === 'sqm' && calc.area > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(calculations.sqmPrice)}/m²
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-muted space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Custo (horas)</span>
                    <span>{formatCurrency(calculations.costValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margem ({office.margin}%)</span>
                    <span>+{formatCurrency(calculations.finalValue - calculations.costValue)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Lucro estimado</span>
                    <span>{formatCurrency(calculations.profit)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>R$/hora de venda</span>
                    <span>{formatCurrency(calculations.hourlyRate)}</span>
                  </div>
                </div>

                <button
                  onClick={generateBudget}
                  className="w-full mt-4 arq-btn bg-white text-black hover:bg-white/90"
                >
                  Gerar Orçamento
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* AI Suggestion */}
              <div className="arq-card p-4 bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-medium text-violet-800">Sugestão IA</span>
                </div>
                <p className="text-sm text-violet-700">
                  Para um projeto de {calc.calcMode === 'sqm' ? `${calc.area}m²` : `${calc.roomList.length} ambientes`} 
                  {' '}com complexidade {COMPLEXITY_FACTORS[calc.complexity].label.toLowerCase()}, 
                  considere adicionar uma margem para revisões e imprevistos.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="arq-card p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Configure o projeto</h3>
              <p className="text-sm text-muted-foreground">
                Selecione um serviço e preencha os dados para ver o cálculo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
