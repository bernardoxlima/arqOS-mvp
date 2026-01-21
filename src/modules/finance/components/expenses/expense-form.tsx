'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form';
import { createExpenseSchema, type CreateExpenseInput } from '../../schemas';
import { EXPENSE_CATEGORIES } from '../../constants';
import type { ExpenseCategory, CreateExpenseData } from '../../types';

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseData) => Promise<boolean>;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: 'fixo',
      description: '',
      value: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleSubmit = async (data: CreateExpenseInput) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data as CreateExpenseData);
      if (success) {
        form.reset({
          category: 'fixo',
          description: '',
          value: 0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg border"
      >
        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-full sm:w-[180px]">
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {EXPENSE_CATEGORIES[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Descrição da despesa"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Value */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem className="w-full sm:w-[150px]">
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="pl-10"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="w-full sm:w-[150px]">
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
