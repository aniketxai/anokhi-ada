import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  LogOut,
  Save,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import { formatINR } from '../utils/currency';
import api from '../api';

const STATUS_COLOR = {
  pending: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  paid: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  processing: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-500 border-red-500/30',
};

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
  });

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await api.fetchCustomerOrders();
      setOrders(res.data || []);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMessage({ type: '', text: '' });
    try {
      await api.updateCustomerProfile(formData);
      setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setUpdateMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackRedirect = (order) => {
    const contact = user?.email || order.shipping?.email || order.shipping?.phone || '';
    navigate(`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&contact=${encodeURIComponent(contact)}`);
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-20 min-h-screen relative">
      <BlurBlob className="w-[20rem] h-[20rem] sm:w-[28rem] sm:h-[28rem] top-10 right-4 bg-primary/10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header card */}
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-foreground/60 flex items-center gap-2 mt-1">
                  <Mail size={14} /> {user.email}
                  {user.phone && <span className="flex items-center gap-1"><Phone size={14} className="ml-2" /> {user.phone}</span>}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-t border-border pt-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-muted text-foreground/70 hover:text-foreground hover:bg-surface-muted/80'
              }`}
            >
              <Package size={16} /> Order History ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'account'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-muted text-foreground/70 hover:text-foreground hover:bg-surface-muted/80'
              }`}
            >
              <User size={16} /> Account Details
            </button>
          </div>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="text-primary" size={20} /> My Orders
              </h2>
              <button
                onClick={loadOrders}
                className="text-xs text-primary font-medium hover:underline"
              >
                Refresh
              </button>
            </div>

            {ordersLoading ? (
              <div className="bg-surface-container rounded-3xl p-12 text-center border border-border text-foreground/60">
                Loading your orders...
              </div>
            ) : ordersError ? (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {ordersError}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-surface-container rounded-3xl p-12 text-center border border-border space-y-4">
                <Package size={48} className="mx-auto text-foreground/30" />
                <h3 className="text-lg font-semibold">No orders yet</h3>
                <p className="text-sm text-foreground/60 max-w-sm mx-auto">
                  You haven't placed any orders with us yet. Browse our luxury catalog to place your first order!
                </p>
                <Button onClick={() => navigate('/products')}>Explore Products</Button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id || order.orderNumber}
                  className="bg-surface-container rounded-3xl p-6 border border-border space-y-4 hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between flex-wrap gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Order</span>
                        <span className="text-base font-bold text-foreground">{order.orderNumber}</span>
                      </div>
                      <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-1">
                        <Calendar size={13} /> Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                          STATUS_COLOR[order.status] || 'bg-surface-muted text-foreground border-border'
                        }`}
                      >
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleTrackRedirect(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                      >
                        <Truck size={14} /> Track Order
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover border border-border"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-surface-muted flex items-center justify-center text-foreground/40">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-xs text-foreground/60">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Tracking Link */}
                  <div className="border-t border-border pt-3 flex items-center justify-between flex-wrap gap-2 text-xs text-foreground/70">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <CreditCard size={13} /> {order.payment?.method?.toUpperCase() || 'ONLINE'} (
                        {order.payment?.status === 'paid' ? 'Paid' : 'Pending'})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> Deliver to {order.shipping?.city}, {order.shipping?.state}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-foreground/50 font-medium">Total: </span>
                      <span className="text-base font-bold text-primary">{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Account Details */}
        {activeTab === 'account' && (
          <div className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <User className="text-primary" size={20} /> Account Details &amp; Address
            </h2>

            {updateMessage.text && (
              <div
                className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
                  updateMessage.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {updateMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{updateMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-foreground/80 mb-1.5">Full Name</span>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-foreground/80 mb-1.5">Email Address (Read-only)</span>
                  <input
                    value={user.email}
                    disabled
                    className="w-full rounded-full bg-surface-muted/50 border border-border px-5 py-2.5 text-sm outline-none opacity-70 cursor-not-allowed"
                  />
                </label>
              </div>

              <label className="block">
                <span className="block text-sm font-medium text-foreground/80 mb-1.5">Phone Number</span>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                />
              </label>

              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> Default Shipping Address
                </h3>

                <div className="space-y-4">
                  <label className="block">
                    <span className="block text-xs font-medium text-foreground/70 mb-1">Street / House Address</span>
                    <input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 102 Royal Palm Apartment"
                      className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="block">
                      <span className="block text-xs font-medium text-foreground/70 mb-1">City</span>
                      <input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-medium text-foreground/70 mb-1">State</span>
                      <input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="e.g. Maharashtra"
                        className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-medium text-foreground/70 mb-1">ZIP / Pincode</span>
                      <input
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="e.g. 400001"
                        className="w-full rounded-full bg-surface-muted border border-border px-5 py-2.5 text-sm outline-none focus:border-primary transition-all"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" icon={Save} disabled={updating} className="w-full sm:w-auto">
                  {updating ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
