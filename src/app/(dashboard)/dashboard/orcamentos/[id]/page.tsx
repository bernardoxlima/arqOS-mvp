"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBudget } from "@/modules/budgets/hooks";
import {
  BudgetDetailHeader,
  ItemsTable,
  CategorySummary,
  BudgetValueCard,
  AddEditItemModal,
  BudgetDetailSkeleton,
} from "@/modules/budgets/components";
import type { BudgetItem, AddBudgetItemData, UpdateBudgetItemData, BudgetStatus } from "@/modules/budgets";

export default function OrcamentoDetailPage() {
  const params = useParams();
  const budgetId = params.id as string;

  const {
    budget,
    isLoading,
    isSaving,
    error,
    updateStatus,
    addItem,
    updateItem,
    removeItem,
  } = useBudget(budgetId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Handle status change
  const handleStatusChange = useCallback(
    async (status: BudgetStatus) => {
      const success = await updateStatus(status);
      if (success) {
        const statusLabels: Record<BudgetStatus, string> = {
          draft: "Rascunho",
          sent: "Enviado",
          approved: "Aprovado",
          rejected: "Rejeitado",
        };
        toast.success(`Status alterado para ${statusLabels[status]}`);
      } else {
        toast.error("Erro ao alterar status");
      }
    },
    [updateStatus]
  );

  // Handle export Excel
  const handleExportExcel = useCallback(async () => {
    if (!budget) return;

    try {
      const response = await fetch(
        `/api/documents/presentations/${budgetId}/budget?format=excel`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Falha ao gerar Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${budget.code}_orcamento.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Excel exportado com sucesso");
    } catch {
      toast.error("Erro ao exportar Excel");
    }
  }, [budget, budgetId]);

  // Handle export PDF
  const handleExportPDF = useCallback(async () => {
    if (!budget) return;

    try {
      const response = await fetch("/api/documents/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "pdf",
          budgetId: budget.id,
          clientName: budget.client?.name || "Cliente",
          clientEmail: budget.client?.email,
          serviceType: budget.serviceType,
          finalPrice: budget.calculation.final_price,
          scope: budget.scope,
          paymentTerms: budget.paymentTerms,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${budget.code}_proposta.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF exportado com sucesso");
    } catch {
      toast.error("Erro ao exportar PDF");
    }
  }, [budget]);

  // Handle add item
  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit item
  const handleEditItem = useCallback((item: BudgetItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  // Handle submit item (add or update)
  const handleSubmitItem = useCallback(
    async (data: AddBudgetItemData): Promise<boolean> => {
      if (editingItem) {
        // Update existing item
        const updateData: UpdateBudgetItemData = {
          id: editingItem.id,
          ...data,
        };
        const success = await updateItem(updateData);
        if (success) {
          toast.success("Item atualizado com sucesso");
        } else {
          toast.error("Erro ao atualizar item");
        }
        return success;
      } else {
        // Add new item
        const success = await addItem(data);
        if (success) {
          toast.success("Item adicionado com sucesso");
        } else {
          toast.error("Erro ao adicionar item");
        }
        return success;
      }
    },
    [editingItem, addItem, updateItem]
  );

  // Handle remove item
  const handleRemoveItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      const success = await removeItem(itemId);
      if (success) {
        toast.success("Item removido com sucesso");
      } else {
        toast.error("Erro ao remover item");
      }
      return success;
    },
    [removeItem]
  );

  if (isLoading) {
    return <BudgetDetailSkeleton />;
  }

  if (error || !budget) {
    return (
      <div className="arq-card p-12 text-center">
        <h2 className="text-lg font-medium mb-2">Orcamento nao encontrado</h2>
        <p className="text-muted-foreground">
          {error || "O orcamento solicitado nao existe ou foi removido."}
        </p>
      </div>
    );
  }

  const isEditable = budget.status === "draft";

  return (
    <div className="space-y-6">
      {/* Header */}
      <BudgetDetailHeader
        code={budget.code}
        status={budget.status}
        onStatusChange={handleStatusChange}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        isSaving={isSaving}
      />

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info (if available) */}
          {budget.client && (
            <div className="arq-card p-4">
              <h3 className="font-medium mb-3">Cliente</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome</span>
                  <p className="font-medium">{budget.client.name}</p>
                </div>
                {budget.client.email && (
                  <div>
                    <span className="text-muted-foreground">Email</span>
                    <p>{budget.client.email}</p>
                  </div>
                )}
                {budget.client.phone && (
                  <div>
                    <span className="text-muted-foreground">Telefone</span>
                    <p>{budget.client.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items table */}
          <ItemsTable
            items={budget.items}
            isEditable={isEditable}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onUpdateItem={handleSubmitItem as (item: UpdateBudgetItemData) => Promise<boolean>}
            onRemoveItem={handleRemoveItem}
          />

          {/* Category summary */}
          <CategorySummary items={budget.items} />
        </div>

        {/* Right column - Value card */}
        <div className="space-y-6">
          <div className="sticky top-4">
            <BudgetValueCard
              serviceType={budget.serviceType}
              calculation={budget.calculation}
              details={budget.details}
            />

            {/* Notes */}
            {budget.notes && (
              <div className="arq-card p-4 mt-4">
                <h3 className="font-medium mb-2">Observacoes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {budget.notes}
                </p>
              </div>
            )}

            {/* Scope */}
            {budget.scope.length > 0 && (
              <div className="arq-card p-4 mt-4">
                <h3 className="font-medium mb-2">Escopo</h3>
                <ul className="space-y-1">
                  {budget.scope.map((item, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <AddEditItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitItem}
        editingItem={editingItem}
        isSaving={isSaving}
      />
    </div>
  );
}
