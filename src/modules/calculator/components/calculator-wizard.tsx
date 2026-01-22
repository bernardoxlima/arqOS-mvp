'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCalculator } from '../hooks/use-calculator';
import type {
  ServiceType,
  ServiceModality,
  PaymentType,
  DecorComplexity,
  ProduzExpressComplexity,
  ProjectType,
  EnvironmentType,
  EnvironmentSize,
  CalculatorInput,
  EnvironmentConfig,
  FinishLevel,
} from '../types';
import { StepService } from './step-service';
import { StepEnvironments } from './step-environments';
import { StepArea } from './step-area';
import { StepOptions } from './step-options';
import { CalculatorResult } from './calculator-result';

export interface WizardState {
  service: ServiceType | null;
  environmentCount: 1 | 2 | 3;
  complexity: DecorComplexity | ProduzExpressComplexity;
  finishLevel: FinishLevel;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments: number;
  projectType: ProjectType;
  projectArea: number;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage: number;
  managementPercent: number;
  displacementFee: number;
  includeManagement: boolean;
}

const initialState: WizardState = {
  service: null,
  environmentCount: 1,
  complexity: 'decor1',
  finishLevel: 'padrao',
  environmentsConfig: [{ type: 'standard', size: 'M', complexity: 'decor1' }],
  extraEnvironments: 0,
  projectType: 'novo',
  projectArea: 50,
  serviceModality: 'presencial',
  paymentType: 'installments',
  discountPercentage: 0,
  managementPercent: 0,
  displacementFee: 0,
  includeManagement: false,
};

const STEP_LABELS = ['1. Servico', '2. Configuracao', '3. Opcoes', '4. Resultado'];

// Helper function to get payment installments
function getPaymentInstallments(paymentType: PaymentType) {
  switch (paymentType) {
    case 'cash':
      return [{ percent: 100, description: 'Pagamento a vista' }];
    case 'installments':
      return [
        { percent: 30, description: 'Entrada (30%)' },
        { percent: 30, description: 'Durante (30%)' },
        { percent: 40, description: 'Na entrega (40%)' },
      ];
    case 'custom':
      return [{ percent: 100, description: 'Pagamento personalizado' }];
    default:
      return [{ percent: 100, description: 'Pagamento' }];
  }
}

// Helper function to generate scope based on wizard state
function generateScope(state: WizardState): string[] {
  const scope: string[] = [];
  const serviceNames: Record<ServiceType, string> = {
    decorexpress: 'DecorExpress',
    produzexpress: 'ProduzExpress',
    projetexpress: 'ProjetExpress',
  };

  if (state.service) {
    scope.push(`Servico: ${serviceNames[state.service]}`);
  }

  if (state.service === 'projetexpress') {
    scope.push(`Area: ${state.projectArea}m²`);
    scope.push(`Tipo: ${state.projectType === 'novo' ? 'Projeto novo' : 'Reforma'}`);
  } else {
    scope.push(`${state.environmentCount} ambiente(s)`);
  }

  scope.push(`Modalidade: ${state.serviceModality === 'presencial' ? 'Presencial' : 'Online'}`);

  if (state.includeManagement && state.service === 'projetexpress') {
    scope.push('Inclui gerenciamento de obra');
  }

  return scope;
}

