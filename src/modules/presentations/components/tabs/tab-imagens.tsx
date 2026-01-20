'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  IMAGE_SECTION_LIMITS,
  type ImageSection,
  type PresentationImage,
  type ClientData,
} from '../../types';
import {
  IMAGE_SECTION_LABELS,
  IMAGE_SECTION_DESCRIPTIONS,
} from '../../constants';

interface TabImagensProps {
  presentationId: string;
  images: PresentationImage[];
  clientData: ClientData | null;
  onUploadImage: (section: ImageSection, file: File) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<void>;
  onUpdateClientData: (data: ClientData) => Promise<void>;
  isUploading?: boolean;
}

const SECTIONS: ImageSection[] = ['photos_before', 'moodboard', 'references', 'floor_plan', 'renders'];

export function TabImagens({
  presentationId,
  images,
  clientData,
  onUploadImage,
  onDeleteImage,
  onUpdateClientData,
  isUploading,
}: TabImagensProps) {
  const [editingClientData, setEditingClientData] = useState<ClientData | null>(null);
  const [uploadingSection, setUploadingSection] = useState<ImageSection | null>(null);

  const getImagesBySection = (section: ImageSection) => {
    return images.filter((img) => img.section === section).sort((a, b) => a.display_order - b.display_order);
  };

  const handleFileSelect = async (section: ImageSection, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const sectionImages = getImagesBySection(section);
    const limit = IMAGE_SECTION_LIMITS[section];
    const available = limit - sectionImages.length;

    if (available <= 0) {
      alert(`Limite de ${limit} imagens atingido para ${IMAGE_SECTION_LABELS[section]}`);
      return;
    }

    setUploadingSection(section);
    try {
      const filesToUpload = Array.from(files).slice(0, available);
      for (const file of filesToUpload) {
        await onUploadImage(section, file);
      }
    } finally {
      setUploadingSection(null);
    }
  };

  const handleSaveClientData = async () => {
    if (editingClientData) {
      await onUpdateClientData(editingClientData);
      setEditingClientData(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Data Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Dados do Cliente</CardTitle>
          {editingClientData ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingClientData(null)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveClientData}>
                Salvar
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditingClientData(clientData || { clientName: '' })}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingClientData ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Cliente *</Label>
                <Input
                  value={editingClientData.clientName || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, clientName: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Código do Projeto</Label>
                <Input
                  value={editingClientData.projectCode || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, projectCode: e.target.value })}
                  placeholder="ARQ-2401"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editingClientData.phone || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={editingClientData.address || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="space-y-2">
                <Label>CEP / Bairro</Label>
                <Input
                  value={editingClientData.cepBairro || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, cepBairro: e.target.value })}
                  placeholder="00000-000 / Bairro"
                />
              </div>
              <div className="space-y-2">
                <Label>Arquiteto(a) Responsável</Label>
                <Input
                  value={editingClientData.architect || ''}
                  onChange={(e) => setEditingClientData({ ...editingClientData, architect: e.target.value })}
                  placeholder="Nome do arquiteto"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>{' '}
                <span className="font-medium">{clientData?.clientName || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Código:</span>{' '}
                <span className="font-medium">{clientData?.projectCode || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>{' '}
                <span className="font-medium">{clientData?.phone || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Endereço:</span>{' '}
                <span className="font-medium">{clientData?.address || '-'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Sections */}
      {SECTIONS.map((section) => {
        const sectionImages = getImagesBySection(section);
        const limit = IMAGE_SECTION_LIMITS[section];
        const isFull = sectionImages.length >= limit;
        const isUploadingThis = uploadingSection === section;

        return (
          <Card key={section}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">{IMAGE_SECTION_LABELS[section]}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {IMAGE_SECTION_DESCRIPTIONS[section]} ({sectionImages.length}/{limit})
                  </p>
                </div>
                {!isFull && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple={limit > 1}
                      className="hidden"
                      onChange={(e) => handleFileSelect(section, e.target.files)}
                      disabled={isUploadingThis}
                    />
                    <Button variant="outline" size="sm" asChild disabled={isUploadingThis}>
                      <span>
                        {isUploadingThis ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Adicionar
                      </span>
                    </Button>
                  </label>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {sectionImages.length === 0 ? (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple={limit > 1}
                    className="hidden"
                    onChange={(e) => handleFileSelect(section, e.target.files)}
                    disabled={isUploadingThis}
                  />
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    {isUploadingThis ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      Clique ou arraste imagens aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG ou WebP até 10MB
                    </p>
                  </div>
                </label>
              ) : (
                <div className={`grid gap-4 ${limit === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                  {sectionImages.map((img) => (
                    <div key={img.id} className="relative group aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
