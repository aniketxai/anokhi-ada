import SectionHeader from '../common/SectionHeader';
import CategoryCard from '../common/CategoryCard';
import { categories } from '../../data/categories';

export default function FeaturedCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <SectionHeader
        eyebrow="Shop by category"
        title="Featured Categories"
        subtitle="Find exactly what you're printing for."
        viewAllHref="/products"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((c, i) => (
          <CategoryCard key={c.id} category={c} index={i} />
        ))}
      </div>
    </section>
  );
}