export function CalculatorWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const { result, isCalculating, error, calculate, reset } = useCalculator();

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const canGoNext = useCallback(() => {
    switch (step) {
      case 0:
        return state.service !== null;
      case 1:
        if (state.service === 'projetexpress') {
          return state.projectArea >= 20 && state.projectArea <= 300;
        }
        return state.environmentsConfig.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  }, [step, state]);

  const handleNext = useCallback(async () => {
    if (step === 2) {
      const input = buildCalculatorInput(state);
      if (input) {
        await calculate(input);
      }
    }
    setStep((prev) => Math.min(prev + 1, 3));
  }, [step, state, calculate]);

  const handleBack = useCallback(() => {
    if (step === 3) {
      reset();
    }
    setStep((prev) => Math.max(prev - 1, 0));
  }, [step, reset]);

  const handleReset = useCallback(() => {
    setState(initialState);
    setStep(0);
    reset();
  }, [reset]);

  const handleGenerateBudget = useCallback(async (): Promise<string | null> => {
    if (!result || !state.service) return null;

    setIsSavingBudget(true);
    try {
      // Map service type to budget service type
      const serviceTypeMap: Record<ServiceType, string> = {
        decorexpress: 'decorexpress',
        produzexpress: 'produzexpress',
        projetexpress: 'projetexpress',
      };

      // Map complexity to complexity level
      const getComplexityLevel = () => {
        if (state.service === 'projetexpress') return 'padrao';
        const complexity = state.complexity;
        if (complexity === 'decor1' || complexity === 'prod1') return 'simples';
        if (complexity === 'decor2') return 'padrao';
        return 'complexo';
      };

      // Get room list from environments config
      const roomList = state.environmentsConfig.map((env, idx) => {
        const typeLabels: Record<EnvironmentType, string> = {
          standard: 'Ambiente padrao',
          medium: 'Ambiente medio',
          high: 'Ambiente complexo',
        };
        return `${typeLabels[env.type] || 'Ambiente'} ${idx + 1}`;
      });

      const budgetData = {
        serviceType: serviceTypeMap[state.service],
        details: {
          area: state.service === 'projetexpress' ? state.projectArea : 0,
          rooms: state.environmentCount,
          room_list: roomList,
          complexity: getComplexityLevel(),
          finish: state.finishLevel,
          modality: state.serviceModality,
          project_type: state.projectType,
        },
        calculation: {
          base_price: result.basePrice,
          multipliers: {
            complexity: 1,
            finish: result.finishMultiplier || 1,
          },
          extras_total: result.extrasTotal || 0,
          survey_fee: result.surveyFeeTotal || 0,
          discount: result.discount,
          final_price: result.priceWithDiscount,
          estimated_hours: result.estimatedHours,
          hour_rate: result.hourRate,
          efficiency: result.efficiency,
          price_per_m2: result.pricePerM2 || 0,
        },
        paymentTerms: {
          // Map calculator paymentType to budget schema paymentType
          type: state.paymentType === 'installments' ? '30_30_40' : state.paymentType === 'cash' ? 'cash' : 'custom',
          installments: getPaymentInstallments(state.paymentType),
          validity_days: 30,
        },
        scope: generateScope(state),
      };

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar orcamento');
      }

      if (data.success && data.data?.id) {
        toast.success('Orcamento criado com sucesso!');
        router.push(`/orcamentos/${data.data.id}`);
        return data.data.id;
      }

      throw new Error('Resposta inesperada da API');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar orcamento');
      return null;
    } finally {
      setIsSavingBudget(false);
    }
  }, [result, state, router]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <div className="flex gap-1">
          {STEP_LABELS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors ${idx <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        <div className="flex gap-4">
          {STEP_LABELS.map((label, idx) => (
            <span
              key={idx}
              className={`text-xs ${idx === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              {label}
            </span>
          ))}
        </div>

        <Card className="p-6">
          {step === 0 && (
            <StepService
              selectedService={state.service}
              onServiceChange={(service) => {
                updateState({
                  service,
                  complexity: service === 'produzexpress' ? 'prod1' : 'decor1',
                  environmentsConfig: [{
                    type: 'standard',
                    size: 'M',
                    complexity: service === 'produzexpress' ? 'prod1' : 'decor1',
                  }],
                });
              }}
            />
          )}

          {step === 1 && state.service === 'projetexpress' && (
            <StepArea
              projectType={state.projectType}
              projectArea={state.projectArea}
              onProjectTypeChange={(projectType) => updateState({ projectType })}
              onProjectAreaChange={(projectArea) => updateState({ projectArea })}
            />
          )}

          {step === 1 && state.service && state.service !== 'projetexpress' && (
            <StepEnvironments
              service={state.service}
              environmentCount={state.environmentCount}
              complexity={state.complexity}
              environmentsConfig={state.environmentsConfig}
              extraEnvironments={state.extraEnvironments}
              onEnvironmentCountChange={(count) => {
                const newConfigs = Array.from({ length: count }, (_, idx) =>
                  state.environmentsConfig[idx] || {
                    type: 'standard' as EnvironmentType,
                    size: 'M' as EnvironmentSize,
                    complexity: state.complexity,
                  }
                );
                updateState({ environmentCount: count, environmentsConfig: newConfigs });
              }}
              onComplexityChange={(complexity) => {
                const updatedConfigs = state.environmentsConfig.map((c) => ({
                  ...c,
                  complexity,
                }));
                updateState({ complexity, environmentsConfig: updatedConfigs });
              }}
              onEnvironmentsConfigChange={(environmentsConfig) => updateState({ environmentsConfig })}
              onExtraEnvironmentsChange={(extraEnvironments) => updateState({ extraEnvironments })}
            />
          )}

          {step === 2 && (
            <StepOptions
              service={state.service}
              serviceModality={state.serviceModality}
              paymentType={state.paymentType}
              finishLevel={state.finishLevel}
              discountPercentage={state.discountPercentage}
              managementPercent={state.managementPercent}
              displacementFee={state.displacementFee}
              includeManagement={state.includeManagement}
              onServiceModalityChange={(serviceModality) => updateState({ serviceModality })}
              onPaymentTypeChange={(paymentType) => updateState({ paymentType })}
              onFinishLevelChange={(finishLevel) => updateState({ finishLevel })}
              onDiscountChange={(discountPercentage) => updateState({ discountPercentage })}
              onManagementPercentChange={(managementPercent) => updateState({ managementPercent })}
              onDisplacementFeeChange={(displacementFee) => updateState({ displacementFee })}
              onIncludeManagementChange={(includeManagement) => updateState({ includeManagement })}
            />
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Resultado do Calculo</h2>
              {isCalculating && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!isCalculating && !error && !result && (
                <p className="text-sm text-muted-foreground">Erro ao calcular. Tente novamente.</p>
              )}
            </div>
          )}
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={step === 0 ? handleReset : handleBack} disabled={isCalculating}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 0 ? 'Limpar' : 'Voltar'}
          </Button>

          {step < 3 && (
            <Button onClick={handleNext} disabled={!canGoNext() || isCalculating}>
              {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
              {step === 2 ? 'Calcular' : 'Continuar'}
            </Button>
          )}

          {step === 3 && result && <Button onClick={handleReset}>Novo Calculo</Button>}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-6">
          <CalculatorResult
            result={result}
            isCalculating={isCalculating}
            onGenerateBudget={handleGenerateBudget}
            isSavingBudget={isSavingBudget}
          />
        </div>
      </div>
    </div>
  );
}

function buildCalculatorInput(state: WizardState): CalculatorInput | null {
  if (!state.service) return null;

  const baseInput = {
    serviceModality: state.serviceModality,
    paymentType: state.paymentType,
    discountPercentage: state.discountPercentage > 0 ? state.discountPercentage : undefined,
    finishLevel: state.finishLevel,
  };

  if (state.service === 'projetexpress') {
    return {
      service: 'projetexpress',
      projectType: state.projectType,
      projectArea: state.projectArea,
      includeManagement: state.includeManagement,
      ...baseInput,
    };
  }

  if (state.service === 'decorexpress') {
    return {
      service: 'decorexpress',
      environmentCount: state.environmentCount,
      complexity: state.complexity as DecorComplexity,
      environmentsConfig: state.environmentsConfig,
      extraEnvironments: state.extraEnvironments > 0 ? state.extraEnvironments : undefined,
      ...baseInput,
    };
  }

  if (state.service === 'produzexpress') {
    return {
      service: 'produzexpress',
      environmentCount: state.environmentCount,
      complexity: state.complexity as ProduzExpressComplexity,
      environmentsConfig: state.environmentsConfig,
      extraEnvironments: state.extraEnvironments > 0 ? state.extraEnvironments : undefined,
      ...baseInput,
    };
  }

  return null;
}
