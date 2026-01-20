import React, { useState } from 'react';
import { services, processSteps, ServiceId } from '@/data/companyData';
import { Check, X, ArrowLeft } from 'lucide-react';
import ScheduleGenerator from './ScheduleGenerator';

interface ServiceDetailProps {
  serviceId: ServiceId;
  onBack: () => void;
  onGoToCalculator: () => void;
}

type SubTab = 'etapas' | 'agenda' | 'escopo';

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, onBack, onGoToCalculator }) => {
  const service = services[serviceId];
  const steps = processSteps[serviceId];
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('etapas');
  const [modality, setModality] = useState<'online' | 'presencial'>('online');

  const currentSteps = steps.online && steps.presencial 
    ? (modality === 'online' ? steps.online : steps.presencial)
    : steps.default;

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'etapas', label: 'ETAPAS DO PROCESSO' },
    { id: 'agenda', label: 'AGENDA DE ENTREGAS' },
    { id: 'escopo', label: 'ESCOPO DO SERVIÇO' }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header do Serviço */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Visão Geral
        </button>

        <div className="border-b border-border pb-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {service.name.replace('EXPRESS', '')}<span className="font-light">EXPRESS</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">"{service.tagline}"</p>
          <span className="inline-block bg-foreground text-background text-xs font-semibold tracking-wider px-4 py-2">
            {service.badge}
          </span>
        </div>

        {/* Para quem é / O que é */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">PARA QUEM É</h3>
            <div className="bg-muted/50 rounded-xl p-4">
              <ul className="space-y-2">
                {service.forWho.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">O QUE É</h3>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm mb-4">{service.whatIs}</p>
              <div className="bg-foreground text-background rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">ENTREGA</p>
                <p className="text-sm font-medium">{service.delivery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-0 border-b border-border mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              px-6 py-3 text-xs font-semibold uppercase tracking-wider relative transition-colors
              ${activeSubTab === tab.id 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.label}
            {activeSubTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das Sub Tabs */}
      {activeSubTab === 'etapas' && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          {/* Seletor de Modalidade (se aplicável) */}
          {steps.online && steps.presencial && (
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setModality('online')}
                className={`
                  px-8 py-3 text-sm font-semibold uppercase tracking-wider border-2 transition-all
                  ${modality === 'online' 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-background text-foreground border-border hover:border-muted-foreground'
                  }
                `}
              >
                ONLINE
              </button>
              <button
                onClick={() => setModality('presencial')}
                className={`
                  px-8 py-3 text-sm font-semibold uppercase tracking-wider border-2 transition-all
                  ${modality === 'presencial' 
                    ? 'bg-foreground text-background border-foreground' 
                    : 'bg-background text-foreground border-border hover:border-muted-foreground'
                  }
                `}
              >
                PRESENCIAL
              </button>
            </div>
          )}

          {/* Etapas */}
          <div className="space-y-0">
            {currentSteps?.map((step, index) => (
              <div
                key={index}
                className={`
                  grid grid-cols-[60px_1fr_100px] gap-5 py-6 border-b border-border
                  ${step.isHighlight ? 'bg-foreground text-background -mx-6 px-6 border-none' : ''}
                `}
              >
                <div className={`
                  w-14 h-14 flex items-center justify-center font-bold text-xl rounded-lg flex-shrink-0
                  ${step.isHighlight ? 'bg-background text-foreground' : 'bg-foreground text-background'}
                `}>
                  {step.number}
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{step.title}</h3>
                  <p className={`text-sm ${step.isHighlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                  {step.detail && (
                    <div className={`
                      mt-3 p-3 text-xs border-l-2
                      ${step.isHighlight 
                        ? 'bg-foreground/80 border-background/50 text-background/70' 
                        : 'bg-muted/50 border-foreground text-muted-foreground'
                      }
                    `}>
                      {step.detail}
                    </div>
                  )}
                </div>
                {step.prazo && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{step.prazo.value}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${step.isHighlight ? 'text-background/60' : 'text-muted-foreground'}`}>
                      {step.prazo.label}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'agenda' && (
        <ScheduleGenerator serviceId={serviceId} />
      )}

      {activeSubTab === 'escopo' && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">O QUE ESTÁ INCLUSO</h3>
              <div className="bg-muted/50 rounded-xl p-4">
                <ul className="space-y-2">
                  {service.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm border-b border-border pb-2 last:border-none last:pb-0">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {service.notIncludes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">O QUE NÃO ESTÁ INCLUSO</h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {service.notIncludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground border-b border-border pb-2 last:border-none last:pb-0">
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {service.additionalInfo && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">ADICIONAL (VALOR EXTRA)</h3>
                <div className="bg-muted/50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {service.additionalInfo.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm border-b border-border pb-2 last:border-none last:pb-0">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-muted border-l-2 border-foreground text-xs text-muted-foreground">
                    <strong className="text-foreground">Precisa de mais do que isso?</strong> Indicamos o DECOREXPRESS para uma transformação completa.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão para calculadora */}
          <div className="bg-foreground text-background rounded-xl p-6 text-center">
            <h3 className="text-xs uppercase tracking-widest opacity-60 mb-2">QUER CALCULAR O VALOR?</h3>
            <p className="mb-4">Acesse a calculadora de precificação para este serviço.</p>
            <button
              onClick={onGoToCalculator}
              className="px-8 py-3 bg-background text-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              IR PARA CALCULADORA →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
