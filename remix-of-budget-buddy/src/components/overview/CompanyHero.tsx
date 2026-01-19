import React from 'react';
import { companyInfo } from '@/data/companyData';

const CompanyHero: React.FC = () => {
  return (
    <div className="bg-foreground text-background rounded-2xl p-8 md:p-12 text-center mb-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
        ARQ<span className="font-bold">EXPRESS</span>
      </h1>
      <p className="text-xl md:text-2xl font-light tracking-wide opacity-90 mb-2">
        "{companyInfo.tagline}"
      </p>
      <p className="text-base tracking-widest uppercase opacity-60">
        {companyInfo.signature}
      </p>
    </div>
  );
};

export default CompanyHero;
