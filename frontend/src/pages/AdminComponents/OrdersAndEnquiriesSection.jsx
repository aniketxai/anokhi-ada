import { Loader, Save, Reply, Eye, X, Search, Clock, TrendingUp, CheckCircle2, Printer, Download, AlertTriangle, Link2 } from 'lucide-react';
import { SectionCard, StatusPill } from './Helpers';
import { formatINR } from '../../utils/currency';
import { formatPaymentValue } from './UIComponents';
import { useState } from 'react';
import { cancelOrder, generateAdminPayLink } from '../../api/index.js';

export function OrdersSection({
  orderFilter,
  setOrderFilter,
  filteredOrders,
  handleOrderStatusSave,
  savingOrderId,
  handleViewOrder,
  onOrderUpdated,
}) {
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const shipping = order.shipping || {};
    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');
    printWindow.document.write(`
      <html>
        <head><title>Order ${order.orderNumber}</title></head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          h3 { margin-top: 0; color: #333; }
          table { width: 100%; border-collapse: collapse; }
          .totals { margin-top: 10px; text-align: right; }
        </style>
        <div class="header">
          <h2>Anokhi Ada Order Receipt</h2>
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        <div class="section">
          <h3>Customer Information</h3>
          <p><strong>${shipping.firstName} ${shipping.lastName}</strong></p>
          <p>Email: ${shipping.email || 'N/A'}</p>
          <p>Phone: ${shipping.phone || 'N/A'}</p>
        </div>
        <div class="section">
          <h3>Shipping Address</h3>
          <p>${shipping.address}<br/>
          ${shipping.apartment ? shipping.apartment + '<br/>' : ''}
          ${shipping.landmark ? 'Landmark: ' + shipping.landmark + '<br/>' : ''}
          ${shipping.city}, ${shipping.state} ${shipping.zipCode}<br/>
          ${shipping.country || 'India'}</p>
        </div>
        <div class="section">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
        </div>
        <div class="section totals">
          <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
          ${order.shippingFee ? `<p><strong>Shipping:</strong> ₹${order.shippingFee}</p>` : ''}
          ${order.codCharge ? `<p><strong>COD Charge:</strong> ₹${order.codCharge}</p>` : ''}
          <p style="font-size: 18px; margin-top: 10px;"><strong>Total: ₹${order.total}</strong></p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  const [generatedPayLink, setGeneratedPayLink] = useState(null);
  const [generatingPayLinkOrderId, setGeneratingPayLinkOrderId] = useState(null);

  const pendingOrders = (filteredOrders || []).filter(o => o.status === 'pending' || o.payment?.status === 'pending').length;
  const shippedOrders = (filteredOrders || []).filter(o => o.status === 'shipped').length;
  const failedOrdersCount = (filteredOrders || []).filter(o => o.payment?.status === 'failed' || o.status === 'failed').length;

  const handleGeneratePayLink = async (order) => {
    try {
      setGeneratingPayLinkOrderId(order._id || order.id);
      const res = await generateAdminPayLink({
        orderNumber: order.orderNumber,
        amount: order.total || order.totalAmount || 0,
        customerName: `${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}`.trim() || 'Customer',
        customerEmail: order.shipping?.email || '',
        customerPhone: order.shipping?.phone || '',
      });
      if (res?.payLink?.url) {
        setGeneratedPayLink(res.payLink.url);
        navigator.clipboard.writeText(res.payLink.url).catch(() => {});
        alert(`Payment link generated and copied to clipboard!\n${res.payLink.url}`);
      }
    } catch (err) {
      alert(`Failed to generate payment link: ${err.message}`);
    } finally {
      setGeneratingPayLinkOrderId(null);
    }
  };

  const searchedOrders = searchTerm 
    ? (filteredOrders || []).filter(o => 
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shipping?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.payment?.failureReason?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredOrders;

  const handleQuickCancel = async (orderId) => {
    try {
      setCancelingOrderId(orderId);
      setCancelError('');
      
      await cancelOrder(orderId, cancelReason);
      
      if (onOrderUpdated) {
        const cancelledOrder = filteredOrders.find(o => o._id === orderId);
        if (cancelledOrder) {
          onOrderUpdated({ ...cancelledOrder, status: 'cancelled' });
        }
      }
      
      setShowCancelDialog(null);
      setCancelReason('');
    } catch (error) {
      setCancelError(error.message || 'Failed to cancel order');
    } finally {
      setCancelingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Orders Management"
        description="Manage orders, track shipments, verify payments, and recover failed transactions."
      >
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-2xl bg-linear-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-200 font-semibold">Pending</p>
                  <p className="text-2xl font-bold text-amber-300 mt-1">{pendingOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-400/40" />
              </div>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-red-500/10 to-red-500/5 border border-red-500/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-200 font-semibold">Failed Payments</p>
                  <p className="text-2xl font-bold text-red-300 mt-1">{failedOrdersCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400/40" />
              </div>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-sky-200 font-semibold">In Transit</p>
                  <p className="text-2xl font-bold text-sky-300 mt-1">{shippedOrders}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-sky-400/40" />
              </div>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-200 font-semibold">Total Orders</p>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">{(filteredOrders || []).length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'pending', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'cancelled'].map((option) => (
              <button
                key={option}
                onClick={() => setOrderFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-material ${orderFilter === option ? 'bg-primary text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <input
              type="text"
              placeholder="Search by order #, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/8 bg-black/20 text-sm text-foreground placeholder-secondary-text outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3">
            {(searchedOrders || []).length > 0 ? (
              searchedOrders.map((order) => {
                const customerName = order.shipping?.firstName && order.shipping?.lastName 
                  ? `${order.shipping.firstName} ${order.shipping.lastName}`
                  : order.customerName || 'Unknown';
                
                const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';
                
                return (
                  <div key={order._id || order.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                    {/* Cancel Dialog */}
                    {showCancelDialog === order._id && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/25 rounded-xl p-3">
                        <h4 className="text-sm font-semibold text-red-300 mb-2">Cancel Order?</h4>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Cancellation reason (optional)"
                          className="w-full bg-red-500/10 border border-red-500/25 rounded-lg p-2 text-xs text-foreground placeholder-secondary-text focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none mb-2"
                          rows="2"
                        />
                        {cancelError && (
                          <p className="text-xs text-red-300 mb-2">{cancelError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickCancel(order._id)}
                            disabled={cancelingOrderId === order._id}
                            className="flex-1 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
                          >
                            {cancelingOrderId === order._id ? 'Cancelling...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => {
                              setShowCancelDialog(null);
                              setCancelReason('');
                              setCancelError('');
                            }}
                            disabled={cancelingOrderId === order._id}
                            className="flex-1 px-2 py-1 rounded-lg border border-white/8 bg-white/5 text-foreground text-xs font-semibold hover:bg-white/10 disabled:opacity-60 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                        <div className="flex flex-col gap-3">
                          {/* Order Header Row */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground truncate">{order.orderNumber || order._id}</p>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="text-sm text-secondary-text mb-1">
                          {customerName} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        {order.shipping?.email && (
                          <p className="text-xs text-secondary-text truncate">{order.shipping.email}</p>
                        )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-outline">Total</p>
                              <p className="text-xl font-bold text-primary">{formatINR(order.total || order.totalAmount || 0)}</p>
                            </div>
                          </div>

                          {/* Payment & Date Info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-outline">
                            <span>Payment: {formatPaymentValue(order.payment)}</span>
                            {order.createdAt && (
                              <span>· {formatDate(order.createdAt)}</span>
                            )}
                          </div>

                          {(order.payment?.status === 'failed' || order.payment?.failureReason) && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-red-200">Payment Failure</p>
                                  <p className="mt-0.5 text-red-300/90">{order.payment?.failureReason || 'Transaction did not complete'}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleGeneratePayLink(order)}
                                disabled={generatingPayLinkOrderId === (order._id || order.id)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-500 transition-colors shrink-0 shadow-xs"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                {generatingPayLinkOrderId === (order._id || order.id) ? 'Generating...' : 'Send Pay Link'}
                              </button>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-material"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-material"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print
                            </button>
                            <button
                              onClick={() => handleGeneratePayLink(order)}
                              disabled={generatingPayLinkOrderId === (order._id || order.id)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-material"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Pay Link
                            </button>
                            {canCancel && (
                              <button
                                onClick={() => setShowCancelDialog(order._id)}
                                disabled={cancelingOrderId === order._id}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-60 transition-material"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            )}
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (newStatus !== order.status) {
                                    handleOrderStatusSave(order._id || order.id, newStatus);
                                  }
                                }}
                                disabled={savingOrderId === (order._id || order.id)}
                                className="flex-1 sm:flex-none rounded-full border border-white/8 bg-black/20 px-3 py-2 text-xs font-semibold capitalize text-foreground outline-none disabled:opacity-60"
                              >
                                {['pending', 'paid', 'failed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                  <option key={status} value={status} className="bg-background">
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {savingOrderId === (order._id || order.id) && (
                                <span className="inline-flex items-center gap-1 text-xs text-foreground shrink-0">
                                  <Loader className="w-3.5 h-3.5 animate-spin" />
                                  Updating...
                                </span>
                              )}
                            </div>
                          </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-white/8 bg-black/20 p-8 text-center">
                <p className="text-secondary-text">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function EnquiriesSection({
  enquiryFilter,
  setEnquiryFilter,
  filteredEnquiries,
  handleRespondToEnquiry,
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Enquiries Management"
        description="Respond to contact messages and quote requests."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'new', 'in-review', 'quoted', 'replied'].map((option) => (
              <button
                key={option}
                onClick={() => setEnquiryFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-material ${enquiryFilter === option ? 'bg-primary text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(filteredEnquiries || []).map((item, idx) => (
              <div key={`${item._id || idx}`} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{item.companyName || item.name}</p>
                      <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-text">
                        {item.enquiryType === 'quote' ? 'Quote' : 'Contact'}
                      </span>
                      <StatusPill status={item.status || 'new'} />
                    </div>
                    <p className="text-sm text-secondary-text truncate">{item.subject || item.message?.substring(0, 40)}</p>
                    <p className="text-xs text-outline mt-1">
                      {item.email || item.contactEmail || 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRespondToEnquiry(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-material">
                    Respond
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
