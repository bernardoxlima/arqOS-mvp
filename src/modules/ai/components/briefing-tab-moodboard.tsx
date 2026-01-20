'use client';

/**
 * Briefing Tab - Moodboard
 * Generates AI image prompts for moodboard from memorial
 */

import { useState } from 'react';
import { Loader2, Copy, Check, Sparkles, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { toast } from 'sonner';

interface BriefingTabMoodboardProps {
  memorial: string | null;
  moodboardPrompt: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: (memorial: string) => Promise<string | null>;
}

const AI_TOOLS = [
  { name: 'Midjourney', url: 'https://www.midjourney.com/' },
  { name: 'Leonardo.ai', url: 'https://leonardo.ai/' },
  { name: 'DALL-E', url: 'https://openai.com/dall-e-3' },
  { name: 'Stable Diffusion', url: 'https://stability.ai/' },
];

export function BriefingTabMoodboard({
  memorial,
  moodboardPrompt,
  isLoading,
  error,
  onGenerate,
}: BriefingTabMoodboardProps) {
  const [copied, setCopied] = useState(false);
  const [showMemorial, setShowMemorial] = useState(false);

  const handleGenerate = async () => {
    if (!memorial) {
      toast.error('Gere o memorial primeiro na aba anterior');
      return;
    }

    await onGenerate(memorial);
  };

  const handleCopy = async () => {
    if (!moodboardPrompt) return;

    try {
      await navigator.clipboard.writeText(moodboardPrompt);
      setCopied(true);
      toast.success('Prompt copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const hasMemorial = Boolean(memorial);

  return (
    <div className="space-y-4">
      {/* Memorial preview (collapsed) */}
      {memorial && (
        <Collapsible open={showMemorial} onOpenChange={setShowMemorial}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Ver Memorial</span>
              {showMemorial ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ScrollArea className="h-[150px] rounded-md border bg-muted/50 p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                {memorial}
              </pre>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Instructions */}
      {!hasMemorial && (
        <div className="rounded-md bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Primeiro, gere o memorial na aba &quot;Memorial&quot; para poder criar o prompt de moodboard.
          </p>
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading || !hasMemorial}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando prompt...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Prompt de Moodboard
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
      {moodboardPrompt && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Prompt de Moodboard</label>
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
          <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {moodboardPrompt}
            </pre>
          </ScrollArea>

          {/* AI Tools links */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Use este prompt em:
            </p>
            <div className="flex flex-wrap gap-2">
              {AI_TOOLS.map((tool) => (
                <Button
                  key={tool.name}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  asChild
                >
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    {tool.name}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
