'use client';

/**
 * Brandbook Page
 * AI-powered brandbook generator wizard
 */

import { Sparkles, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { BrandbookWizard } from '@/modules/ai/components';
import { toast } from 'sonner';

export default function BrandbookPage() {
  const handleBrandbookGenerated = () => {
    toast.success('Brandbook gerado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Brandbook
        </h1>
        <p className="text-muted-foreground">
          Crie o brandbook do seu escritorio respondendo ao questionario de arquitetura de marca.
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Responda as perguntas de cada bloco para criar um brandbook personalizado para seu escritorio.
          Quanto mais detalhes voce fornecer, mais completo sera o resultado.
        </AlertDescription>
      </Alert>

      {/* Wizard Card */}
      <Card>
        <CardHeader>
          <CardTitle>Arquitetura de Marca</CardTitle>
          <CardDescription>
            Complete os 7 blocos para gerar seu brandbook com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandbookWizard onBrandbookGenerated={handleBrandbookGenerated} />
        </CardContent>
      </Card>
    </div>
  );
}
