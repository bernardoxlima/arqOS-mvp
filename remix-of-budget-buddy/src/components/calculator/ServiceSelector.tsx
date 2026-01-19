import React from 'react';
import { Home, Wrench, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceType = 'decorexpress' | 'producao' | 'projetexpress';

interface ServiceSelectorProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

const services = [
  {
    id: 'decorexpress' as ServiceType,
    name: 'DECOREXPRESS',
    description: 'Decoração e ambientação',
    icon: Home,
  },
  {
    id: 'producao' as ServiceType,
    name: 'PRODUZEXPRESS',
    description: 'Produção e execução',
    icon: Wrench,
  },
  {
    id: 'projetexpress' as ServiceType,
    name: 'PROJETEXPRESS',
    description: 'Projeto de apartamento',
    icon: FileText,
  },
];

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ selectedService, onServiceChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {services.map((service) => {
        const Icon = service.icon;
        const isSelected = selectedService === service.id;
        
        return (
          <button
            key={service.id}
            onClick={() => onServiceChange(service.id)}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-lg"
                : "glass-card-hover border-transparent hover:border-accent/30"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all",
              isSelected 
                ? "bg-primary-foreground/20" 
                : "bg-secondary group-hover:bg-accent/10"
            )}>
              <Icon className={cn(
                "w-6 h-6",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )} />
            </div>
            
            <h3 className="text-lg font-bold mb-1">{service.name}</h3>
            <p className={cn(
              "text-sm",
              isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {service.description}
            </p>

            {isSelected && (
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-accent animate-scale-in" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ServiceSelector;
