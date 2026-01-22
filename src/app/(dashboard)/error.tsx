'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Erro ao carregar
              </h2>
              <p className="text-sm text-muted-foreground">
                Nao foi possivel carregar esta pagina. Por favor, tente novamente.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                  Codigo: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="default" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
