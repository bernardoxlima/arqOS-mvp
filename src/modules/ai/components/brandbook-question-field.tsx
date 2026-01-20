'use client';

/**
 * Brandbook Question Field
 * Renders appropriate input based on question type
 */

import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import type { BrandQuestion } from '../constants/brandbook-questions';

interface BrandbookQuestionFieldProps {
  question: BrandQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export function BrandbookQuestionField({
  question,
  value,
  onChange,
  disabled = false,
}: BrandbookQuestionFieldProps) {
  const handleMultiselectToggle = (option: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (currentValue.includes(option)) {
      onChange(currentValue.filter((v) => v !== option));
    } else {
      onChange([...currentValue, option]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm font-medium">
        {question.label}
      </Label>

      {/* Text input */}
      {question.type === 'text' && (
        <Input
          id={question.id}
          placeholder={question.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}

      {/* Textarea input */}
      {question.type === 'textarea' && (
        <Textarea
          id={question.id}
          placeholder={question.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[100px] resize-none"
        />
      )}

      {/* Select input */}
      {question.type === 'select' && question.options && (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={question.id}>
            <SelectValue placeholder="Selecione uma opcao" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Multiselect (badge pills) */}
      {question.type === 'multiselect' && question.options && (
        <div className="flex flex-wrap gap-2 pt-1">
          {question.options.map((option) => {
            const isSelected = Array.isArray(value) && value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => !disabled && handleMultiselectToggle(option)}
                disabled={disabled}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
              >
                <Badge
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    isSelected && 'bg-primary hover:bg-primary/90',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
