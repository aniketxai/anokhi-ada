import Skeleton from './Skeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function HomePageSkeleton() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[80vh] flex items-center pt-8 sm:pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10 w-full">
          <div className="max-w-4xl">
            <Skeleton className="w-44 h-7 rounded-full mb-6" />
            <Skeleton className="w-full max-w-3xl h-14 sm:h-20 mb-6" />
            <Skeleton className="w-full max-w-2xl h-5 sm:h-6 mb-3" />
            <Skeleton className="w-11/12 max-w-xl h-5 sm:h-6 mb-8" />

            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="w-44 h-12 rounded-full" />
              <Skeleton className="w-40 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-3 sm:py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="w-24 h-8 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-8 pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Skeleton className="w-36 h-4 mb-3" />
          <Skeleton className="w-80 h-10 mb-4" />
          <Skeleton className="w-full max-w-2xl h-4 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="w-28 h-4 mb-3" />
          <Skeleton className="w-64 h-8 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-background rounded-3xl p-6">
                <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
                <Skeleton className="w-40 h-5 mb-3" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-5/6 h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}