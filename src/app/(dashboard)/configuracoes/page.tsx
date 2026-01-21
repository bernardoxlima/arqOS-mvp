"use client";

import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  useSettings,
  SettingsOfficeSection,
  SettingsOfficeSectionSkeleton,
  SettingsTeamSection,
  SettingsTeamSectionSkeleton,
  SettingsCostsSection,
  SettingsCostsSectionSkeleton,
  SettingsServicesSection,
  SettingsServicesSectionSkeleton,
} from "@/modules/settings";
import type { OfficeCosts, ServiceId, OfficeSize, PositioningMultiplier } from "@/modules/onboarding";

export default function ConfiguracoesPage() {
  const {
    organization,
    team,
    isLoading,
    isSaving,
    updateOrganizationName,
    updateOfficeSize,
    updateMargin,
    updatePositioning,
    updateCosts,
    updateServices,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  } = useSettings();

  // Default values if organization is loading
  const orgName = organization?.name || "";
  const orgSettings = organization?.settings;
  const officeSize: OfficeSize = orgSettings?.office?.size || "small";
  const margin = orgSettings?.margin || orgSettings?.office?.margin || 30;
  const positioningMultiplier: PositioningMultiplier = orgSettings?.office?.positioningMultiplier || "bem_posicionado";
  const costs: OfficeCosts = orgSettings?.costs || orgSettings?.office?.costs || {
    rent: 0,
    utilities: 0,
    software: 0,
    marketing: 0,
    accountant: 0,
    internet: 0,
    others: 0,
  };
  const services: ServiceId[] = orgSettings?.office?.services || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Configurações do Escritório</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as configurações do seu escritório
            </p>
          </div>
        </div>

        <Tabs defaultValue="escritorio" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="escritorio">Escritório</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
            <TabsTrigger value="custos">Custos</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
          </TabsList>

          <TabsContent value="escritorio" className="mt-6">
            <SettingsOfficeSectionSkeleton />
          </TabsContent>
          <TabsContent value="equipe" className="mt-6">
            <SettingsTeamSectionSkeleton />
          </TabsContent>
          <TabsContent value="custos" className="mt-6">
            <SettingsCostsSectionSkeleton />
          </TabsContent>
          <TabsContent value="servicos" className="mt-6">
            <SettingsServicesSectionSkeleton />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold">Configurações do Escritório</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações do seu escritório
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="escritorio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="escritorio">Escritório</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>

        {/* Escritório Tab */}
        <TabsContent value="escritorio" className="mt-6">
          <SettingsOfficeSection
            name={orgName}
            size={officeSize}
            margin={margin}
            positioningMultiplier={positioningMultiplier}
            costs={costs}
            team={team}
            isSaving={isSaving}
            onUpdateName={updateOrganizationName}
            onUpdateSize={updateOfficeSize}
            onUpdateMargin={updateMargin}
            onUpdatePositioning={updatePositioning}
          />
        </TabsContent>

        {/* Equipe Tab */}
        <TabsContent value="equipe" className="mt-6">
          <SettingsTeamSection
            team={team}
            isSaving={isSaving}
            onAddMember={addTeamMember}
            onUpdateMember={updateTeamMember}
            onDeleteMember={deleteTeamMember}
          />
        </TabsContent>

        {/* Custos Tab */}
        <TabsContent value="custos" className="mt-6">
          <SettingsCostsSection
            costs={costs}
            isSaving={isSaving}
            onUpdateCosts={updateCosts}
          />
        </TabsContent>

        {/* Serviços Tab */}
        <TabsContent value="servicos" className="mt-6">
          <SettingsServicesSection
            services={services}
            isSaving={isSaving}
            onUpdateServices={updateServices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
