const statusStyles = {
  pending:    'bg-amber-100   text-amber-800   border-amber-300   font-bold',
  paid:       'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  processing: 'bg-sky-100     text-sky-800     border-sky-300     font-bold',
  shipped:    'bg-violet-100  text-violet-800  border-violet-300  font-bold',
  delivered:  'bg-teal-100    text-teal-800    border-teal-300    font-bold',
  new:        'bg-sky-100     text-sky-800     border-sky-300     font-bold',
  read:       'bg-amber-100   text-amber-800   border-amber-300   font-bold',
  'in-review':'bg-amber-100   text-amber-800   border-amber-300   font-bold',
  quoted:     'bg-purple-100  text-purple-800  border-purple-300  font-bold',
  accepted:   'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  completed:  'bg-teal-100    text-teal-800    border-teal-300    font-bold',
  rejected:   'bg-rose-100    text-rose-800    border-rose-300    font-bold',
  failed:     'bg-red-100     text-red-800     border-red-300     font-bold',
  cancelled:  'bg-gray-100    text-gray-700    border-gray-300    font-bold',
  replied:    'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
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
