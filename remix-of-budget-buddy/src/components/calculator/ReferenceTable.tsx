import React from 'react';
import { FileText } from 'lucide-react';
import { 
  decorExpressPricing, 
  producaoPricing, 
  projetExpressPricing,
  environmentTypeMultipliers,
  sizeMultipliers 
} from '@/data/pricingData';

const ReferenceTable: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        Tabela de Referência Completa
      </h3>

      {/* DECOREXPRESS */}
      <div className="mb-8">
        <h4 className="font-bold text-foreground mb-3 text-lg">DECOREXPRESS - Política de Preços</h4>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Ambientes</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Faixa Base</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Decor 1</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Decor 2</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Decor 3</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(decorExpressPricing).map(([key, value]) => (
                <tr key={key} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-semibold text-foreground border-b border-border">{value.name}</td>
                  <td className="p-3 text-muted-foreground border-b border-border">{value.baseRange}</td>
                  <td className="p-3 text-foreground border-b border-border">R$ {value.decor1.price} ({value.decor1.hours}h)</td>
                  <td className="p-3 text-foreground border-b border-border">R$ {value.decor2.price} ({value.decor2.hours}h)</td>
                  <td className="p-3 text-foreground border-b border-border">R$ {value.decor3.price} ({value.decor3.hours}h)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUZEXPRESS */}
      <div className="mb-8">
        <h4 className="font-bold text-foreground mb-3 text-lg">PRODUZEXPRESS - Política de Preços</h4>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Ambientes</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Faixa Base</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Produção Simples</th>
                <th className="p-3 text-left font-semibold text-foreground border-b border-border">Produção Completa</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(producaoPricing).map(([key, value]) => (
                <tr key={key} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-semibold text-foreground border-b border-border">{value.name}</td>
                  <td className="p-3 text-muted-foreground border-b border-border">{value.baseRange}</td>
                  <td className="p-3 text-foreground border-b border-border">R$ {value.prod1.price} ({value.prod1.hours}h)</td>
                  <td className="p-3 text-foreground border-b border-border">R$ {value.prod3.price} ({value.prod3.hours}h)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-muted text-sm text-muted-foreground">
          <strong className="text-foreground">ℹ️ Observação:</strong> PRODUZEXPRESS é sempre presencial e não utiliza multiplicadores.
        </div>
      </div>

      {/* Multiplicadores por Tipo */}
      <div className="mb-8">
        <h4 className="font-bold text-foreground mb-3 text-lg">Multiplicadores por Tipo de Ambiente</h4>
        <div className="space-y-2">
          {Object.entries(environmentTypeMultipliers).map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl bg-secondary/50 flex justify-between items-center">
              <span className="font-medium text-foreground">{value.name}</span>
              <span className="text-xl font-bold text-accent">{value.multiplier}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multiplicadores por Tamanho */}
      <div className="mb-8">
        <h4 className="font-bold text-foreground mb-3 text-lg">Multiplicadores por Tamanho (P, M, G)</h4>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(sizeMultipliers).map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl bg-secondary/50">
              <div className="font-semibold text-foreground text-lg mb-1">{key}</div>
              <div className="text-sm text-muted-foreground mb-2">{value.description}</div>
              <div className="font-bold text-accent">
                {key === 'P' ? 'Base (1.0x)' : `+${Math.round((value.multiplier - 1) * 100)}% (${value.multiplier}x)`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ambientes Extras */}
      <div className="mb-8">
        <h4 className="font-bold text-foreground mb-3 text-lg">Ambientes Extras (acima de 3)</h4>
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="font-semibold text-foreground mb-2">Valores por Ambiente Extra:</div>
          <div className="text-sm text-foreground">• Opção 1: R$ 1.200,00 por ambiente</div>
          <div className="text-sm text-foreground">• Opção 2: R$ 1.500,00 por ambiente</div>
          <div className="text-xs text-muted-foreground mt-2">* Cada ambiente extra adiciona aproximadamente 8 horas de trabalho</div>
        </div>
      </div>

      {/* PROJETEXPRESS */}
      <div>
        <h4 className="font-bold text-foreground mb-3 text-lg">PROJETEXPRESS - Preços por m²</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(projetExpressPricing).map(([key, value]) => (
            <div key={key} className="p-4 rounded-xl bg-secondary/50">
              <div className="font-bold text-foreground mb-3">{value.name}</div>
              {value.ranges.map((range, idx) => (
                <div key={idx} className="text-sm text-foreground mb-1 py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{range.min}-{range.max}m²:</span>{' '}
                  <span className="font-semibold">R$ {range.pricePerM2}/m²</span>
                  <span className="text-muted-foreground text-xs ml-2">({range.hours}h/m²)</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceTable;
