import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Loading skeleton for calculator page
 * Provides visual feedback during navigation
 */
export default function CalculadoraLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Calculator container */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress steps */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Form content */}
          <Skeleton className="h-[400px] w-full rounded-lg" />

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
