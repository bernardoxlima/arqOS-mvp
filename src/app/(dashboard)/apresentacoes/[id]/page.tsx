'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Image,
  LayoutGrid,
  ShoppingCart,
  FileText,
  Calculator,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  usePresentation,
  getStatusConfig,
  type ImageSection,
  type ClientData,
  type AddItemInput,
} from '@/modules/presentations';

// Lazy load tabs for performance (~100-150KB reduction)
const TabImagens = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-imagens').then(m => m.TabImagens),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const TabLayout = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-layout').then(m => m.TabLayout),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const TabCompras = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-compras').then(m => m.TabCompras),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const TabDetalhamento = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-detalhamento').then(m => m.TabDetalhamento),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const TabOrcamento = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-orcamento').then(m => m.TabOrcamento),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const TabExportar = dynamic(
  () => import('@/modules/presentations/components/tabs/tab-exportar').then(m => m.TabExportar),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);

const TABS = [
  { id: 'imagens', label: 'Imagens', icon: Image },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'detalhamento', label: 'Detalhamento', icon: FileText },
  { id: 'orcamento', label: 'Orçamento', icon: Calculator },
  { id: 'exportar', label: 'Exportar', icon: Download },
];

export default function PresentationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const presentationId = params.id as string;

  const [activeTab, setActiveTab] = useState('imagens');
  const [isUploading, setIsUploading] = useState(false);

  const {
    presentation,
    isLoading,
    error,
    update,
    fetch: refetch,
    deletePresentation,
    isDeleting,
  } = usePresentation(presentationId);

  // Handlers for images
  const handleUploadImage = useCallback(async (section: ImageSection, file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);

      const response = await fetch(`/api/presentations/${presentationId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      await refetch();
      toast.success('Imagem enviada com sucesso');
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  }, [presentationId, refetch]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      await refetch();
      toast.success('Imagem excluida com sucesso');
    } catch {
      toast.error('Erro ao excluir imagem');
    }
  }, [presentationId, refetch]);

  const handleUpdateClientData = useCallback(async (data: ClientData) => {
    await update({ clientData: data });
  }, [update]);

  // Handlers for items
  const handleAddItem = useCallback(async (input: AddItemInput) => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      await refetch();
      toast.success('Item adicionado com sucesso');
    } catch {
      toast.error('Erro ao adicionar item');
    }
  }, [presentationId, refetch]);

  const handleUpdateItem = useCallback(async (itemId: string, data: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      await refetch();
    } catch {
      toast.error('Erro ao atualizar item');
    }
  }, [presentationId, refetch]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/presentations/${presentationId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await refetch();
      toast.success('Item excluido com sucesso');
    } catch {
      toast.error('Erro ao excluir item');
    }
  }, [presentationId, refetch]);

  // Export handlers
  const handleExportPPT = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/presentations/${presentationId}/ppt`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apresentacao-${presentation?.code || presentationId}.pptx`;
        a.click();
        toast.success('Apresentacao exportada com sucesso');
      } else {
        toast.error('Erro ao exportar apresentacao');
      }
    } catch {
      toast.error('Erro ao exportar apresentacao');
    }
  }, [presentationId, presentation?.code]);

  const handleExportShoppingListPPT = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/presentations/${presentationId}/shopping-list`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lista-compras-${presentation?.code || presentationId}.pptx`;
        a.click();
        toast.success('Lista de compras exportada com sucesso');
      } else {
        toast.error('Erro ao exportar lista de compras');
      }
    } catch {
      toast.error('Erro ao exportar lista de compras');
    }
  }, [presentationId, presentation?.code]);

  const handleExportDetailingPPT = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/presentations/${presentationId}/detailing`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detalhamento-${presentation?.code || presentationId}.pptx`;
        a.click();
        toast.success('Detalhamento exportado com sucesso');
      } else {
        toast.error('Erro ao exportar detalhamento');
      }
    } catch {
      toast.error('Erro ao exportar detalhamento');
    }
  }, [presentationId, presentation?.code]);

  const handleExportBudgetExcel = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/presentations/${presentationId}/budget?format=xlsx`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento-${presentation?.code || presentationId}.xlsx`;
        a.click();
        toast.success('Orcamento exportado com sucesso');
      } else {
        toast.error('Erro ao exportar orcamento');
      }
    } catch {
      toast.error('Erro ao exportar orcamento');
    }
  }, [presentationId, presentation?.code]);

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta apresentação?')) {
      const success = await deletePresentation();
      if (success) {
        router.push('/dashboard/apresentacoes');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !presentation) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Apresentação não encontrada'}</p>
        <Button onClick={() => router.push('/dashboard/apresentacoes')}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(presentation.status);
  const clientData = presentation.client_data as ClientData | null;
  const images = presentation.images || [];
  const items = presentation.items || [];
  const floorPlanImage = images.find(img => img.section === 'floor_plan') || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/apresentacoes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium">{presentation.name}</h1>
              <span className={`text-xs px-2 py-1 rounded ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {presentation.code} • {presentation.phase}
              {clientData?.clientName && ` • ${clientData.clientName}`}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              {isDeleting ? 'Excluindo...' : 'Excluir Apresentação'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'imagens' && (
          <TabImagens
            presentationId={presentationId}
            images={images}
            clientData={clientData}
            onUploadImage={handleUploadImage}
            onDeleteImage={handleDeleteImage}
            onUpdateClientData={handleUpdateClientData}
            isUploading={isUploading}
          />
        )}

        {activeTab === 'layout' && (
          <TabLayout
            presentationId={presentationId}
            items={items}
            floorPlanImage={floorPlanImage}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'compras' && (
          <TabCompras
            presentationId={presentationId}
            items={items}
            onGeneratePPT={handleExportShoppingListPPT}
            onUpdateItem={handleUpdateItem}
          />
        )}

        {activeTab === 'detalhamento' && (
          <TabDetalhamento
            presentationId={presentationId}
            items={items}
            floorPlanImage={floorPlanImage}
            onGeneratePPT={handleExportDetailingPPT}
          />
        )}

        {activeTab === 'orcamento' && (
          <TabOrcamento
            presentationId={presentationId}
            items={items}
            onUpdateItem={handleUpdateItem}
            onExportExcel={handleExportBudgetExcel}
          />
        )}

        {activeTab === 'exportar' && (
          <TabExportar
            presentationId={presentationId}
            images={images}
            items={items}
            onExportPPT={handleExportPPT}
            onExportShoppingListPPT={handleExportShoppingListPPT}
            onExportDetailingPPT={handleExportDetailingPPT}
            onExportBudgetExcel={handleExportBudgetExcel}
          />
        )}
      </div>
    </div>
  );
}
