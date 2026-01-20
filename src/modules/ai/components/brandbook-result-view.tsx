'use client';

/**
 * Brandbook Result View
 * Displays generated brandbook with copy/download options
 */

import { useState } from 'react';
import { Copy, Check, Download, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from 'sonner';

interface BrandbookResultViewProps {
  brandbook: string;
  onBack: () => void;
  officeName?: string;
}

export function BrandbookResultView({
  brandbook,
  onBack,
  officeName,
}: BrandbookResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brandbook);
      setCopied(true);
      toast.success('Brandbook copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleDownload = () => {
    const filename = officeName
      ? `brandbook-${officeName.toLowerCase().replace(/\s+/g, '-')}.md`
      : 'brandbook.md';

    const blob = new Blob([brandbook], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Arquivo baixado!');
  };

  // Simple markdown-like rendering for display
  const formatMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-base font-semibold mt-4 mb-2">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-lg font-bold mt-6 mb-3 text-primary">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-xl font-bold mt-4 mb-4">
              {line.replace('# ', '')}
            </h1>
          );
        }
        // Bold
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={index} className="font-semibold my-1">
              {line.replace(/\*\*/g, '')}
            </p>
          );
        }
        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={index} className="ml-4 my-0.5 list-disc list-inside">
              {line.replace(/^[-*]\s/, '')}
            </li>
          );
        }
        // Horizontal rule
        if (line === '---' || line === '***') {
          return <Separator key={index} className="my-4" />;
        }
        // Empty line
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }
        // Regular text
        return (
          <p key={index} className="my-1 text-muted-foreground">
            {line}
          </p>
        );
      });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Seu Brandbook</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-1 h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1 h-4 w-4" />
            Baixar MD
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[500px] rounded-md border bg-card p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {formatMarkdown(brandbook)}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar e Editar
        </Button>
      </div>
    </div>
  );
}
