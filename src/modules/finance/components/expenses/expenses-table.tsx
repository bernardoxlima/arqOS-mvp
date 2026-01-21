'use client';

import { useState } from 'react';
import { Pencil, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { EXPENSE_CATEGORIES } from '../../constants';
import type { Expense, ExpenseCategory, UpdateExpenseData } from '../../types';
import { ExpenseEditModal } from './expense-edit-modal';

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onUpdate: (id: string, data: UpdateExpenseData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pago</Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case 'overdue':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Vencido</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function ExpensesTable({
  expenses,
  isLoading,
  onUpdate,
  onDelete,
}: ExpensesTableProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await onDelete(deletingId);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhuma despesa encontrada</p>
        <p className="text-sm mt-1">Adicione uma despesa usando o formulário acima</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const categoryConfig = expense.category
                ? EXPENSE_CATEGORIES[expense.category as ExpenseCategory]
                : null;

              return (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {categoryConfig && (
                      <Badge
                        variant="outline"
                        className={`${categoryConfig.bgColor} ${categoryConfig.textColor} ${categoryConfig.borderColor}`}
                      >
                        {categoryConfig.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(expense.status)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.value)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(expense.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <ExpenseEditModal
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSave={async (data) => {
            const success = await onUpdate(editingExpense.id, data);
            if (success) {
              setEditingExpense(null);
            }
            return success;
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A despesa será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
