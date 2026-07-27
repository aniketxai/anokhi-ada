import { useEffect, useState } from 'react';
import { Users, Search, Ban, CheckCircle2, Eye, Mail, Phone, MapPin, ShoppingBag, X, ShieldAlert, DollarSign } from 'lucide-react';
import api from '../../api/index.js';
import { formatINR } from '../../utils/currency.js';

export function CustomersSection() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Selected customer modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadData = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      // Fetch registered users and orders concurrently
      const [usersRes, ordersRes] = await Promise.allSettled([
        api.adminFetchUsers(query),
        api.fetchAdminOrders ? api.fetchAdminOrders() : Promise.resolve({ data: [] }),
      ]);

      let userList = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        userList = usersRes.value.data;
      }

      let orderList = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        orderList = ordersRes.value.data;
      }

      setOrders(orderList);

      // Extract unique customers from orders who may not be in userList yet
      const orderCustomerMap = new Map();
      orderList.forEach((ord) => {
        const email = ord.shipping?.email?.toLowerCase();
        if (email && !userList.some((u) => u.email?.toLowerCase() === email)) {
          if (!orderCustomerMap.has(email)) {
            orderCustomerMap.set(email, {
              _id: `guest_${email}`,
              name: `${ord.shipping?.firstName || ''} ${ord.shipping?.lastName || ''}`.trim() || 'Guest Customer',
              email,
              phone: ord.shipping?.phone || '',
              address: ord.shipping?.address || '',
              city: ord.shipping?.city || '',
              state: ord.shipping?.state || '',
              zipCode: ord.shipping?.zipCode || '',
              isBlocked: false,
              isGuest: true,
              createdAt: ord.createdAt,
            });
          }
        }
      });

      const combinedUsers = [...userList, ...Array.from(orderCustomerMap.values())];
      setUsers(combinedUsers);
    } catch (err) {
      setError(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData(q);
  };

  const toggleBlock = async (user) => {
    if (user.isGuest) {
      alert('Guest order customer cannot be blocked until registered.');
      return;
    }
    setBusyId(user._id);
    try {
      await api.adminSetUserBlocked(user._id, !user.isBlocked);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'active') return !u.isBlocked;
    if (statusFilter === 'blocked') return u.isBlocked;
    return true;
  });

  const totalCustomers = users.length;
  const activeCustomers = users.filter((u) => !u.isBlocked).length;
  const blockedCustomers = users.filter((u) => u.isBlocked).length;

  const getCustomerOrders = (email) => {
    if (!email) return [];
    return orders.filter((o) => o.shipping?.email?.toLowerCase() === email.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Customer Management
          </h2>
          <p className="text-xs text-secondary-text mt-0.5">
            Manage registered accounts, view customer details, order history, and block suspicious users.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customer name, email or phone"
            className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-foreground placeholder-secondary-text outline-none focus:border-primary w-64 sm:w-80"
          />
          <button type="submit" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-text font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCustomers}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-text font-medium">Active Customers</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCustomers}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-text font-medium">Blocked Customers</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{blockedCustomers}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'active', 'blocked'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              statusFilter === st ? 'bg-primary text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'
            }`}
          >
            {st} ({st === 'all' ? totalCustomers : st === 'active' ? activeCustomers : blockedCustomers})
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

      {/* Customers Table */}
      <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-secondary-text border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Contact Info</th>
              <th className="px-4 py-3 font-semibold">Total Orders</th>
              <th className="px-4 py-3 font-semibold">Joined Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary-text">
                  Loading customer records...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-secondary-text">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const userOrders = getCustomerOrders(u.email);
                const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

                return (
                  <tr key={u._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground font-semibold flex items-center gap-1.5">
                        {u.name}
                        {u.isGuest && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-secondary-text">
                            Guest
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-secondary-text flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {u.email}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-secondary-text text-xs">
                      {u.phone ? (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </p>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground">{userOrders.length} orders</span>
                      {totalSpent > 0 && (
                        <p className="text-xs text-primary font-medium">{formatINR(totalSpent)}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-secondary-text text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.isBlocked
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCustomer({ ...u, orders: userOrders, totalSpent })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>

                      {!u.isGuest && (
                        <button
                          onClick={() => toggleBlock(u)}
                          disabled={busyId === u._id}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                            u.isBlocked
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                          }`}
                        >
                          {u.isBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-xs text-secondary-text">{selectedCustomer.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <p className="text-secondary-text font-semibold mb-1">Contact Details</p>
                <p className="text-foreground font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> {selectedCustomer.email}
                </p>
                <p className="text-foreground font-medium flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {selectedCustomer.phone || 'No phone recorded'}
                </p>
              </div>

              <div>
                <p className="text-secondary-text font-semibold mb-1">Account Summary</p>
                <p className="text-foreground font-medium">
                  Total Orders: <span className="text-primary font-bold">{selectedCustomer.orders?.length || 0}</span>
                </p>
                <p className="text-foreground font-medium mt-1">
                  Total Spent: <span className="text-emerald-400 font-bold">{formatINR(selectedCustomer.totalSpent || 0)}</span>
                </p>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" /> Customer Order History ({selectedCustomer.orders?.length || 0})
              </h4>

              {selectedCustomer.orders?.length === 0 ? (
                <p className="text-xs text-secondary-text bg-white/5 p-4 rounded-xl text-center">
                  No orders found for this customer email.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedCustomer.orders?.map((ord) => (
                    <div key={ord._id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-foreground">{ord.orderNumber}</p>
                        <p className="text-secondary-text">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {ord.items?.length || 0} items
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-primary/20 text-primary border border-primary/30">
                          {ord.status}
                        </span>
                        <p className="font-bold text-foreground mt-1">{formatINR(ord.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
