import React from 'react';
import { companyInfo, mission, values, pillars, differentials } from '@/data/companyData';

const CompanyInfo: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* A Empresa */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">A EMPRESA</h3>
        <div className="bg-muted/50 rounded-xl p-6">
          <p className="text-lg leading-relaxed text-foreground mb-4">{companyInfo.description}</p>
          <div className="bg-foreground text-background rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">PROPOSTA DE VALOR</p>
            <p className="text-lg font-medium">"{companyInfo.valueProposition}"</p>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Promessa */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: 'MISSÃO', content: mission.mission },
          { title: 'VISÃO', content: mission.vision },
          { title: 'PROMESSA', content: mission.promise }
        ].map((item) => (
          <section key={item.title} className="glass-card rounded-2xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{item.title}</h3>
            <div className="bg-muted/50 rounded-xl p-5 min-h-[100px]">
              <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Valores */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">VALORES</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {values.map((value) => (
            <div key={value.number} className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                {value.number}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{value.title}</h4>
                <p className="text-xs text-muted-foreground">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pilares */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">NOSSOS PILARES</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="text-center p-4 bg-muted/30 rounded-xl border border-border">
              <div className="text-3xl mb-3">{pillar.icon}</div>
              <h4 className="font-bold text-xs mb-2">{pillar.title}</h4>
              <p className="text-xs text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">POR QUE ARQEXPRESS?</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {differentials.map((diff) => (
            <div key={diff.title} className="text-center p-5 bg-muted/30 rounded-xl border border-border">
              <div className="text-2xl mb-3">{diff.icon}</div>
              <h4 className="font-bold text-xs mb-2">{diff.title}</h4>
              <p className="text-xs text-muted-foreground">{diff.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CompanyInfo;
