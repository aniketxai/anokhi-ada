import { X, Package, MapPin, CreditCard, Clock, AlertCircle, Copy, CheckCircle2, Phone, Mail, Download, Send } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { useState } from 'react';
import { cancelOrder } from '../../api/index.js';

export function OrderDetailModal({ isOpen, order, onClose, onOrderUpdated, onPaymentVerificationSave }) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // No-op
    }
  };

  const handleExportOrder = () => {
    if (!order) return;
    const { orderNumber, items, shipping, payment, subtotal, shippingFee, codCharge, total, status, notes, createdAt } = order;
    const orderData = {
      orderNumber,
      items,
      shipping,
      payment,
      subtotal,
      shippingFee,
      codCharge,
      total,
      status,
      notes,
      createdAt,
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(orderData, null, 2)));
    element.setAttribute('download', `order-${orderNumber}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareOnWhatsapp = () => {
    if (!order) return;
    const { orderNumber, total, status, shipping } = order;
    const message = `Order ${orderNumber}: ${formatINR(total)} - Status: ${status}. Customer: ${shipping.firstName} ${shipping.lastName}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen || !order) return null;

  const {
    orderNumber,
    items = [],
    shipping = {},
    payment = {},
    subtotal = 0,
    shippingFee = 0,
    total = 0,
    status = 'pending',
    notes = '',
    createdAt,
    codCharge = 0,
  } = order;

  const handleCancelOrder = async () => {
    try {
      setIsCanceling(true);
      setCancelError('');
      
      await cancelOrder(order._id, cancelReason);
      
      if (onOrderUpdated) {
        onOrderUpdated({ ...order, status: 'cancelled' });
      }
      
      setShowCancelPrompt(false);
      setCancelReason('');
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setCancelError(error.message || 'Failed to cancel order');
    } finally {
      setIsCanceling(false);
    }
  };

  const canCancel = status !== 'cancelled' && status !== 'delivered';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    processing: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
    shipped: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    delivered: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
    cancelled: 'bg-red-500/15 text-red-300 border-red-500/25',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/8 bg-background p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-secondary-text">{orderNumber}</p>
              <button
                onClick={() => handleCopy(orderNumber, 'order')}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                {copiedText === 'order' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-text hover:text-foreground" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize border ${
              statusColors[status] || statusColors.pending
            }`}
          >
            {status}
          </span>
          {createdAt && (
            <p className="text-xs text-secondary-text mt-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(createdAt)}
            </p>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4.5 h-4.5" />
            Order Items
          </h3>
          <div className="space-y-2 bg-white/5 rounded-2xl p-4">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-secondary-text">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground">{formatINR(item.price * item.quantity)}</p>
                    <p className="text-xs text-secondary-text">{formatINR(item.price)} each</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary-text">No items in this order</p>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="mb-6 bg-white/5 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-text">Subtotal</span>
            <span className="text-foreground">{formatINR(subtotal)}</span>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary-text">Shipping Fee</span>
              <span className="text-foreground">{formatINR(shippingFee)}</span>
            </div>
          )}
          {codCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary-text">COD Charge</span>
              <span className="text-foreground">{formatINR(codCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{formatINR(total)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4.5 h-4.5" />
            Shipping Address
          </h3>
          <div className="bg-white/5 rounded-2xl p-4 space-y-1">
            <p className="font-semibold text-foreground">
              {shipping.firstName} {shipping.lastName}
            </p>
            <p className="text-sm text-secondary-text">{shipping.address}</p>
            {shipping.apartment && (
              <p className="text-sm text-secondary-text">{shipping.apartment}</p>
            )}
            {shipping.landmark && (
              <p className="text-sm text-secondary-text">Landmark: {shipping.landmark}</p>
            )}
            <p className="text-sm text-secondary-text">
              {shipping.city}, {shipping.state} {shipping.zipCode}
            </p>
            {shipping.country && (
              <p className="text-sm text-secondary-text">{shipping.country}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Contact Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {shipping.email && (
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-secondary-text">Email</p>
                    <p className="font-semibold text-foreground truncate">{shipping.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(shipping.email, 'email')}
                  className="ml-2 p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                  {copiedText === 'email' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary-text hover:text-foreground" />
                  )}
                </button>
              </div>
            )}
            {shipping.phone && (
              <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-secondary-text">Phone</p>
                    <p className="font-semibold text-foreground truncate">{shipping.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(shipping.phone, 'phone')}
                  className="ml-2 p-2 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                >
                  {copiedText === 'phone' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary-text hover:text-foreground" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4.5 h-4.5" />
            Payment Information
          </h3>
          <div className="bg-linear-to-br from-white/8 to-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
            <div className="flex justify-between">
              <span className="text-secondary-text">Method</span>
              <span className="font-semibold text-foreground capitalize">
                {payment.method || 'Not specified'}
              </span>
            </div>
            {payment.last4 && (
              <div className="flex justify-between">
                <span className="text-secondary-text">Card (Last 4)</span>
                <span className="font-semibold text-foreground">****{payment.last4}</span>
              </div>
            )}
            {payment.reference && (
              <div className="flex justify-between gap-4 items-center">
                <span className="text-secondary-text">UPI Ref</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-right break-all">{payment.reference}</span>
                  <button
                    onClick={() => handleCopy(payment.reference, 'reference')}
                    className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                  >
                    {copiedText === 'reference' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-secondary-text hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-secondary-text font-semibold">Verification</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${payment.verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`font-semibold ${payment.verified ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {payment.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
            {(payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl) && (
              <div className="pt-2">
                <p className="text-secondary-text text-sm font-semibold mb-2">Payment Proof</p>
                <a
                  href={payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl border border-white/10 bg-black/40 hover:border-white/20 transition-colors"
                >
                  <img
                    src={payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl}
                    alt={payment.screenshotName || payment.paymentScreenshotName || 'Payment screenshot'}
                    className="max-h-72 w-full object-contain"
                  />
                </a>
                {(payment.screenshotName || payment.paymentScreenshotName) && (
                  <p className="mt-2 text-xs text-outline break-all">{payment.screenshotName || payment.paymentScreenshotName}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Order Notes</h3>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm text-secondary-text whitespace-pre-wrap">{notes}</p>
            </div>
          </div>
        )}

        {/* Cancel Prompt */}
        {showCancelPrompt && (
          <div className="mb-6 bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-300 mb-2">Cancel Order</h4>
                <p className="text-sm text-red-200 mb-4">
                  Are you sure you want to cancel this order? A cancellation email will be sent to the customer.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason (optional)"
                  className="w-full bg-red-500/10 border border-red-500/25 rounded-lg p-2 text-sm text-foreground placeholder-secondary-text focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  rows="3"
                />
                {cancelError && (
                  <p className="text-xs text-red-300 mt-2">{cancelError}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCanceling}
                    className="flex-1 px-3 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {isCanceling ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelPrompt(false);
                      setCancelReason('');
                      setCancelError('');
                    }}
                    disabled={isCanceling}
                    className="flex-1 px-3 py-2 rounded-full border border-white/8 bg-white/5 text-foreground text-sm font-semibold hover:bg-white/10 disabled:opacity-60 transition-colors"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleExportOrder}
            className="flex-1 px-4 py-2 rounded-full bg-blue-600/20 text-blue-300 border border-blue-600/30 font-semibold text-sm hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleShareOnWhatsapp}
            className="flex-1 px-4 py-2 rounded-full bg-green-600/20 text-green-300 border border-green-600/30 font-semibold text-sm hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {(payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl) && typeof onPaymentVerificationSave === 'function' && (
            <div className="bg-linear-to-r from-emerald-500/5 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Payment Verification</p>
              <div className="flex gap-3">
                <button
                  onClick={() => onPaymentVerificationSave(order._id, true, {
                    reference: payment.reference,
                    screenshotUrl: payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl,
                    screenshotName: payment.screenshotName || payment.paymentScreenshotName,
                  })}
                  className={`flex-1 px-4 py-2 rounded-full font-semibold transition-colors ${payment.verified ? 'bg-emerald-600 text-white' : 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30'}`}
                >
                  {payment.verified ? '✓ Verified' : 'Mark Verified'}
                </button>
                <button
                  onClick={() => onPaymentVerificationSave(order._id, false, {
                    reference: payment.reference,
                    screenshotUrl: payment.screenshotUrl || payment.screenshot || payment.paymentScreenshotUrl,
                    screenshotName: payment.screenshotName || payment.paymentScreenshotName,
                  })}
                  className={`flex-1 px-4 py-2 rounded-full font-semibold transition-colors ${!payment.verified ? 'bg-amber-600 text-white' : 'bg-amber-600/20 text-amber-300 border border-amber-600/30 hover:bg-amber-600/30'}`}
                >
                  Mark Unverified
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {canCancel && !showCancelPrompt && (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="flex-1 px-4 py-3 rounded-full bg-red-600/20 text-red-300 border border-red-600/30 font-semibold hover:bg-red-600/30 transition-colors"
              >
                Cancel Order
              </button>
            )}
            <button
              onClick={onClose}
              className={`${canCancel && !showCancelPrompt ? 'flex-1' : 'w-full'} px-4 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
