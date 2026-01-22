import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Loading skeleton for brandbook page
 * Provides visual feedback during navigation
 */
export default function BrandbookLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Preview area */}
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );
}
