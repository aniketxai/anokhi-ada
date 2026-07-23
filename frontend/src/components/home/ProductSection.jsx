import SectionHeader from '../common/SectionHeader';
import ProductGrid from '../product/ProductGrid';

export default function ProductSection({ eyebrow, title, subtitle, products, viewAllHref }) {
  if (!products?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
