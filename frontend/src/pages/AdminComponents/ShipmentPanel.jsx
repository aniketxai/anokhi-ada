import { useEffect, useState } from 'react';
import { Truck, Save, AlertCircle, CheckCircle2, Calendar, MapPin, Plus, Trash2, ExternalLink, Link as LinkIcon, Navigation } from 'lucide-react';
import api from '../../api/index.js';

const COURIER_OPTIONS = [
  'Delhivery',
  'BlueDart',
  'DTDC',
  'Shadowfax',
  'India Post',
  'FedEx',
  'Ecom Express',
  'Xpressbees',
  'Custom Courier',
];

const STATUS_OPTIONS = [
  { value: 'created', label: 'Order Confirmed' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LOCATION_PRESETS = [
  { label: '🏢 Main Warehouse (Delhi Hub)', location: 'Central Warehouse, New Delhi', status: 'created', desc: 'Package packed and ready for carrier pickup' },
  { label: '🚚 In Transit (Regional Hub)', location: 'Regional Gateway Sorting Facility', status: 'in_transit', desc: 'Package in transit to destination city' },
  { label: '📦 Local Delivery Center', location: 'Local Distribution Hub', status: 'in_transit', desc: 'Package arrived at local delivery center' },
  { label: '🚴 Out for Delivery', location: 'Local Area Center', status: 'out_for_delivery', desc: 'Package assigned to delivery rider' },
  { label: '✅ Delivered to Customer', location: 'Customer Address', status: 'delivered', desc: 'Package delivered successfully' },
];

export function ShipmentPanel({ order, onShipmentUpdated }) {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const orderId = order?._id || order?.id;

  // Form state
  const [courier, setCourier] = useState('Delhivery');
  const [waybill, setWaybill] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [status, setStatus] = useState('created');
  const [statusDescription, setStatusDescription] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  const loadShipment = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await api.adminGetShipment(orderId);
      if (res.data) {
        setShipment(res.data);
        setCourier(res.data.courier || 'Delhivery');
        setWaybill(res.data.waybill || '');
        setTrackingUrl(res.data.trackingUrl || '');
        setStatus(res.data.status || 'created');
        setStatusDescription(res.data.statusDescription || '');
        setLocation(res.data.currentLocation || '');
        if (res.data.estimatedDeliveryDate) {
          setEstimatedDeliveryDate(new Date(res.data.estimatedDeliveryDate).toISOString().split('T')[0]);
        }
      } else {
        setShipment(null);
      }
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const applyPreset = (preset) => {
    setStatus(preset.status);
    setLocation(preset.location);
    setStatusDescription(preset.desc);
  };

  const handleSaveTracking = async (e) => {
    if (e) e.preventDefault();
    if (!orderId) return;
    setBusy(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        courier,
        waybill: waybill.trim(),
        trackingUrl: trackingUrl.trim(),
        status,
        statusDescription: statusDescription.trim() || undefined,
        location: location.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
      };

      const res = await api.adminSaveShipment(orderId, payload);
      setShipment(res.data);
      setSuccessMsg('Tracking and location details saved successfully!');
      setStatusDescription('');
      if (onShipmentUpdated) onShipmentUpdated(res.data);
    } catch (err) {
      setError(err.message || 'Failed to update shipment');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTimelineEvent = async (indexToDelete) => {
    if (!window.confirm('Delete this timeline update event?')) return;
    setBusy(true);
    try {
      const res = await api.adminSaveShipment(orderId, {
        deleteTimelineIndex: indexToDelete,
        courier,
        waybill,
        trackingUrl,
        status,
        estimatedDeliveryDate,
      });
      setShipment(res.data);
      setSuccessMsg('Timeline event deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Manual Order &amp; Live Location Tracking Manager
        </h3>
        {shipment?.lastSyncedAt && (
          <span className="text-xs text-secondary-text">
            Last update: {new Date(shipment.lastSyncedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/15 text-red-400 px-3 py-2 text-xs border border-red-500/20">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-500/15 text-emerald-400 px-3 py-2 text-xs border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-secondary-text">Loading shipment and location details...</p>
      ) : (
        <form onSubmit={handleSaveTracking} className="space-y-4">
          {/* Presets Quick Picker */}
          <div>
            <span className="block text-xs font-semibold text-secondary-text mb-1.5 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-primary" /> Quick Location &amp; Milestone Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 text-[11px] text-foreground font-medium transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1">Courier Partner</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1">AWB / Tracking Number</label>
              <input
                value={waybill}
                onChange={(e) => setWaybill(e.target.value)}
                placeholder="e.g. DEL123456789"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1">Current Tracking Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-semibold"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1">Estimated Delivery Date</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Location & Details Update */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Current Location Update
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai Gateway Sorting Hub"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-text mb-1">Status Description / Custom Note</label>
              <input
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
                placeholder="e.g. Scanned at facility en-route to customer"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-text mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-primary" /> External Live Tracking URL (Optional)
            </label>
            <input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="e.g. https://www.delhivery.com/track/package/DEL12345"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              {busy ? 'Updating...' : 'Add Location & Save Tracking'}
            </button>
          </div>

          {/* Timeline Events List */}
          {shipment?.statusHistory?.length > 0 && (
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> Recorded Location &amp; Tracking History ({shipment.statusHistory.length})
                </p>
                {shipment.currentLocation && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Live Location: {shipment.currentLocation}
                  </span>
                )}
              </div>

              <ol className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {shipment.statusHistory
                  .slice()
                  .reverse()
                  .map((event, reverseIdx) => {
                    const originalIdx = shipment.statusHistory.length - 1 - reverseIdx;
                    return (
                      <li key={reverseIdx} className="text-xs bg-white/5 p-3 rounded-xl border border-white/10 flex items-start justify-between gap-3 hover:border-white/20 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground capitalize bg-white/10 px-2 py-0.5 rounded-md">
                              {event.status.replace('_', ' ')}
                            </span>
                            {event.location && (
                              <span className="text-primary font-semibold flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {event.location}
                              </span>
                            )}
                          </div>
                          {event.statusDescription && (
                            <p className="text-secondary-text mt-1">{event.statusDescription}</p>
                          )}
                          <p className="text-[10px] text-secondary-text/70 mt-1">
                            {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTimelineEvent(originalIdx)}
                          className="text-secondary-text hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                          title="Delete this update event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
              </ol>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
