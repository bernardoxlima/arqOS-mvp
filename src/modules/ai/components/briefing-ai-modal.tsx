'use client';

/**
 * Briefing AI Modal
 * Main modal for AI-powered briefing generation with 3 tabs
 */

import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useBriefing } from '../hooks/use-briefing';
import { BriefingTabMemorial } from './briefing-tab-memorial';
import { BriefingTabMoodboard } from './briefing-tab-moodboard';
import { BriefingTabReference } from './briefing-tab-reference';

interface BriefingAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: {
    id: string;
    code: string;
    clientName: string;
  };
  onMemorialGenerated?: (memorial: string) => void;
  onMoodboardPromptGenerated?: (prompt: string) => void;
  onReferencePromptGenerated?: (prompt: string) => void;
}

export function BriefingAIModal({
  isOpen,
  onClose,
  project,
  onMemorialGenerated,
  onMoodboardPromptGenerated,
  onReferencePromptGenerated,
}: BriefingAIModalProps) {
  const {
    memorial,
    moodboardPrompt,
    referencePrompt,
    isLoading,
    error,
    generateMemorial,
    generateMoodboard,
    generateReference,
    reset,
  } = useBriefing();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  const handleGenerateMemorial = async (transcription: string) => {
    const result = await generateMemorial({
      transcription,
      clientName: project?.clientName,
      projectCode: project?.code,
    });

    if (result && onMemorialGenerated) {
      onMemorialGenerated(result);
    }

    return result;
  };

  const handleGenerateMoodboard = async (memorialText: string) => {
    const result = await generateMoodboard(memorialText);

    if (result && onMoodboardPromptGenerated) {
      onMoodboardPromptGenerated(result);
    }

    return result;
  };

  const handleGenerateReference = async (memorialText: string) => {
    const result = await generateReference(memorialText);

    if (result && onReferencePromptGenerated) {
      onReferencePromptGenerated(result);
    }

    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Briefing com IA
          </DialogTitle>
          <DialogDescription>
            Transforme a transcricao da reuniao em memorial e prompts de imagem.
            {project && (
              <span className="block mt-1 font-medium">
                Projeto: {project.code} - {project.clientName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="memorial" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memorial" className="relative">
              Memorial
              {memorial && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="moodboard" className="relative">
              Moodboard
              {moodboardPrompt && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="reference" className="relative">
              Referencias
              {referencePrompt && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memorial" className="mt-4">
            <BriefingTabMemorial
              memorial={memorial}
              isLoading={isLoading}
              error={error}
              onGenerate={handleGenerateMemorial}
              clientName={project?.clientName}
              projectCode={project?.code}
            />
          </TabsContent>

          <TabsContent value="moodboard" className="mt-4">
            <BriefingTabMoodboard
              memorial={memorial}
              moodboardPrompt={moodboardPrompt}
              isLoading={isLoading}
              error={error}
              onGenerate={handleGenerateMoodboard}
            />
          </TabsContent>

          <TabsContent value="reference" className="mt-4">
            <BriefingTabReference
              memorial={memorial}
              referencePrompt={referencePrompt}
              isLoading={isLoading}
              error={error}
              onGenerate={handleGenerateReference}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
