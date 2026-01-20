import React from 'react';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Calculation, EnvironmentConfig } from '@/types/budget';
import { environmentTypeMultipliers, sizeMultipliers, HOUR_VALUE } from '@/data/pricingData';

interface ResultDisplayProps {
  calculation: Calculation | null;
  selectedService: 'decorexpress' | 'producao' | 'projetexpress';
  extraEnvironments?: number;
  extraEnvironmentPrice?: number;
  projectArea?: number;
  projectType?: 'novo' | 'reforma';
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  calculation,
  selectedService,
  extraEnvironments = 0,
  extraEnvironmentPrice = 1200,
  projectArea,
  projectType,
}) => {
  if (!calculation) return null;

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const efficiencyColor = {
    'Ótimo': 'text-emerald-400',
    'Bom': 'text-amber-400',
    'Reajustar': 'text-red-400',
  };

  return (
    <div className="result-gradient rounded-2xl p-6 md:p-8 text-primary-foreground animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5" />
        </div>
        Orçamento Final
      </h3>

      {/* Environment Details - DECOREXPRESS */}
      {selectedService === 'decorexpress' && calculation.environmentsDetails && (
        <div className="mb-6 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur">
          <div className="text-sm font-semibold mb-3 text-primary-foreground/80">
            Configuração dos Ambientes:
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {calculation.environmentsDetails.map((env) => (
              <div key={env.index} className="p-3 rounded-lg bg-primary-foreground/10">
                <div className="font-bold mb-2 text-amber-400">Ambiente {env.index}</div>
                <div className="text-xs text-primary-foreground/70 mb-1">
                  📍 {environmentTypeMultipliers[env.type].shortName}
                </div>
                <div className="text-xs text-primary-foreground/70 mb-1">
                  📏 {env.size} ({sizeMultipliers[env.size].description})
                </div>
                <div className="text-sm font-bold text-emerald-400 border-t border-primary-foreground/10 pt-2 mt-2">
                  {env.combinedMultiplier.toFixed(2)}x
                </div>
              </div>
            ))}
          </div>
          {calculation.avgMultiplier && (
            <div className="mt-4 pt-4 border-t border-primary-foreground/10 text-center">
              <div className="text-xs text-primary-foreground/60 mb-1">Multiplicador Médio</div>
              <div className="text-2xl font-bold text-amber-400">{calculation.avgMultiplier.toFixed(3)}x</div>
            </div>
          )}
        </div>
      )}

      {/* Info PRODUZEXPRESS */}
      {selectedService === 'producao' && (
        <div className="mb-6 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-primary-foreground/10 text-center">
              <div className="text-xs text-primary-foreground/60 mb-1">Modalidade</div>
              <div className="text-lg font-bold">🏠 Presencial</div>
            </div>
            <div className="p-3 rounded-lg bg-primary-foreground/10 text-center">
              <div className="text-xs text-primary-foreground/60 mb-1">Nível</div>
              <div className="text-sm font-semibold">{calculation.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Values Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* PROJETEXPRESS - Price per m² */}
        {selectedService === 'projetexpress' && calculation.pricePerM2 && (
          <>
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
              <div className="text-xs text-primary-foreground/60 mb-1">Valor por m²</div>
              <div className="text-2xl md:text-3xl font-bold">
                R$ {calculation.pricePerM2.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
              <div className="text-xs text-primary-foreground/60 mb-1">Área Total</div>
              <div className="text-2xl md:text-3xl font-bold">{projectArea} m²</div>
            </div>
          </>
        )}

        <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
          <div className="text-xs text-primary-foreground/60 mb-1">Valor Base</div>
          <div className="text-2xl md:text-3xl font-bold">
            R$ {formatCurrency(calculation.basePrice)}
          </div>
        </div>

        {selectedService === 'decorexpress' && calculation.priceBeforeExtras && (
          <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
            <div className="text-xs text-primary-foreground/60 mb-1">Com Multiplicadores</div>
            <div className="text-2xl md:text-3xl font-bold">
              R$ {formatCurrency(calculation.priceBeforeExtras)}
            </div>
            {calculation.avgMultiplier && (
              <div className="text-xs text-primary-foreground/50 mt-1">
                (Base × {calculation.avgMultiplier.toFixed(2)}x)
              </div>
            )}
          </div>
        )}

        {calculation.extrasTotal > 0 && (
          <div className="p-4 rounded-xl bg-blue-500/20 backdrop-blur border border-blue-400/30">
            <div className="text-xs text-primary-foreground/60 mb-1">Ambientes Extras</div>
            <div className="text-2xl md:text-3xl font-bold">
              + R$ {formatCurrency(calculation.extrasTotal)}
            </div>
            <div className="text-xs text-primary-foreground/50 mt-1">
              ({extraEnvironments} × R$ {extraEnvironmentPrice.toLocaleString('pt-BR')})
            </div>
          </div>
        )}

        {calculation.surveyFeeTotal > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/20 backdrop-blur border border-amber-400/30">
            <div className="text-xs text-primary-foreground/60 mb-1">Taxa de Levantamento</div>
            <div className="text-2xl md:text-3xl font-bold">
              + R$ {formatCurrency(calculation.surveyFeeTotal)}
            </div>
            <div className="text-xs text-primary-foreground/50 mt-1">
              Presencial (Visita + Medição)
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur">
          <div className="text-xs text-primary-foreground/60 mb-1">Valor Total</div>
          <div className="text-2xl md:text-3xl font-bold">
            R$ {formatCurrency(calculation.finalPrice)}
          </div>
        </div>

        {calculation.discount > 0 && (
          <div className="p-4 rounded-xl bg-primary-foreground/20 backdrop-blur border-2 border-primary-foreground/30">
            <div className="text-xs text-primary-foreground/60 mb-1">
              Com Desconto ({(calculation.discount * 100).toFixed(0)}%)
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-400">
              R$ {formatCurrency(calculation.priceWithDiscount)}
            </div>
          </div>
        )}
      </div>

      {/* Tempo Máximo da Arquiteta */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 backdrop-blur border border-amber-400/30">
        <div className="text-center">
          <div className="text-sm text-primary-foreground/70 mb-2 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            HORAS MÁXIMAS PARA ESTE PROJETO
          </div>
          <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
            {(calculation.priceWithDiscount / HOUR_VALUE).toFixed(1)}h
          </div>
          <div className="text-xs text-primary-foreground/50">
            R$ {formatCurrency(calculation.priceWithDiscount)} ÷ R$ {HOUR_VALUE}/hora
          </div>
          <div className="mt-4 pt-4 border-t border-primary-foreground/10">
            <div className="text-xs text-primary-foreground/60 mb-1">Se entregar dentro deste tempo:</div>
            <div className="text-2xl font-bold text-emerald-400">
              ✓ Eficiência Ótima
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
