const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  processing: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  shipped: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  delivered: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  new: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  read: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  'in-review': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  quoted: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  completed: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  replied: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

export function StatusPill({ status }) {
  const className = statusStyles[status] || 'bg-white/10 text-secondary-text border-white/10';
  const label = status === 'read' ? 'in review' : status.replace('-', ' ');
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}>
      {label}
    </span>
  );
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-white/8 bg-white/3 p-5 sm:p-6 shadow-soft ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-secondary-text">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
