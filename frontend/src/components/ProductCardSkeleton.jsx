import Skeleton from './Skeleton';

export default function ProductCardSkeleton() {
  return (
    <div className="group relative">
      <div className="bg-surface-container rounded-3xl overflow-hidden">
        {/* Image skeleton */}
        <div className="relative aspect-square overflow-hidden bg-surface-muted">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Info skeleton */}
        <div className="p-4">
          <div className="mb-2">
            <Skeleton className="w-20 h-3 mb-2" />
            <Skeleton className="w-full h-4" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-6 h-3" />
            <Skeleton className="w-10 h-3" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
