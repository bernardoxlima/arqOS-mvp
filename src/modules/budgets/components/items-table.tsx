"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { BudgetItem, UpdateBudgetItemData } from "../types";

export interface ItemsTableProps {
  items: BudgetItem[];
  isEditable: boolean;
  onAddItem: () => void;
  onEditItem: (item: BudgetItem) => void;
  onUpdateItem: (item: UpdateBudgetItemData) => Promise<boolean>;
  onRemoveItem: (itemId: string) => Promise<boolean>;
}

interface EditingCell {
  itemId: string;
  field: "quantidade" | "valorProduto";
}

/**
 * ItemsTable - Table component with inline editing for budget items
 */
export function ItemsTable({
  items,
  isEditable,
  onAddItem,
  onEditItem,
  onUpdateItem,
  onRemoveItem,
}: ItemsTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCellClick = useCallback(
    (itemId: string, field: "quantidade" | "valorProduto", currentValue: number) => {
      if (!isEditable) return;
      setEditingCell({ itemId, field });
      setEditValue(String(currentValue));
    },
    [isEditable]
  );

  const handleCellBlur = useCallback(async () => {
    if (!editingCell) return;

    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingCell(null);
      return;
    }

    const item = items.find((i) => i.id === editingCell.itemId);
    if (!item) {
      setEditingCell(null);
      return;
    }

    // Check if value actually changed
    const currentValue = editingCell.field === "quantidade" ? item.quantidade : item.valorProduto;
    if (newValue === currentValue) {
      setEditingCell(null);
      return;
    }

    setIsUpdating(true);
    const success = await onUpdateItem({
      id: editingCell.itemId,
      [editingCell.field]: newValue,
    });

    if (!success) {
      // Reset to original value on failure
      setEditValue(String(currentValue));
    }

    setIsUpdating(false);
    setEditingCell(null);
  }, [editingCell, editValue, items, onUpdateItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCellBlur();
      } else if (e.key === "Escape") {
        setEditingCell(null);
      }
    },
    [handleCellBlur]
  );

  const handleDelete = useCallback(
    async (itemId: string) => {
      if (!confirm("Tem certeza que deseja remover este item?")) return;
      await onRemoveItem(itemId);
    },
    [onRemoveItem]
  );

  if (items.length === 0) {
    return (
      <div className="arq-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-medium">Itens do Orcamento</h3>
          {isEditable && (
            <Button size="sm" onClick={onAddItem}>
              <Plus className="w-4 h-4" />
              Adicionar Item
            </Button>
          )}
        </div>
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum item adicionado ainda
          </p>
          {isEditable && (
            <Button variant="outline" onClick={onAddItem}>
              <Plus className="w-4 h-4" />
              Adicionar primeiro item
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="arq-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium">
          Itens do Orcamento ({items.length} {items.length === 1 ? "item" : "itens"})
        </h3>
        {isEditable && (
          <Button size="sm" onClick={onAddItem}>
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Descricao</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Ambiente</TableHead>
              <TableHead className="text-right w-[100px]">Qtd.</TableHead>
              <TableHead className="text-right w-[120px]">Valor Unit.</TableHead>
              <TableHead className="text-right w-[120px]">Instalacao</TableHead>
              <TableHead className="text-right w-[120px]">Frete</TableHead>
              <TableHead className="text-right w-[130px]">Total</TableHead>
              {isEditable && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={cn(isUpdating && "opacity-50")}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[180px]">{item.descricao}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.fornecedor}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.ambiente || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {editingCell?.itemId === item.id &&
                  editingCell.field === "quantidade" ? (
                    <div className="editable-cell">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        min="0"
                        step="1"
                      />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        isEditable && "editable-cell cursor-pointer"
                      )}
                      onClick={() =>
                        handleCellClick(item.id, "quantidade", item.quantidade)
                      }
                    >
                      {item.quantidade} {item.unidade}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingCell?.itemId === item.id &&
                  editingCell.field === "valorProduto" ? (
                    <div className="editable-cell">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleCellBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        isEditable && "editable-cell cursor-pointer"
                      )}
                      onClick={() =>
                        handleCellClick(item.id, "valorProduto", item.valorProduto)
                      }
                    >
                      {formatCurrency(item.valorProduto)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(item.valorInstalacao)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(item.valorFrete)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.valorCompleto)}
                </TableCell>
                {isEditable && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEditItem(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
