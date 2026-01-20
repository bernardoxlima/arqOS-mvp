'use client';

/**
 * Brandbook Wizard
 * Complete 7-block questionnaire wizard for brandbook generation
 */

import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import {
  BRAND_QUESTIONS,
  BLOCK_ORDER,
  DEFAULT_BRAND_ARCHITECTURE,
  isBlockCompleted,
  calculateCompletionPercentage,
  type BlockKey,
  type BrandArchitecture,
} from '../constants/brandbook-questions';
import { useBrandbook } from '../hooks/use-brandbook';
import { BrandbookStepIndicator } from './brandbook-step-indicator';
import { BrandbookQuestionField } from './brandbook-question-field';
import { BrandbookResultView } from './brandbook-result-view';

interface BrandbookWizardProps {
  initialData?: Partial<BrandArchitecture>;
  onBrandbookGenerated?: (brandbook: string) => void;
}

export function BrandbookWizard({
  initialData,
  onBrandbookGenerated,
}: BrandbookWizardProps) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<BrandArchitecture>({
    ...DEFAULT_BRAND_ARCHITECTURE,
    ...initialData,
  });
  const [showResult, setShowResult] = useState(false);

  const { brandbook, isGenerating, error, generate, reset } = useBrandbook();

  // Track completed blocks
  const completedBlocks = useMemo(() => {
    const completed = new Set<BlockKey>();
    for (const key of BLOCK_ORDER) {
      if (isBlockCompleted(key, answers)) {
        completed.add(key);
      }
    }
    return completed;
  }, [answers]);

  // Calculate completion percentage
  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(answers),
    [answers]
  );

  const currentBlockKey = BLOCK_ORDER[currentBlock] as BlockKey;
  const currentBlockData = BRAND_QUESTIONS[currentBlockKey];
  const isFirstBlock = currentBlock === 0;
  const isLastBlock = currentBlock === BLOCK_ORDER.length - 1;

  // Update answer for a specific question
  const handleAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => ({
        ...prev,
        [currentBlockKey]: {
          ...prev[currentBlockKey],
          [questionId]: value,
        },
      }));
    },
    [currentBlockKey]
  );

  // Navigation handlers
  const handlePrevious = () => {
    if (!isFirstBlock) {
      setCurrentBlock((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLastBlock) {
      setCurrentBlock((prev) => prev + 1);
    }
  };

  const handleBlockClick = (index: number) => {
    setCurrentBlock(index);
  };

  // Generate brandbook
  const handleGenerate = async () => {
    // Check minimum required fields
    if (!answers.identity.name) {
      toast.error('Por favor, preencha o nome do escritorio');
      setCurrentBlock(0);
      return;
    }

    if (completionPercentage < 30) {
      toast.error('Preencha pelo menos 30% do questionario para gerar o brandbook');
      return;
    }

    const result = await generate(answers);

    if (result) {
      setShowResult(true);
      onBrandbookGenerated?.(result);
    } else if (error) {
      toast.error(error);
    }
  };

  // Go back to editing
  const handleBackToEdit = () => {
    setShowResult(false);
    reset();
  };

  // Show result view if brandbook was generated
  if (showResult && brandbook) {
    return (
      <BrandbookResultView
        brandbook={brandbook}
        onBack={handleBackToEdit}
        officeName={answers.identity.name}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <BrandbookStepIndicator
        currentBlock={currentBlock}
        completedBlocks={completedBlocks}
        onBlockClick={handleBlockClick}
      />

      {/* Completion percentage */}
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          {completionPercentage}% preenchido
        </span>
      </div>

      {/* Questions */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {currentBlockData?.questions.map((question) => {
            const blockAnswers = answers[currentBlockKey] as unknown as Record<
              string,
              string | string[]
            >;
            const value = blockAnswers?.[question.id] ?? (question.type === 'multiselect' ? [] : '');

            return (
              <BrandbookQuestionField
                key={question.id}
                question={question}
                value={value}
                onChange={(newValue) => handleAnswerChange(question.id, newValue)}
                disabled={isGenerating}
              />
            );
          })}
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstBlock || isGenerating}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {!isLastBlock ? (
            <Button onClick={handleNext} disabled={isGenerating}>
              Proximo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || completionPercentage < 30}
              className="min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Brandbook
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
