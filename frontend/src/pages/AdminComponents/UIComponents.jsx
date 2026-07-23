export function MiniFeature({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-outline">{label}</p>
      <p className="mt-2 text-2xl font-bold font-display text-foreground">{value}</p>
    </div>
  );
}

export function Field({ label, value, textarea = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-outline">{label}</span>
      {textarea ? (
        <textarea
          rows={4}
          defaultValue={value}
          className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <input
          defaultValue={value}
          className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
      )}
    </label>
  );
}

export function AlertRow({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-sm text-secondary-text truncate">{title}</p>
      </div>
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">{value}</span>
    </div>
  );
}

export function ToggleRow({ title, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-secondary-text mt-1">{value}</p>
      </div>
      <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.5)]" />
    </div>
  );
}

export function formatPaymentValue(payment) {
  if (!payment) return 'N/A';
  if (typeof payment === 'string') return payment;
  if (typeof payment === 'object') {
    const method = payment.method ? String(payment.method).toUpperCase() : '';
    const last4 = payment.last4 ? ` •••• ${payment.last4}` : '';
    const ref = payment.reference ? ` • ${payment.reference}` : '';
    return `${method}${last4}${ref}`.trim() || 'N/A';
  }
  return String(payment);
}
