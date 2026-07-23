import Skeleton from './Skeleton';

export default function ProductDetailSkeleton() {
  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <Skeleton className="w-40 h-4 mb-3" />
          <Skeleton className="w-64 h-7" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Gallery skeleton */}
          <div>
            <Skeleton className="w-full aspect-square rounded-3xl mb-4" />
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-20 h-20 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div>
            <Skeleton className="w-24 h-6 mb-3 rounded-full" />
            <Skeleton className="w-20 h-4 mb-2" />
            <Skeleton className="w-full max-w-xl h-10 mb-3" />
            <Skeleton className="w-32 h-4 mb-4" />

            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-28 h-8" />
              <Skeleton className="w-24 h-6" />
            </div>

            <Skeleton className="w-full h-4 mb-3" />
            <Skeleton className="w-11/12 h-4 mb-3" />
            <Skeleton className="w-10/12 h-4 mb-6" />

            <div className="mb-6">
              <Skeleton className="w-24 h-5 mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="w-24 h-8 rounded-full" />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <Skeleton className="w-32 h-5 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="w-full h-20 rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Skeleton className="w-36 h-12 rounded-full" />
              <Skeleton className="w-32 h-12 rounded-full" />
              <Skeleton className="w-32 h-12 rounded-full" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="w-56 h-8 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-surface-container rounded-3xl overflow-hidden">
                <Skeleton className="w-full aspect-square rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-28 h-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-9 h-9 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}