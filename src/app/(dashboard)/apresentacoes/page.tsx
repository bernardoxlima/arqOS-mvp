'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  PresentationCard,
  PresentationsFilters,
  PresentationsSkeleton,
  PresentationsEmpty,
  NewPresentationModal,
} from '@/modules/presentations/components';
import { usePresentations } from '@/modules/presentations/hooks/use-presentations';
import type { PresentationStatus, CreatePresentationInput } from '@/modules/presentations/types';

export default function ApresentacoesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PresentationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const { presentations, isLoading, error, create, isCreating, refetch } = usePresentations();

  // Filter presentations
  const filteredPresentations = useMemo(() => {
    if (!presentations || !Array.isArray(presentations)) return [];

    let filtered = presentations;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [presentations, statusFilter, searchQuery]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (presentations && Array.isArray(presentations)) {
      presentations.forEach((p) => {
        counts[p.status] = (counts[p.status] || 0) + 1;
      });
    }
    return counts;
  }, [presentations]);

  const handleCreate = async (input: CreatePresentationInput) => {
    const result = await create(input);
    if (result) {
      setShowNewModal(false);
      // Navigate to the new presentation
      router.push(`/dashboard/apresentacoes/${result.id}`);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/apresentacoes/${id}`);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta apresentacao?')) {
      return;
    }

    try {
      const response = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Apresentacao excluida com sucesso');
        await refetch();
      } else {
        toast.error(result.error || 'Erro ao excluir apresentacao');
      }
    } catch {
      toast.error('Erro ao excluir apresentacao');
    }
  }, [refetch]);

  if (isLoading && (!presentations || presentations.length === 0)) {
    return <PresentationsSkeleton />;
  }

  const hasFilters = statusFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Apresentações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas apresentações de projeto
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Apresentação
        </Button>
      </div>

      {/* Filters */}
      <PresentationsFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusCounts={statusCounts}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Cards grid or empty state */}
      {filteredPresentations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresentations.map((presentation) => (
            <PresentationCard
              key={presentation.id}
              presentation={presentation}
              onClick={() => handleCardClick(presentation.id)}
              onEdit={() => handleCardClick(presentation.id)}
              onDelete={() => handleDelete(presentation.id)}
            />
          ))}
        </div>
      ) : (
        <PresentationsEmpty
          hasFilters={hasFilters}
          onCreateNew={() => setShowNewModal(true)}
        />
      )}

      {/* New Presentation Modal */}
      <NewPresentationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
}
