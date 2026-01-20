'use client';

/**
 * Briefing Tab - Memorial
 * Converts meeting transcription into structured memorial
 */

import { useState } from 'react';
import { Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { toast } from 'sonner';

interface BriefingTabMemorialProps {
  memorial: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: (transcription: string) => Promise<string | null>;
  clientName?: string;
  projectCode?: string;
}

export function BriefingTabMemorial({
  memorial,
  isLoading,
  error,
  onGenerate,
  clientName,
  projectCode,
}: BriefingTabMemorialProps) {
  const [transcription, setTranscription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!transcription.trim()) {
      toast.error('Digite ou cole a transcricao da reuniao');
      return;
    }

    if (transcription.trim().length < 10) {
      toast.error('A transcricao deve ter pelo menos 10 caracteres');
      return;
    }

    await onGenerate(transcription);
  };

  const handleCopy = async () => {
    if (!memorial) return;

    try {
      await navigator.clipboard.writeText(memorial);
      setCopied(true);
      toast.success('Memorial copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="space-y-4">
      {/* Input section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Transcricao da Reuniao
        </label>
        <Textarea
          placeholder="Cole aqui a transcricao da reuniao com o cliente..."
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          className="min-h-[200px] resize-none font-mono text-sm"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Cole a transcricao da reuniao de briefing. A IA ira organizar as informacoes em um memorial estruturado.
        </p>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading || !transcription.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando memorial...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Memorial com IA
          </>
        )}
      </Button>

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Result section */}
      {memorial && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Memorial Gerado</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copiar
                </>
              )}
            </Button>
          </div>
          <ScrollArea className="h-[300px] rounded-md border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {memorial}
            </pre>
          </ScrollArea>
          {clientName && projectCode && (
            <p className="text-xs text-muted-foreground">
              Cliente: {clientName} | Projeto: {projectCode}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
