import ProductCard from './ProductCard';

export default function ProductGrid({ products, columns = 4 }) {
  const cols = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  if (!products || products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No products to show yet.
      </p>
    );
  }

  return (
    <div className={`grid ${cols} gap-3 sm:gap-5 lg:gap-6`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
