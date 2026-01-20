'use client';

import { Image, Calendar, Layers, MoreVertical } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { formatRelativeTime } from '@/shared/lib/format';
import { getStatusConfig } from '../constants';
import type { PresentationSummary } from '../types';

interface PresentationCardProps {
  presentation: PresentationSummary;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PresentationCard({ presentation, onClick, onEdit, onDelete }: PresentationCardProps) {
  const statusConfig = getStatusConfig(presentation.status);

  return (
    <Card
      className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            <Image className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {presentation.code || 'APRES-000'}
            </p>
            <p className="text-xs text-muted-foreground">{presentation.phase}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-medium mb-3 line-clamp-2">{presentation.name}</h3>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Image className="w-3.5 h-3.5" />
          <span>{presentation.imageCount} imagens</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>{presentation.itemCount} itens</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(presentation.updatedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
