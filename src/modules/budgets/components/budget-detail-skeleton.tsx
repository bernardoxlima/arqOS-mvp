"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * BudgetDetailSkeleton - Loading skeleton for budget detail page
 */
export function BudgetDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-20 rounded-sm" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items table skeleton */}
          <div className="arq-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Category summary skeleton */}
          <div className="arq-card">
            <div className="p-4 border-b border-border">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded-sm" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Value card */}
        <div className="space-y-6">
          <div className="arq-card-dark p-5 space-y-4">
            <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
            <Skeleton className="h-10 w-40 bg-primary-foreground/20" />
            <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
            <div className="space-y-3 pt-4 border-t border-primary-foreground/20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
                  <Skeleton className="h-4 w-16 bg-primary-foreground/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
