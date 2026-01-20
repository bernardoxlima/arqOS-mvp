import React from 'react';
import { cn } from '@/lib/utils';
import { Laptop, Home as HomeIcon, Building, ClipboardList } from 'lucide-react';
import { projetExpressPricing } from '@/data/pricingData';

interface ProjetConfigProps {
  projectArea: number;
  setProjectArea: (value: number) => void;
  projectType: 'novo' | 'reforma';
  setProjectType: (value: 'novo' | 'reforma') => void;
  serviceModality: 'online' | 'presencial';
  setServiceModality: (value: 'online' | 'presencial') => void;
  surveyFee: number;
  setSurveyFee: (value: number) => void;
  paymentType: 'cash' | 'installments';
  setPaymentType: (value: 'cash' | 'installments') => void;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
  includeManagement: boolean;
  setIncludeManagement: (value: boolean) => void;
  managementFee: number;
  setManagementFee: (value: number) => void;
}

const ProjetConfig: React.FC<ProjetConfigProps> = ({
  projectArea,
  setProjectArea,
  projectType,
  setProjectType,
  serviceModality,
  setServiceModality,
  surveyFee,
  setSurveyFee,
  paymentType,
  setPaymentType,
  discountPercentage,
  setDiscountPercentage,
  includeManagement,
  setIncludeManagement,
  managementFee,
  setManagementFee,
}) => {
  let step = 1;

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm">
          🏗️
        </span>
        Configuração do Projeto
      </h3>

      {/* Tipo de Projeto */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {step++}. Tipo de Projeto
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setProjectType('novo')}
            className={cn(
              "p-5 rounded-xl border-2 transition-all text-center",
              projectType === 'novo'
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <Building className="w-7 h-7 mx-auto mb-2 text-foreground" />
            <div className="font-bold text-foreground">Apartamento NOVO</div>
            <div className="text-xs text-muted-foreground mt-1">Projeto do zero</div>
          </button>
          <button
            onClick={() => setProjectType('reforma')}
            className={cn(
              "p-5 rounded-xl border-2 transition-all text-center",
              projectType === 'reforma'
                ? "border-accent bg-accent/10 shadow-sm"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <HomeIcon className="w-7 h-7 mx-auto mb-2 text-foreground" />
            <div className="font-bold text-foreground">Apartamento REFORMA</div>
            <div className="text-xs text-muted-foreground mt-1">Renovação existente</div>
          </button>
        </div>
      </div>

      {/* Área do Projeto */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {step++}. Área Total (m²)
        </label>
        <div className="space-y-4">
          <input
            type="range"
            min="20"
            max="300"
            value={projectArea}
            onChange={(e) => setProjectArea(Number(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20m²</span>
            <span className="text-lg font-bold text-foreground">{projectArea} m²</span>
            <span>300m²</span>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="text-xs text-muted-foreground mb-2">
              Faixas de preço para {projetExpressPricing[projectType].name}:
            </div>
            {projetExpressPricing[projectType].ranges.map((range, idx) => {
              const isActive = projectArea >= range.min && projectArea <= range.max;
              return (
                <div key={idx} className={cn(
                  "text-xs py-1 px-2 rounded mb-1",
                  isActive ? "bg-accent/20 text-foreground font-semibold" : "text-muted-foreground"
                )}>
                  {range.min}-{range.max}m²: R$ {range.pricePerM2}/m²
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modalidade */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {step++}. Modalidade do Serviço
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
          </div>
        )}
      </div>

      {/* Gerenciamento de Obra */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {step++}. Gerenciamento de Obra
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIncludeManagement(false)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              !includeManagement
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <div className="font-semibold text-foreground">Sem Gerenciamento</div>
            <div className="text-xs text-muted-foreground mt-1">Apenas projeto</div>
          </button>
          <button
            onClick={() => setIncludeManagement(true)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-center",
              includeManagement
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <ClipboardList className="w-6 h-6 mx-auto mb-2 text-foreground" />
            <div className="font-semibold text-foreground">Com Gerenciamento</div>
            <div className="text-xs text-muted-foreground mt-1">A partir de R$ 1.500/mês</div>
          </button>
        </div>
        
        {includeManagement && (
          <div className="mt-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <label className="block text-xs font-semibold text-foreground mb-2">
              Valor Mensal do Gerenciamento (mínimo R$ 1.500/mês)
            </label>
            <input
              type="number"
              min="1500"
              step="100"
              value={managementFee}
              onChange={(e) => setManagementFee(Math.max(1500, Number(e.target.value)))}
              className="w-full p-3 bg-card border border-accent/30 rounded-lg text-center font-bold focus:ring-2 focus:ring-accent transition-all"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              * Valor cobrado mensalmente durante o acompanhamento da obra
            </p>
          </div>
        )}
      </div>

      {/* Forma de Pagamento */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {step++}. Forma de Pagamento
        </label>
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
          </button>
        </div>
        
        {paymentType === 'cash' && (
          <div className="mt-3 p-4 rounded-xl bg-success/10 border border-success/20">
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

export default ProjetConfig;
