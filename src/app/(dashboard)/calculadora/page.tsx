'use client';

import { CalculatorWizard } from '@/modules/calculator/components/calculator-wizard';

export default function CalculadoraPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light">Calculadora de Orçamento</h1>
        <p className="text-sm text-muted-foreground">
          Calcule o valor do seu projeto em poucos passos
        </p>
      </div>

      <CalculatorWizard />
    </div>
  );
}
