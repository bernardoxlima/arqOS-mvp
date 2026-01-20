'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PHASE_OPTIONS } from '../constants';
import type { CreatePresentationInput, PresentationPhase } from '../types';

interface NewPresentationModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreatePresentationInput) => Promise<void>;
  isCreating?: boolean;
}

export function NewPresentationModal({ open, onClose, onCreate, isCreating }: NewPresentationModalProps) {
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<PresentationPhase>('Proposta Inicial');
  const [clientName, setClientName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    await onCreate({
      name: name.trim(),
      phase,
      clientData: clientName ? { clientName } : undefined,
    });

    // Reset form
    setName('');
    setPhase('Proposta Inicial');
    setClientName('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Apresentação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Apresentação *</Label>
            <Input
              id="name"
              placeholder="Ex: Sala de Estar - Apartamento 302"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Fase</Label>
            <Select value={phase} onValueChange={(value) => setPhase(value as PresentationPhase)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                {PHASE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              placeholder="Ex: Maria Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Apresentação'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
