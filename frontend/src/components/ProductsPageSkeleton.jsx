import Skeleton from './Skeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

export default function ProductsPageSkeleton() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 mx-auto text-center">
          <Skeleton className="w-24 h-4 mx-auto mb-3" />
          <Skeleton className="w-64 h-8 mx-auto mb-4" />
          <Skeleton className="w-full max-w-xl h-4 mx-auto" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-full sm:w-44 rounded-2xl hidden sm:block" />
          <Skeleton className="h-12 w-full sm:w-28 rounded-2xl sm:hidden" />
        </div>

        <div className="hidden sm:flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="w-24 h-10 rounded-full" />
          ))}
        </div>

        <Skeleton className="w-40 h-4 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}