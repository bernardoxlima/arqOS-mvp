import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Loading skeleton for settings page
 * Provides visual feedback during navigation
 */
export default function ConfiguracoesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-[180px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
