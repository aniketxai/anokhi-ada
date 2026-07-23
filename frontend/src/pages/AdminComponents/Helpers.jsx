const statusStyles = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  paid: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  processing: 'bg-sky-100 text-sky-900 border-sky-300',
  shipped: 'bg-violet-100 text-violet-900 border-violet-300',
  delivered: 'bg-teal-100 text-teal-900 border-teal-300',
  new: 'bg-sky-100 text-sky-900 border-sky-300',
  read: 'bg-amber-100 text-amber-900 border-amber-300',
  'in-review': 'bg-amber-100 text-amber-900 border-amber-300',
  quoted: 'bg-purple-100 text-purple-900 border-purple-300',
  accepted: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  completed: 'bg-teal-100 text-teal-900 border-teal-300',
  rejected: 'bg-rose-100 text-rose-900 border-rose-300',
  failed: 'bg-red-100 text-red-900 border-red-300 font-bold',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
  replied: 'bg-emerald-100 text-emerald-900 border-emerald-300',
};

export function StatusPill({ status }) {
  const className = statusStyles[status] || 'bg-accent text-accent-foreground border-border';
  const label = status === 'read' ? 'in review' : (status || '').replace('-', ' ');
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}>
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
          {description && <p className="mt-1 text-sm text-secondary-text">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
