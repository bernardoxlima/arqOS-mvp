"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { BudgetItem, AddBudgetItemData, UnidadeType } from "../types";

export interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddBudgetItemData) => Promise<boolean>;
  editingItem: BudgetItem | null;
  isSaving: boolean;
}

const itemSchema = z.object({
  fornecedor: z.string().min(1, "Fornecedor e obrigatorio"),
  descricao: z.string().min(1, "Descricao e obrigatoria"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  unidade: z.enum(["Qt.", "m\u00B2", "m", "un", "p\u00E7", "cx", "kg", "L"]),
  valorProduto: z.number().min(0, "Valor deve ser positivo"),
  valorInstalacao: z.number().min(0),
  valorFrete: z.number().min(0),
  valorExtras: z.number().min(0),
  link: z.string().url("URL invalida").optional().or(z.literal("")),
  ambiente: z.string().optional(),
  category: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

const UNIT_OPTIONS: { value: UnidadeType; label: string }[] = [
  { value: "Qt.", label: "Quantidade" },
  { value: "m\u00B2", label: "Metro quadrado" },
  { value: "m", label: "Metro" },
  { value: "un", label: "Unidade" },
  { value: "pç", label: "Peca" },
  { value: "cx", label: "Caixa" },
  { value: "kg", label: "Quilograma" },
  { value: "L", label: "Litro" },
];

const CATEGORY_OPTIONS = [
  { value: "moveis", label: "Moveis" },
  { value: "iluminacao", label: "Iluminacao" },
  { value: "decoracao", label: "Decoracao" },
  { value: "tecidos", label: "Tecidos" },
  { value: "revestimentos", label: "Revestimentos" },
  { value: "eletrodomesticos", label: "Eletrodomesticos" },
  { value: "tapetes", label: "Tapetes" },
  { value: "arte", label: "Arte" },
  { value: "jardim", label: "Jardim" },
  { value: "outros", label: "Outros" },
];

/**
 * AddEditItemModal - Modal for adding or editing budget items
 */
export function AddEditItemModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isSaving,
}: AddEditItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      fornecedor: "",
      descricao: "",
      quantidade: 1,
      unidade: "Qt.",
      valorProduto: 0,
      valorInstalacao: 0,
      valorFrete: 0,
      valorExtras: 0,
      link: "",
      ambiente: "",
      category: "",
    },
  });

  // Reset form when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          fornecedor: editingItem.fornecedor,
          descricao: editingItem.descricao,
          quantidade: editingItem.quantidade,
          unidade: editingItem.unidade,
          valorProduto: editingItem.valorProduto,
          valorInstalacao: editingItem.valorInstalacao,
          valorFrete: editingItem.valorFrete,
          valorExtras: editingItem.valorExtras,
          link: editingItem.link || "",
          ambiente: editingItem.ambiente || "",
          category: editingItem.category || "",
        });
      } else {
        reset({
          fornecedor: "",
          descricao: "",
          quantidade: 1,
          unidade: "Qt.",
          valorProduto: 0,
          valorInstalacao: 0,
          valorFrete: 0,
          valorExtras: 0,
          link: "",
          ambiente: "",
          category: "",
        });
      }
    }
  }, [isOpen, editingItem, reset]);

  const handleFormSubmit = async (data: ItemFormData) => {
    const success = await onSubmit({
      ...data,
      link: data.link || undefined,
      ambiente: data.ambiente || undefined,
      category: data.category || undefined,
    });
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedUnit = watch("unidade");
  const selectedCategory = watch("category");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">
            {editingItem ? "Editar Item" : "Adicionar Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Row 1: Descricao + Fornecedor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descricao *</Label>
              <Input
                id="descricao"
                {...register("descricao")}
                placeholder="Ex: Sofa 3 lugares"
              />
              {errors.descricao && (
                <p className="text-xs text-red-500">{errors.descricao.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                {...register("fornecedor")}
                placeholder="Ex: Tokstok"
              />
              {errors.fornecedor && (
                <p className="text-xs text-red-500">{errors.fornecedor.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Quantidade + Unidade + Ambiente */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                min="0"
                {...register("quantidade")}
              />
              {errors.quantidade && (
                <p className="text-xs text-red-500">{errors.quantidade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={selectedUnit}
                onValueChange={(value) => setValue("unidade", value as UnidadeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ambiente">Ambiente</Label>
              <Input
                id="ambiente"
                {...register("ambiente")}
                placeholder="Ex: Sala de Estar"
              />
            </div>
          </div>

          {/* Row 3: Valor Produto + Instalacao + Frete + Extras */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorProduto">Valor Produto *</Label>
              <Input
                id="valorProduto"
                type="number"
                step="0.01"
                min="0"
                {...register("valorProduto")}
              />
              {errors.valorProduto && (
                <p className="text-xs text-red-500">{errors.valorProduto.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorInstalacao">Instalacao</Label>
              <Input
                id="valorInstalacao"
                type="number"
                step="0.01"
                min="0"
                {...register("valorInstalacao")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorFrete">Frete</Label>
              <Input
                id="valorFrete"
                type="number"
                step="0.01"
                min="0"
                {...register("valorFrete")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorExtras">Extras</Label>
              <Input
                id="valorExtras"
                type="number"
                step="0.01"
                min="0"
                {...register("valorExtras")}
              />
            </div>
          </div>

          {/* Row 4: Categoria + Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link do Produto</Label>
              <Input
                id="link"
                type="url"
                {...register("link")}
                placeholder="https://..."
              />
              {errors.link && (
                <p className="text-xs text-red-500">{errors.link.message}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSaving}>
            {isSaving ? "Salvando..." : editingItem ? "Atualizar" : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
