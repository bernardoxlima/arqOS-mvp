'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { EXPENSE_CATEGORIES } from '../../constants';
import type { ExpenseCategory } from '../../types';

interface ExpenseCategoryFilterProps {
  selectedCategory: ExpenseCategory | 'all';
  selectedStatus: 'pending' | 'paid' | 'overdue' | 'all';
  onCategoryChange: (category: ExpenseCategory | 'all') => void;
  onStatusChange: (status: 'pending' | 'paid' | 'overdue' | 'all') => void;
}

export function ExpenseCategoryFilter({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}: ExpenseCategoryFilterProps) {
  const categories = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm">Filtros:</span>
      </div>

      {/* Category Filter */}
      <Select
        value={selectedCategory}
        onValueChange={(value) => onCategoryChange(value as ExpenseCategory | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {EXPENSE_CATEGORIES[cat].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={selectedStatus}
        onValueChange={(value) => onStatusChange(value as 'pending' | 'paid' | 'overdue' | 'all')}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="paid">Pago</SelectItem>
          <SelectItem value="overdue">Vencido</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCategoryChange('all');
            onStatusChange('all');
          }}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
