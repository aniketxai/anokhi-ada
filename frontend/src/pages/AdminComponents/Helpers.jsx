const statusStyles = {
  pending: 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold',
  paid: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-500/40 font-bold',
  processing: 'bg-sky-500/20 text-sky-900 dark:text-sky-200 border-sky-500/40 font-bold',
  shipped: 'bg-violet-500/20 text-violet-900 dark:text-violet-200 border-violet-500/40 font-bold',
  delivered: 'bg-teal-500/20 text-teal-900 dark:text-teal-200 border-teal-500/40 font-bold',
  new: 'bg-sky-500/20 text-sky-900 dark:text-sky-200 border-sky-500/40 font-bold',
  read: 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold',
  'in-review': 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold',
  quoted: 'bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-500/40 font-bold',
  accepted: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-500/40 font-bold',
  completed: 'bg-teal-500/20 text-teal-900 dark:text-teal-200 border-teal-500/40 font-bold',
  rejected: 'bg-rose-500/20 text-rose-900 dark:text-rose-200 border-rose-500/40 font-bold',
  failed: 'bg-red-500/20 text-red-900 dark:text-red-200 border-red-500/40 font-bold',
  cancelled: 'bg-gray-500/20 text-gray-900 dark:text-gray-200 border-gray-500/40 font-bold',
  replied: 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-emerald-500/40 font-bold',
};

export function StatusPill({ status }) {
  const className = statusStyles[status] || 'bg-accent text-accent-foreground border-border font-bold';
  const label = status === 'read' ? 'in review' : (status || '').replace('-', ' ');
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${className}`}>
      {label}
    </span>
  );
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-border bg-card p-5 sm:p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm font-medium text-foreground/80 dark:text-gray-300">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
