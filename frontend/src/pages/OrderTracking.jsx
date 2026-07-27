import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, AlertCircle, Truck, CheckCircle2, Clock, MapPin, XCircle, Calendar, ExternalLink } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import api from '../api';

const STATUS_ICON = {
  created: Clock,
  pickup_scheduled: Clock,
  picked_up: Package,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  ndr: AlertCircle,
  rto: XCircle,
  cancelled: XCircle,
};

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialContact = searchParams.get('contact') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fetchTracking = async (ordNum, cntct) => {
    if (!ordNum || !cntct) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.trackOrder({ orderNumber: ordNum.trim(), contact: cntct.trim() });
      setResult(res.data);
    } catch (err) {
      setError(err.message || 'We could not find that order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialContact) {
      fetchTracking(initialOrderNumber, initialContact);
    }
  }, [initialOrderNumber, initialContact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderNumber, contact);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] top-20 right-6 bg-secondary-container" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          label="Live Order Status"
          title="Track Your Shipment"
          description="Enter your order number and email or phone to view live tracking and location updates."
        />

        <form onSubmit={handleSubmit} className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-4 shadow-sm">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 text-red-500 px-4 py-3 text-sm border border-red-500/20">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-foreground/80 mb-1.5">Order Number</span>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. SBX-123456"
              required
              className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-foreground/80 mb-1.5">Email or Phone (used at checkout)</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="you@example.com or 98765xxxxx"
              required
              className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
            />
          </label>

          <Button type="submit" icon={Search} className="w-full" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </Button>
        </form>

        {result && <TrackingResult data={result} />}
      </div>
    </div>
  );
}

function TrackingResult({ data }) {
  const { orderNumber, orderStatus, placedAt, items, shipping, shipment } = data;

  return (
    <div className="mt-8 bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-6 shadow-md">
      <div className="flex items-start justify-between flex-wrap gap-2 border-b border-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-foreground/50">Order Number</p>
          <p className="text-xl font-bold text-foreground">{orderNumber}</p>
          <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1">
            <Calendar size={13} /> Placed{' '}
            {placedAt ? new Date(placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold capitalize border border-primary/20">
          {orderStatus}
        </span>
      </div>

      {shipment ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4 bg-surface-muted p-4 sm:p-5 rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                <Truck size={22} />
              </div>
              <div>
                <p className="font-bold text-base text-foreground">{shipment.statusLabel}</p>
                <p className="text-xs text-foreground/70 mt-0.5">
                  Courier Partner: <span className="font-semibold text-foreground">{shipment.courier || 'Express Delivery'}</span>
                  {shipment.waybill ? ` · AWB: ${shipment.waybill}` : ''}
                </p>
                {shipment.currentLocation && (
                  <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-1.5">
                    <MapPin size={13} /> Current Location: {shipment.currentLocation}
                  </p>
                )}
                {shipment.estimatedDeliveryDate && (
                  <p className="text-xs text-foreground/60 mt-1">
                    Est. Delivery: <span className="font-semibold text-foreground">{new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </p>
                )}
              </div>
            </div>

            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <ExternalLink size={14} /> Carrier Live Tracking
              </a>
            )}
          </div>

          {shipment.timeline?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-foreground/50 mb-4">Location &amp; Tracking History</p>
              <ol className="relative border-l-2 border-primary/30 ml-4 space-y-6 pl-6">
                {shipment.timeline
                  .slice()
                  .reverse()
                  .map((event, idx) => {
                    const Icon = STATUS_ICON[event.status] || MapPin;
                    return (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[calc(1.5rem+1px)] top-0 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center text-primary shadow-xs">
                          <Icon size={12} />
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{event.label}</p>
                          {event.location && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center gap-1 border border-primary/20">
                              <MapPin size={10} /> {event.location}
                            </span>
                          )}
                        </div>
                        {event.statusDescription && event.statusDescription !== event.label && (
                          <p className="text-xs text-foreground/70 mt-0.5">{event.statusDescription}</p>
                        )}
                        <p className="text-[11px] text-foreground/50 mt-1">
                          {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </li>
                    );
                  })}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-foreground/70">
          Your order has been confirmed. Live location and tracking details will appear here once dispatched.
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs uppercase tracking-wider font-semibold text-foreground/50 mb-3">Ordered Items</p>
        <ul className="space-y-2 text-sm">
          {items?.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-foreground/90">
              <span className="font-medium">{item.name} × {item.quantity}</span>
            </li>
          ))}
        </ul>
        {shipping && (
          <p className="text-xs text-foreground/50 mt-4 border-t border-border/50 pt-2">
            Shipping to {shipping.city}, {shipping.state} — {shipping.zipCode}
          </p>
        )}
      </div>
    </div>
  );
}
