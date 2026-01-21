"use client";

import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { SetupProgress } from "./setup-progress";
import {
  StepSize,
  StepName,
  StepTeam,
  StepCosts,
  StepServices,
  StepMargin,
} from "./steps";
import { useSetupWizard } from "../hooks/use-setup-wizard";
import { TOTAL_STEPS } from "../constants";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function SetupWizard() {
  const {
    state,
    isLoading,
    isSaving,
    error,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    setOfficeSize,
    setOfficeName,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    setCostField,
    toggleService,
    setMargin,
    complete,
  } = useSetupWizard();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLastStep = state.currentStep === TOTAL_STEPS;

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StepSize value={state.officeSize} onChange={setOfficeSize} />;
      case 2:
        return <StepName value={state.officeName} onChange={setOfficeName} />;
      case 3:
        return (
          <StepTeam
            value={state.team}
            onAdd={addTeamMember}
            onUpdate={updateTeamMember}
            onRemove={removeTeamMember}
          />
        );
      case 4:
        return <StepCosts value={state.costs} onChange={setCostField} />;
      case 5:
        return <StepServices value={state.services} onToggle={toggleService} />;
      case 6:
        return (
          <StepMargin
            value={state.margin}
            onChange={setMargin}
            costs={state.costs}
            team={state.team}
          />
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      await complete();
    } else {
      await nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <SetupProgress currentStep={state.currentStep} />

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          {renderStep()}
        </CardContent>

        <CardFooter className="flex justify-between gap-4 px-6 pb-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={!canGoPrev || isSaving}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Button onClick={handleNext} disabled={!canGoNext || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isLastStep ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Concluir
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
