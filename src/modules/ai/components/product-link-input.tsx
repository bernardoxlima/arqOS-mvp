'use client';

/**
 * Product Link Input
 * Input field with AI-powered product extraction from URLs
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Sparkles, AlertCircle, Check, Link } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { toast } from 'sonner';
import { useProductExtraction } from '../hooks/use-product-extraction';
import type { ExtractedProduct } from '../types';

interface ProductLinkInputProps {
  onExtracted: (product: ExtractedProduct) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  showPreview?: boolean;
}

export function ProductLinkInput({
  onExtracted,
  disabled = false,
  label = 'Link do Produto',
  placeholder = 'Cole o link do produto (Amazon, MadeiraMadeira, etc.)',
  showPreview = true,
}: ProductLinkInputProps) {
  const [url, setUrl] = useState('');
  const [extracted, setExtracted] = useState(false);

  const { product, isExtracting, error, extract, reset } = useProductExtraction();

  // Reset extracted state when URL changes
  useEffect(() => {
    if (extracted) {
      setExtracted(false);
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error('Digite ou cole o link do produto');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('URL invalida');
      return;
    }

    const result = await extract(url);

    if (result) {
      setExtracted(true);
      onExtracted(result);
      toast.success('Dados do produto extraidos!');
    } else if (error) {
      toast.error(error);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (isValidUrl(pastedText)) {
      // Auto-extract on paste
      setUrl(pastedText);
      setTimeout(async () => {
        const result = await extract(pastedText);
        if (result) {
          setExtracted(true);
          onExtracted(result);
          toast.success('Dados do produto extraidos automaticamente!');
        }
      }, 100);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            placeholder={placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            disabled={disabled || isExtracting}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={handleExtract}
          disabled={disabled || isExtracting || !url.trim()}
          variant={extracted ? 'outline' : 'default'}
          className="shrink-0"
        >
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extraindo...
            </>
          ) : extracted ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Extraido
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Extrair
            </>
          )}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview extracted product */}
      {showPreview && product && extracted && (
        <div className="rounded-md border bg-muted/50 p-3 space-y-2">
          <div className="flex gap-3">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-md object-cover"
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              {product.supplier && (
                <p className="text-xs text-muted-foreground">{product.supplier}</p>
              )}
              {product.price && (
                <p className="text-sm font-semibold text-primary mt-1">
                  {formatPrice(product.price, product.currency)}
                </p>
              )}
            </div>
          </div>
          {product.category && (
            <p className="text-xs text-muted-foreground">
              Categoria: {product.category}
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Cole o link e clique em &quot;Extrair&quot; para preencher automaticamente os dados do produto.
      </p>
    </div>
  );
}
