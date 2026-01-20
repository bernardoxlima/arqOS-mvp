'use client';

import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { STATUS_CONFIGS } from '../constants';
import type { PresentationStatus } from '../types';

interface PresentationsFiltersProps {
  statusFilter: PresentationStatus | 'all';
  onStatusChange: (status: PresentationStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts?: Record<string, number>;
}

export function PresentationsFilters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts = {},
}: PresentationsFiltersProps) {
  const allCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4">
      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange('all')}
          className="whitespace-nowrap"
        >
          Todas
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary-foreground/20">
            {allCount}
          </span>
        </Button>

        {STATUS_CONFIGS.map((config) => (
          <Button
            key={config.id}
            variant={statusFilter === config.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(config.id)}
            className="whitespace-nowrap"
          >
            {config.label}
            {statusCounts[config.id] !== undefined && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary-foreground/20">
                {statusCounts[config.id]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar apresentação..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
