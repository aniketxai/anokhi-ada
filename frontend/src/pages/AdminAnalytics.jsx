import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../utils/currency';

function AnalyticsCard({ title, value, subtitle, change, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary/15 text-primary',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    blue: 'bg-sky-500/15 text-sky-300',
    purple: 'bg-purple-500/15 text-purple-300',
    red: 'bg-red-500/15 text-red-300',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-[28px] border border-white/8 bg-white/4 p-5 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-secondary-text">{title}</p>
          <p className="mt-2 text-3xl font-bold font-display">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-outline font-medium">{subtitle}</p>}
          {typeof change === 'number' && change !== 0 && (
            <p className={`mt-2 text-sm font-semibold ${change > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {change > 0 ? <TrendingUp className="inline mr-1" size={14} /> : <TrendingDown className="inline mr-1" size={14} />}
              {Math.abs(change)}% vs last period
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[color] || colorClasses.primary}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

function SectionCard({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-white/8 bg-white/3 p-5 sm:p-6 shadow-soft ${className}`}>
      <div className="mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-secondary-text">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdminAnalytics({ summary, orders, products, contacts, quotes }) {
  const [selectedPeriod, setSelectedPeriod] = useState('All time');

  // Filter orders by date range
  const getFilteredData = useCallback((dataArray, period) => {
    if (!dataArray || !Array.isArray(dataArray)) return [];

    const now = new Date();
    let startDate = new Date(0);

    switch (period) {
      case 'Today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'Last 7 days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last 30 days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Last 90 days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'All time':
      default:
        return dataArray;
    }

    return dataArray.filter(item => {
      const itemDate = new Date(item.createdAt || 0);
      return itemDate >= startDate;
    });
  }, []);

  const getCustomerName = (order) => {
    return order.shipping?.firstName && order.shipping?.lastName
      ? `${order.shipping.firstName} ${order.shipping.lastName}`
      : order.customerName || order.customer || 'Unknown';
  };

  const analytics = useMemo(() => {
    const filteredOrders = getFilteredData(orders, selectedPeriod);
    const filteredContacts = getFilteredData(contacts, selectedPeriod);
    const filteredQuotes = getFilteredData(quotes, selectedPeriod);

    const paidOrders = filteredOrders.filter(o => o.payment?.status === 'paid' || ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
    const failedOrders = filteredOrders.filter(o => o.payment?.status === 'failed' || o.status === 'failed');

    const totalOrders = filteredOrders?.length || 0;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const failedRevenueLoss = failedOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

    const totalCustomers = new Set(filteredOrders?.map(getCustomerName) || []).size;
    const totalProducts = products?.length || 0;
    const totalViews = products?.reduce((sum, p) => sum + Number(p.views || 0), 0) || summary?.totalProductViews || 0;
    const totalEnquiries = (filteredContacts?.length || 0) + (filteredQuotes?.length || 0);

    const topViewedProducts = [...(products || [])]
      .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
      .slice(0, 5);

    const ordersByStatus = {
      pending: filteredOrders?.filter(o => o.status === 'pending' && o.payment?.status !== 'failed').length || 0,
      paid: paidOrders.length,
      failed: failedOrders.length,
      processing: filteredOrders?.filter(o => o.status === 'processing').length || 0,
      shipped: filteredOrders?.filter(o => o.status === 'shipped').length || 0,
      delivered: filteredOrders?.filter(o => o.status === 'delivered').length || 0,
    };

    const avgOrderValue = totalOrders > 0 ? totalRevenue / (paidOrders.length || 1) : 0;
    const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : 0;

    return {
      totalRevenue,
      failedRevenueLoss,
      totalOrders,
      failedOrdersCount: failedOrders.length,
      paidOrdersCount: paidOrders.length,
      totalCustomers,
      totalProducts,
      totalViews,
      totalEnquiries,
      topViewedProducts,
      avgOrderValue,
      conversionRate,
      ordersByStatus,
    };
  }, [orders, products, contacts, quotes, summary, selectedPeriod, getFilteredData]);

  // Compute daily trend for past 7 days
  const dailyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const result = days.map((dayName) => ({ day: dayName, revenue: 0, failed: 0 }));

    (orders || []).forEach((o) => {
      const d = new Date(o.createdAt || 0);
      const dayDiff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (dayDiff < 7) {
        const index = (d.getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun
        if (o.payment?.status === 'failed' || o.status === 'failed') {
          result[index].failed += Number(o.total || o.totalAmount || 0);
        } else {
          result[index].revenue += Number(o.total || o.totalAmount || 0);
        }
      }
    });

    const maxVal = Math.max(...result.map(r => Math.max(r.revenue, r.failed)), 5000);
    return result.map(r => ({
      ...r,
      revenueHeight: Math.round((r.revenue / maxVal) * 100),
      failedHeight: Math.round((r.failed / maxVal) * 100),
    }));
  }, [orders]);

  const maxViews = useMemo(() => {
    const list = analytics.topViewedProducts.map(p => Number(p.views || 0));
    return Math.max(...list, 10);
  }, [analytics.topViewedProducts]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-6">
        <AnalyticsCard
          title="Total Revenue"
          value={formatINR(analytics.totalRevenue)}
          subtitle="Successful paid orders"
          icon={DollarSign}
          color="emerald"
        />
        <AnalyticsCard
          title="Failed Payments Loss"
          value={formatINR(analytics.failedRevenueLoss)}
          subtitle={`${analytics.failedOrdersCount} failed transactions`}
          icon={AlertTriangle}
          color="red"
        />
        <AnalyticsCard
          title="Product Views"
          value={analytics.totalViews}
          subtitle="Total store impressions"
          icon={Eye}
          color="blue"
        />
        <AnalyticsCard
          title="Total Orders"
          value={analytics.totalOrders}
          subtitle={`${analytics.paidOrdersCount} completed / ${analytics.failedOrdersCount} failed`}
          icon={ShoppingCart}
          color="primary"
        />
        <AnalyticsCard
          title="Customers"
          value={analytics.totalCustomers}
          subtitle="Unique buyers"
          icon={Users}
          color="purple"
        />
        <AnalyticsCard
          title="Avg Order Value"
          value={formatINR(analytics.avgOrderValue)}
          subtitle="Per completed order"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Graphs Row 1: Product View Count Graph & Failed Payment Recovery Graph */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product View Count Graph */}
        <SectionCard
          title="👁 Top Viewed Products Graph"
          description="Most popular items viewed by store visitors"
        >
          {analytics.topViewedProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topViewedProducts.map((p, idx) => {
                const views = Number(p.views || 0);
                const percent = Math.round((views / maxViews) * 100);

                return (
                  <div key={p.id || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300 shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate">{p.name}</span>
                        <span className="text-secondary-text text-xs">({p.category})</span>
                      </div>
                      <span className="font-bold text-sky-300 shrink-0">👁 {views} views</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percent, 4)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-secondary-text">
              No product views recorded yet. Product page visits will populate this graph dynamically!
            </div>
          )}
        </SectionCard>

        {/* Failed Payment Breakdown Graph */}
        <SectionCard
          title="⚠️ Payment Status Breakdown Graph"
          description="Comparison of Successful vs Failed vs Pending transactions"
        >
          <div className="space-y-5">
            {/* Visual Bar Comparison */}
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Paid Orders ({analytics.ordersByStatus.paid})
                  </span>
                  <span className="text-emerald-300 font-bold">{formatINR(analytics.totalRevenue)}</span>
                </div>
                <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${analytics.totalOrders ? (analytics.ordersByStatus.paid / analytics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-red-300 flex items-center gap-1">
                    <XCircle size={13} /> Failed Payments ({analytics.ordersByStatus.failed})
                  </span>
                  <span className="text-red-300 font-bold">{formatINR(analytics.failedRevenueLoss)}</span>
                </div>
                <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${analytics.totalOrders ? (analytics.ordersByStatus.failed / analytics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-300 flex items-center gap-1">
                    <PieChartIcon size={13} /> Pending Orders ({analytics.ordersByStatus.pending})
                  </span>
                  <span className="text-amber-300 font-bold">In Review</span>
                </div>
                <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${analytics.totalOrders ? (analytics.ordersByStatus.pending / analytics.totalOrders) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 flex items-center justify-between">
              <div>
                <p className="font-bold">Recover Lost Revenue</p>
                <p className="text-red-300/80">Use "Send Pay Link" in Orders tab to convert failed orders</p>
              </div>
              <span className="rounded-full bg-red-600 px-3 py-1 text-white font-bold">{analytics.failedOrdersCount} Failed</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Revenue & Sales Bar Chart */}
      <SectionCard
        title="📊 Weekly Sales vs Failed Transactions Graph"
        description="Daily revenue earned vs potential revenue lost in the last 7 days"
      >
        <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> Earned Revenue
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block" /> Failed Transactions
              </span>
            </div>
            <span className="text-xs text-outline font-semibold">Last 7 Days</span>
          </div>

          <div className="flex items-end justify-between gap-3 h-52 pt-4">
            {dailyTrend.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 w-full max-w-12 h-full justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(d.revenueHeight, 4)}%` }}
                    className="w-1/2 rounded-t-lg bg-emerald-500 hover:bg-emerald-400 transition-colors"
                    title={`Earned: ${formatINR(d.revenue)}`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(d.failedHeight, 4)}%` }}
                    className="w-1/2 rounded-t-lg bg-red-500/80 hover:bg-red-500 transition-colors"
                    title={`Failed: ${formatINR(d.failed)}`}
                  />
                </div>
                <span className="text-xs text-outline font-bold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Time Period Selector */}
      <SectionCard title="Time Period Filter">
        <div className="flex flex-wrap gap-2">
          {['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-material ${
                selectedPeriod === period
                  ? 'border-primary bg-primary/20 text-primary font-bold'
                  : 'border-white/8 bg-white/5 text-foreground hover:bg-white/10'
              }`}
            >
              <Calendar size={14} />
              {period}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
