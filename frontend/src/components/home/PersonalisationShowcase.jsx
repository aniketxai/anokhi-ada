import PersonalisationActionBox from '../PersonalisationActionBox';

export default function PersonalisationShowcase() {
  return (
    <section className="py-16 bg-gradient-to-b from-surface to-surface-container/50 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
            Component Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mt-3 mb-2">
            Personalisation & Express Checkout
          </h2>
          <p className="text-secondary-text text-sm sm:text-base">
            Seamlessly toggle gift packaging, view offer details, and perform instant 1-click buyouts.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white dark:bg-card p-6 sm:p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-border">
          <PersonalisationActionBox />
        </div>
      </div>
    </section>
  );
}
