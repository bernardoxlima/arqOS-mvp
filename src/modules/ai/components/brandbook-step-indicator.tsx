'use client';

/**
 * Brandbook Step Indicator
 * Visual progress indicator for the brandbook wizard
 */

import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { BRAND_QUESTIONS, BLOCK_ORDER, type BlockKey } from '../constants/brandbook-questions';

interface BrandbookStepIndicatorProps {
  currentBlock: number;
  completedBlocks: Set<BlockKey>;
  onBlockClick: (index: number) => void;
}

export function BrandbookStepIndicator({
  currentBlock,
  completedBlocks,
  onBlockClick,
}: BrandbookStepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
          style={{
            width: `${(currentBlock / (BLOCK_ORDER.length - 1)) * 100}%`,
          }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {BLOCK_ORDER.map((key, index) => {
            const block = BRAND_QUESTIONS[key];
            const isActive = index === currentBlock;
            const isCompleted = completedBlocks.has(key);
            const isPast = index < currentBlock;

            return (
              <button
                key={key}
                onClick={() => onBlockClick(index)}
                className={cn(
                  'flex flex-col items-center gap-1.5 transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'rounded-lg p-1 -m-1'
                )}
                type="button"
              >
                {/* Circle */}
                <div
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all',
                    isActive && 'border-primary bg-primary text-primary-foreground scale-110',
                    isCompleted && !isActive && 'border-green-500 bg-green-500 text-white',
                    isPast && !isCompleted && 'border-muted-foreground bg-muted text-muted-foreground',
                    !isActive && !isCompleted && !isPast && 'border-muted-foreground/50 bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label (hidden on mobile) */}
                <span
                  className={cn(
                    'hidden sm:block text-[10px] font-medium max-w-[60px] text-center truncate',
                    isActive && 'text-primary',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {block?.block}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current block title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {BRAND_QUESTIONS[BLOCK_ORDER[currentBlock]]?.block}
        </h3>
        <p className="text-sm text-muted-foreground">
          {BRAND_QUESTIONS[BLOCK_ORDER[currentBlock]]?.subtitle}
        </p>
      </div>
    </div>
  );
}
