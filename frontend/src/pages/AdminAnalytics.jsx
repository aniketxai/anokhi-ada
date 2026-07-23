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
} from 'lucide-react';
import { formatINR } from '../utils/currency';

function AnalyticsCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary/15 text-primary',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    blue: 'bg-sky-500/15 text-sky-300',
    purple: 'bg-purple-500/15 text-purple-300',
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
          {change && (
            <p className={`mt-2 text-sm font-semibold ${change > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {change > 0 ? <TrendingUp className="inline mr-1" size={14} /> : <TrendingDown className="inline mr-1" size={14} />}
              {Math.abs(change)}% vs last period
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
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
    let startDate = new Date(0); // Beginning of time for 'All time'
    
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

  // Helper to extract customer name from order
  const getCustomerName = (order) => {
    return order.shipping?.firstName && order.shipping?.lastName
      ? `${order.shipping.firstName} ${order.shipping.lastName}`
      : order.customerName || order.customer || 'Unknown';
  };

  const analytics = useMemo(() => {
    const filteredOrders = getFilteredData(orders, selectedPeriod);
    const filteredContacts = getFilteredData(contacts, selectedPeriod);
    const filteredQuotes = getFilteredData(quotes, selectedPeriod);
    
    const totalOrders = filteredOrders?.length || 0;
    const totalRevenue = filteredOrders?.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0) || 0;
    const totalCustomers = new Set(filteredOrders?.map(getCustomerName) || []).size;
    const totalProducts = products?.length || 0;
    const totalEnquiries = (filteredContacts?.length || 0) + (filteredQuotes?.length || 0);

    const ordersByStatus = {
      pending: filteredOrders?.filter(o => o.status === 'pending').length || 0,
      paid: filteredOrders?.filter(o => o.status === 'paid').length || 0,
      processing: filteredOrders?.filter(o => o.status === 'processing').length || 0,
      shipped: filteredOrders?.filter(o => o.status === 'shipped').length || 0,
      delivered: filteredOrders?.filter(o => o.status === 'delivered').length || 0,
    };

    const contactsByStatus = {
      new: filteredContacts?.filter(c => c.status === 'new').length || 0,
      'in-review': filteredContacts?.filter(c => c.status === 'in-review' || c.status === 'read').length || 0,
      replied: filteredContacts?.filter(c => c.status === 'replied').length || 0,
    };

    const quotesByStatus = {
      new: filteredQuotes?.filter(q => q.status === 'new').length || 0,
      'in-review': filteredQuotes?.filter(q => q.status === 'in-review').length || 0,
      quoted: filteredQuotes?.filter(q => q.status === 'quoted').length || 0,
    };

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(1) : 0;

    // Calculate change percentages based on previous period
    let revenueChange = 0;
    let orderChange = 0;
    let customerChange = 0;
    let productChange = 0;
    let avgOrderValueChange = 0;
    let enquiryChange = 0;

    if (selectedPeriod !== 'All time') {
      // Get all data for comparison with current period
      const allOrders = orders || [];
      const previousPeriodStartDate = selectedPeriod === 'Today'
        ? new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000)
        : selectedPeriod === 'Last 7 days'
        ? new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
        : selectedPeriod === 'Last 30 days'
        ? new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000)
        : new Date(new Date().getTime() - 180 * 24 * 60 * 60 * 1000);

      const periodLength = selectedPeriod === 'Today' ? 1 : selectedPeriod === 'Last 7 days' ? 7 : selectedPeriod === 'Last 30 days' ? 30 : 90;
      const previousPeriodEndDate = new Date(new Date().getTime() - periodLength * 24 * 60 * 60 * 1000);

      const previousOrders = allOrders.filter(o => {
        const oDate = new Date(o.createdAt || 0);
        return oDate >= previousPeriodStartDate && oDate < previousPeriodEndDate;
      });

      const prevRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0) || 0;
      const prevOrders = previousOrders.length;
      const prevCustomers = new Set(previousOrders.map(getCustomerName)).size;
      const prevAvgOrderValue = prevOrders > 0 ? prevRevenue / prevOrders : 0;

      revenueChange = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0;
      orderChange = prevOrders > 0 ? (((totalOrders - prevOrders) / prevOrders) * 100).toFixed(1) : 0;
      customerChange = prevCustomers > 0 ? (((totalCustomers - prevCustomers) / prevCustomers) * 100).toFixed(1) : 0;
      avgOrderValueChange = prevAvgOrderValue > 0 ? (((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100).toFixed(1) : 0;
      
      const previousContactsCount = (contacts || []).filter(c => {
        const cDate = new Date(c.createdAt || 0);
        return cDate >= previousPeriodStartDate && cDate < previousPeriodEndDate;
      }).length;
      const previousQuotesCount = (quotes || []).filter(q => {
        const qDate = new Date(q.createdAt || 0);
        return qDate >= previousPeriodStartDate && qDate < previousPeriodEndDate;
      }).length;
      const prevEnquiries = previousContactsCount + previousQuotesCount;
      enquiryChange = prevEnquiries > 0 ? (((totalEnquiries - prevEnquiries) / prevEnquiries) * 100).toFixed(1) : 0;
    }

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      totalEnquiries,
      avgOrderValue,
      conversionRate,
      ordersByStatus,
      contactsByStatus,
      quotesByStatus,
      revenueChange: parseFloat(revenueChange),
      orderChange: parseFloat(orderChange),
      customerChange: parseFloat(customerChange),
      productChange,
      avgOrderValueChange: parseFloat(avgOrderValueChange),
      enquiryChange: parseFloat(enquiryChange),
    };
  }, [orders, products, contacts, quotes, selectedPeriod, getFilteredData]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-6">
        <AnalyticsCard
          title="Total Revenue"
          value={formatINR(analytics.totalRevenue)}
          change={analytics.revenueChange}
          icon={DollarSign}
          color="emerald"
        />
        <AnalyticsCard
          title="Total Orders"
          value={analytics.totalOrders}
          change={analytics.orderChange}
          icon={ShoppingCart}
          color="blue"
        />
        <AnalyticsCard
          title="Customers"
          value={analytics.totalCustomers}
          change={analytics.customerChange}
          icon={Users}
          color="purple"
        />
        <AnalyticsCard
          title="Products"
          value={analytics.totalProducts}
          change={analytics.productChange}
          icon={Package}
        />
        <AnalyticsCard
          title="Avg Order Value"
          value={formatINR(analytics.avgOrderValue)}
          change={analytics.avgOrderValueChange}
          icon={TrendingUp}
          color="emerald"
        />
        <AnalyticsCard
          title="Enquiries"
          value={analytics.totalEnquiries}
          change={analytics.enquiryChange}
          icon={LineChartIcon}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Order Status Distribution"
          description="Breakdown of orders by current status"
        >
          <div className="space-y-4">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
              const total = analytics.totalOrders || 1;
              const percentage = ((count / total) * 100).toFixed(0);
              const colors = {
                pending: 'bg-amber-500',
                paid: 'bg-sky-500',
                processing: 'bg-purple-500',
                shipped: 'bg-violet-500',
                delivered: 'bg-teal-500',
              };

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm font-semibold text-secondary-text">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Enquiry Status Distribution"
          description="Mix of contact and quote requests"
        >
          <div className="space-y-4">
            {Object.entries(analytics.contactsByStatus).map(([status, count]) => {
              const total = (Object.values(analytics.contactsByStatus).reduce((a, b) => a + b, 0)) || 1;
              const percentage = ((count / total) * 100).toFixed(0);
              const colors = {
                new: 'bg-sky-500',
                'in-review': 'bg-amber-500',
                replied: 'bg-emerald-500',
              };

              return (
                <div key={`contact-${status}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm font-semibold text-secondary-text">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Performance Metrics */}
      <SectionCard
        title="Performance Metrics"
        description="Key performance indicators and conversion rates"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <p className="text-sm text-secondary-text mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold font-display">{analytics.conversionRate}%</p>
            <p className="text-xs text-outline mt-2">Orders per customer</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <p className="text-sm text-secondary-text mb-2">Repeat Customer Rate</p>
            <p className="text-3xl font-bold font-display">
              {analytics.totalCustomers > 0 ? ((analytics.totalOrders / analytics.totalCustomers - 1) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-outline mt-2">Average repeat purchases</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
            <p className="text-sm text-secondary-text mb-2">Enquiry to Order</p>
            <p className="text-3xl font-bold font-display">
              {analytics.totalEnquiries > 0 ? ((analytics.totalOrders / analytics.totalEnquiries) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-outline mt-2">Enquiry conversion</p>
          </div>
        </div>
      </SectionCard>

      {/* Time Period Selector */}
      <SectionCard title="Time Period">
        <div className="flex flex-wrap gap-2">
          {['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-material ${
                selectedPeriod === period
                  ? 'border-primary bg-primary/20 text-primary'
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
