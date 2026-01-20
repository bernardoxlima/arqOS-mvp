import React from 'react';
import { cn } from '@/lib/utils';
import { Laptop, Home as HomeIcon, Plus, Minus } from 'lucide-react';
import type { EnvironmentConfig } from '@/types/budget';
import { 
  decorExpressPricing, 
  producaoPricing, 
  environmentTypeMultipliers, 
  sizeMultipliers 
} from '@/data/pricingData';

interface DecorConfigProps {
  selectedService: 'decorexpress' | 'producao';
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  environmentsConfig: EnvironmentConfig[];
  updateEnvironmentsCount: (count: string) => void;
  updateEnvironmentConfig: (index: number, field: keyof EnvironmentConfig, value: string) => void;
  extraEnvironments: number;
  setExtraEnvironments: (value: number) => void;
  extraEnvironmentPrice: number;
  setExtraEnvironmentPrice: (value: number) => void;
  serviceModality: 'online' | 'presencial';
  setServiceModality: (value: 'online' | 'presencial') => void;
  surveyFee: number;
  setSurveyFee: (value: number) => void;
  paymentType: 'cash' | 'installments';
  setPaymentType: (value: 'cash' | 'installments') => void;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
}

const DecorConfig: React.FC<DecorConfigProps> = ({
  selectedService,
  selectedSize,
  setSelectedSize,
  environmentsConfig,
  updateEnvironmentsCount,
  updateEnvironmentConfig,
  extraEnvironments,
  setExtraEnvironments,
  extraEnvironmentPrice,
  setExtraEnvironmentPrice,
  serviceModality,
  setServiceModality,
  surveyFee,
  setSurveyFee,
  paymentType,
  setPaymentType,
  discountPercentage,
  setDiscountPercentage,
}) => {
  const pricing = selectedService === 'decorexpress' ? decorExpressPricing : producaoPricing;
  const complexityOptions = selectedService === 'decorexpress'
    ? [
        { key: 'decor1', label: 'Nível 1', desc: 'Decoração Simples' },
        { key: 'decor2', label: 'Nível 2', desc: '+ Marcenaria/Iluminação' },
        { key: 'decor3', label: 'Nível 3', desc: '+ Civil + Marc + Ilum' },
      ]
    : [
        { key: 'prod1', label: 'Simples', desc: 'Produção básica' },
        { key: 'prod3', label: 'Completa', desc: 'Produção completa' },
      ];

  const stepNumber = { current: 1 };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
          ⚙️
        </span>
        Configuração do Serviço
      </h3>

      {/* Quantidade de Ambientes */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {stepNumber.current++}. Quantidade de Ambientes
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(pricing).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedSize(key);
                updateEnvironmentsCount(key);
                if (parseInt(key) < 3) setExtraEnvironments(0);
              }}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                selectedSize === key
                  ? "border-accent bg-accent/10 shadow-sm"
                  : "border-border hover:border-accent/50 bg-card"
              )}
            >
              <div className="text-2xl font-bold text-foreground mb-1">{key}</div>
              <div className="text-xs text-muted-foreground">{value.baseRange}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuração Individual dos Ambientes */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {stepNumber.current++}. Configuração Individual dos Ambientes
        </label>
        <div className="space-y-3">
          {environmentsConfig.map((env, index) => (
            <div key={index} className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full accent-gradient flex items-center justify-center text-xs font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <span className="font-medium text-foreground text-sm">Ambiente {index + 1}</span>
              </div>
              
              {/* Nível de Complexidade por Ambiente */}
              <div className="mb-3">
                <label className="block text-xs text-muted-foreground mb-2">Nível de Complexidade</label>
                <div className={cn(
                  "grid gap-2",
                  selectedService === 'decorexpress' ? "grid-cols-3" : "grid-cols-2"
                )}>
                  {complexityOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => updateEnvironmentConfig(index, 'complexity', option.key)}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all text-center text-xs",
                        env.complexity === option.key
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50 bg-card"
                      )}
                    >
                      <div className="font-semibold text-foreground">{option.label}</div>
                      <div className="text-[10px] text-muted-foreground">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo e Tamanho - apenas para DECOREXPRESS */}
              {selectedService === 'decorexpress' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                    <select
                      value={env.type}
                      onChange={(e) => updateEnvironmentConfig(index, 'type', e.target.value)}
                      className="w-full p-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent transition-all"
                    >
                      {Object.entries(environmentTypeMultipliers).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.shortName} ({value.multiplier}x)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tamanho</label>
                    <select
                      value={env.size}
                      onChange={(e) => updateEnvironmentConfig(index, 'size', e.target.value)}
                      className="w-full p-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent transition-all"
                    >
                      {Object.entries(sizeMultipliers).map(([key, value]) => (
                        <option key={key} value={key}>
                          {key} - {value.description} ({value.multiplier}x)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ambientes Extras (se 3 ambientes) */}
      {selectedSize === '3' && (
        <div className="p-4 rounded-xl bg-info/5 border border-info/20">
          <label className="block text-sm font-semibold text-foreground mb-3">
            {stepNumber.current++}. Ambientes Extras (acima de 3)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Quantidade</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExtraEnvironments(Math.max(0, extraEnvironments - 1))}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-xl font-bold text-foreground">{extraEnvironments}</span>
                <button
                  onClick={() => setExtraEnvironments(Math.min(10, extraEnvironments + 1))}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Preço por Extra</label>
              <select
                value={extraEnvironmentPrice}
                onChange={(e) => setExtraEnvironmentPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-card border border-border rounded-lg font-semibold focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="1200">R$ 1.200</option>
                <option value="1500">R$ 1.500</option>
              </select>
            </div>
          </div>
          {extraEnvironments > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-info/10 text-center">
              <span className="text-sm font-semibold text-info">
                Total Extras: R$ {(extraEnvironments * extraEnvironmentPrice).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modalidade - DECOREXPRESS */}
      {selectedService === 'decorexpress' && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            {stepNumber.current++}. Modalidade do Serviço
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setServiceModality('online')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                serviceModality === 'online'
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 bg-card"
              )}
            >
              <Laptop className="w-6 h-6 mx-auto mb-2 text-foreground" />
              <div className="font-semibold text-foreground">Online</div>
              <div className="text-xs text-muted-foreground mt-1">Sem custo adicional</div>
            </button>
            <button
              onClick={() => setServiceModality('presencial')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                serviceModality === 'presencial'
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 bg-card"
              )}
            >
              <HomeIcon className="w-6 h-6 mx-auto mb-2 text-foreground" />
              <div className="font-semibold text-foreground">Presencial</div>
              <div className="text-xs text-muted-foreground mt-1">+ Taxa levantamento</div>
            </button>
          </div>
          
          {serviceModality === 'presencial' && (
            <div className="mt-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <label className="block text-xs font-semibold text-foreground mb-2">
                Taxa de Levantamento e Medição
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={surveyFee}
                onChange={(e) => setSurveyFee(Number(e.target.value))}
                className="w-full p-3 bg-card border border-warning/30 rounded-lg text-center font-bold focus:ring-2 focus:ring-warning transition-all"
              />
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Inclui visita técnica, levantamento e medição (~4h)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info PRODUZEXPRESS */}
      {selectedService === 'producao' && (
        <div className="p-4 rounded-xl bg-muted text-center">
          <span className="text-sm font-medium text-muted-foreground">
            🏠 PRODUZEXPRESS é sempre realizado <strong className="text-foreground">presencialmente</strong>
          </span>
        </div>
      )}

      {/* Forma de Pagamento */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {stepNumber.current++}. Forma de Pagamento
        </label>
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-3 text-center">
          <span className="text-sm font-medium text-foreground">
            💳 Total em 10x ou com desconto à vista
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentType('cash')}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              paymentType === 'cash'
                ? "border-success bg-success/10"
                : "border-border hover:border-success/50 bg-card"
            )}
          >
            <div className="font-bold text-foreground">À Vista</div>
            <div className="text-xs text-muted-foreground mt-1">PIX/Dinheiro</div>
            <div className="text-xs text-success font-semibold mt-1">{discountPercentage}% desconto</div>
          </button>
          <button
            onClick={() => setPaymentType('installments')}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              paymentType === 'installments'
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <div className="font-bold text-foreground">Parcelado</div>
            <div className="text-xs text-muted-foreground mt-1">Até 10x</div>
            <div className="text-xs text-muted-foreground mt-1">Sem juros</div>
          </button>
        </div>
        
        {paymentType === 'cash' && (
          <div className="mt-3 p-4 rounded-xl bg-success/10 border border-success/20">
            <label className="block text-xs font-semibold text-foreground mb-2 text-center">
              💰 Porcentagem de Desconto
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => setDiscountPercentage(percentage)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    discountPercentage === percentage
                      ? "border-success bg-success text-success-foreground"
                      : "border-success/30 hover:border-success bg-card"
                  )}
                >
                  <div className="text-xl font-bold">{percentage}%</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecorConfig;
