'use client';

import { Presentation, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

interface PresentationsEmptyProps {
  hasFilters?: boolean;
  onCreateNew?: () => void;
}

export function PresentationsEmpty({ hasFilters, onCreateNew }: PresentationsEmptyProps) {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Presentation className="w-8 h-8 text-muted-foreground" />
      </div>

      {hasFilters ? (
        <>
          <h3 className="font-medium mb-2">Nenhuma apresentação encontrada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tente ajustar os filtros ou a busca
          </p>
        </>
      ) : (
        <>
          <h3 className="font-medium mb-2">Nenhuma apresentação cadastrada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie sua primeira apresentação para começar
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Apresentação
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
