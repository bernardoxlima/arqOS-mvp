'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCalculator } from '../hooks/use-calculator';
import type {
  ServiceType,
  ServiceModality,
  PaymentType,
  DecorComplexity,
  ProducaoComplexity,
  ProjectType,
  EnvironmentType,
  EnvironmentSize,
  CalculatorInput,
  EnvironmentConfig,
} from '../types';
import { StepService } from './step-service';
import { StepEnvironments } from './step-environments';
import { StepArea } from './step-area';
import { StepOptions } from './step-options';
import { CalculatorResult } from './calculator-result';

export interface WizardState {
  service: ServiceType | null;
  environmentCount: 1 | 2 | 3;
  complexity: DecorComplexity | ProducaoComplexity;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments: number;
  projectType: ProjectType;
  projectArea: number;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage: number;
  includeManagement: boolean;
}

const initialState: WizardState = {
  service: null,
  environmentCount: 1,
  complexity: 'decor1',
  environmentsConfig: [{ type: 'standard', size: 'M', complexity: 'decor1' }],
  extraEnvironments: 0,
  projectType: 'novo',
  projectArea: 50,
  serviceModality: 'presencial',
  paymentType: 'installments',
  discountPercentage: 0,
  includeManagement: false,
};

const STEP_LABELS = ['1. Servico', '2. Configuracao', '3. Opcoes', '4. Resultado'];

export function CalculatorWizard() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
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
                  complexity: service === 'producao' ? 'prod1' : 'decor1',
                  environmentsConfig: [{
                    type: 'standard',
                    size: 'M',
                    complexity: service === 'producao' ? 'prod1' : 'decor1',
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
              discountPercentage={state.discountPercentage}
              includeManagement={state.includeManagement}
              onServiceModalityChange={(serviceModality) => updateState({ serviceModality })}
              onPaymentTypeChange={(paymentType) => updateState({ paymentType })}
              onDiscountChange={(discountPercentage) => updateState({ discountPercentage })}
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
          <CalculatorResult result={result} service={state.service} isCalculating={isCalculating} />
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

  if (state.service === 'producao') {
    return {
      service: 'producao',
      environmentCount: state.environmentCount,
      complexity: state.complexity as ProducaoComplexity,
      environmentsConfig: state.environmentsConfig,
      extraEnvironments: state.extraEnvironments > 0 ? state.extraEnvironments : undefined,
      ...baseInput,
    };
  }

  return null;
}
