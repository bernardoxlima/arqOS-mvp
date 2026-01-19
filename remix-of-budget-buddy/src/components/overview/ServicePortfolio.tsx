import React from 'react';
import { services, serviceComparison, ServiceId } from '@/data/companyData';
import { ArrowRight } from 'lucide-react';

interface ServicePortfolioProps {
  onServiceClick: (serviceId: ServiceId) => void;
}

const ServicePortfolio: React.FC<ServicePortfolioProps> = ({ onServiceClick }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Portfolio de Serviços */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">PORTFÓLIO DE SERVIÇOS</h3>
        <p className="text-sm text-muted-foreground mb-6">Clique em cada serviço para ver detalhes, etapas e prazos.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(services).map((service) => (
            <div
              key={service.id}
              onClick={() => onServiceClick(service.id)}
              className={`
                relative p-6 rounded-xl border cursor-pointer transition-all duration-300
                hover:border-foreground hover:shadow-lg hover:-translate-y-1
                ${service.isFeatured 
                  ? 'border-2 border-foreground bg-muted/50' 
                  : 'border-border bg-card'
                }
              `}
            >
              {service.isFeatured && (
                <div className="absolute -top-3 left-6 bg-foreground text-background text-[10px] font-bold tracking-wider px-3 py-1">
                  CARRO-CHEFE
                </div>
              )}
              
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-light tracking-wide">
                  {service.name.replace('EXPRESS', '')}<span className="font-bold">EXPRESS</span>
                </h4>
                <span className="text-[10px] font-semibold bg-muted px-3 py-1 rounded">
                  {service.prazo.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {service.whatIs}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Modalidade</span>
                  <span className="font-medium">{service.modality}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Reuniões</span>
                  <span className="font-medium">{service.meetings}</span>
                </div>
                {service.prazo3d && (
                  <div>
                    <span className="text-muted-foreground block">Prazo 3D</span>
                    <span className="font-medium">{service.prazo3d}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-border pt-3">
                <span className="text-sm font-semibold flex items-center gap-2">
                  VER DETALHES <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela Comparativa */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">COMPARATIVO DE SERVIÇOS</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Serviço</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Para Quem</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Modalidade</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prazo</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {serviceComparison.map((item) => (
                <tr 
                  key={item.service}
                  onClick={() => onServiceClick(item.service.toLowerCase().replace('express', 'express') as ServiceId)}
                  className={`
                    border-b border-border cursor-pointer transition-colors hover:bg-muted/50
                    ${item.featured ? 'bg-muted/30' : ''}
                  `}
                >
                  <td className="py-4 px-4 font-semibold text-sm">{item.service}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.forWho}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.modality}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.prazo}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{item.delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ServicePortfolio;
