import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Truck,
  Bell,
  ChevronRight,
  Mail,
  ArrowUpRight,
  Reply,
} from 'lucide-react';
import { SectionCard, StatusPill } from './Helpers';
import { StatTile, AlertRow } from './UIComponents';
import { formatINR } from '../../utils/currency';

export function OverviewSection({
  kpis,
  activity,
  filteredOrders,
  orderFilter,
  setOrderFilter,
  statusCounts,
  lowStockProducts,
  handleViewOrder,
  filteredEnquiries,
  enquiryFilter,
  setEnquiryFilter,
  handleRespondToEnquiry,
}) {
  // Calculate week data from orders for revenue trend
  const getWeekData = () => {
    const now = new Date();
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    
    (filteredOrders || []).forEach(order => {
      const orderDate = new Date(order.createdAt || 0);
      const dayDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff < 7) {
        const dayIndex = 6 - dayDiff;
        if (dayIndex >= 0 && dayIndex < 7) {
          weekData[dayIndex] += (order.total || order.totalAmount || 0);
        }
      }
    });
    
    // Normalize to percentages (0-100)
    const maxValue = Math.max(...weekData, 100000) || 100000;
    return weekData.map(val => Math.round((val / maxValue) * 100) || 5);
  };
  
  const weekData = getWeekData();
  const weekRevenue = (filteredOrders || [])
    .filter(order => {
      const orderDate = new Date(order.createdAt || 0);
      const dayDiff = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      return dayDiff < 7;
    })
    .reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5 mb-6">
        {kpis.map((item) => {
          const Icon = item.icon;
          const toneClass =
            item.tone === 'up'
              ? 'text-emerald-300'
              : item.tone === 'down'
                ? 'text-red-300'
                : 'text-amber-300';

          return (
            <motion.div
              key={item.label}
              whileHover={{ y: -3 }}
              className="rounded-[28px] border border-white/8 bg-white/4 p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-secondary-text">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold font-display">{item.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="w-[20px] h-[20px]" />
                </div>
              </div>
              <div className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${toneClass}`}>
                {item.tone === 'down' ? <TrendingDown className="w-[14px] h-[14px]" /> : <TrendingUp className="w-[14px] h-[14px]" />}
                <span>{item.delta}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sales & Activity */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr] mb-6">
        <SectionCard
          title="Sales Snapshot"
          description="Orders, revenue, and traffic trends for the current week."
          action={
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-semibold text-secondary-text">
              <Sparkles className="w-[12px] h-[12px] text-primary" />
              Updated 2 min ago
            </span>
          }
        >
          <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm text-secondary-text">Revenue trend</p>
                  <p className="text-2xl font-bold font-display">{formatINR(weekRevenue)}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  (kpis[0]?.delta?.includes('-') || kpis[0]?.delta?.includes('−')) 
                    ? 'bg-red-500/15 text-red-300' 
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}>
                  {kpis[0]?.delta || '+0%'}
                </div>
              </div>
              <div className="flex items-end gap-3 h-56">
                {weekData.map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full max-w-10 rounded-t-2xl bg-linear-to-t from-primary via-primary-light to-white/30"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-[11px] text-outline">W{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Truck className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <p className="font-semibold">Fulfilment</p>
                    <p className="text-xs text-secondary-text">Average dispatch time 14h</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-linear-to-r from-primary to-primary-light" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-secondary-text">
                  <span>On schedule</span>
                  <span>72%</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <p className="text-sm text-secondary-text mb-3">Quick alerts</p>
                <div className="space-y-3">
                  <AlertRow icon={Bell} title={`${lowStockProducts?.length || 0} items need restocking`} value="View inventory" />
                  <AlertRow icon={ChevronRight} title={`${filteredOrders?.filter(o => ['pending', 'paid'].includes(o.status))?.length || 0} orders awaiting review`} value="Open orders" />
                  <AlertRow icon={Mail} title={`${filteredEnquiries?.filter(e => e.status === 'new')?.length || 0} fresh enquiries`} value="Reply now" />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" description="The latest actions across store operations.">
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <ArrowUpRight className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-secondary-text mt-1">{item.time}</p>
                </div>
                <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-outline capitalize">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Orders & Inventory */}
      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr] mb-6">
        <SectionCard
          title="Orders"
          description="Process and fulfil orders from checkout to delivery."
          action={
            <div className="flex items-center gap-2">
              {['All', 'pending', 'paid', 'processing', 'shipped', 'delivered'].map((option) => (
                <button
                  key={option}
                  onClick={() => setOrderFilter(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-material ${orderFilter === option ? 'bg-primary text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {(filteredOrders || []).slice(0, 5).map((order) => (
              <div key={order._id || order.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{order._id || order.id}</p>
                      <StatusPill status={order.status} />
                    </div>
                    <p className="text-sm text-secondary-text">
                      {order.shipping?.firstName && order.shipping?.lastName
                        ? `${order.shipping.firstName} ${order.shipping.lastName}`
                        : order.customerName || order.customer || 'Unknown'} · {order.items?.length || order.items || 1} items
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="text-right">
                      <p className="text-xs text-outline">Total</p>
                      <p className="text-lg font-bold">{formatINR(order.totalAmount || order.total)}</p>
                    </div>
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-material">
                      View
                      <ChevronRight className="w-[14px] h-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Inventory Signals" description="Fast view of low stock products.">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatTile label="Products" value={statusCounts.totalProducts} />
              <StatTile label="Categories" value={statusCounts.totalCategories} />
              <StatTile label="Orders" value={statusCounts.totalOrders} />
              <StatTile label="Enquiries" value={statusCounts.totalEnquiries} />
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="mb-3 text-sm font-semibold">Low stock picks</p>
              <div className="space-y-3">
                {(lowStockProducts || []).slice(0, 4).map((product) => (
                  <div key={product.id || product._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/4 px-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-secondary-text">{product.category}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/25 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                      Reorder
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Enquiries */}
      <SectionCard
        title="Enquiries"
        description="Track contact messages and quote requests."
        action={
          <div className="flex items-center gap-2">
            {['All', 'new', 'in-review', 'quoted', 'replied'].map((option) => (
              <button
                key={option}
                onClick={() => setEnquiryFilter(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-material ${enquiryFilter === option ? 'bg-primary text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
              >
                {option}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {(filteredEnquiries || []).slice(0, 4).map((item, idx) => (
            <div key={`${item._id || idx}`} className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{item.companyName || item.name}</p>
                    <StatusPill status={item.status || 'new'} />
                  </div>
                  <p className="text-sm text-secondary-text truncate">{item.subject || item.message?.substring(0, 40)}</p>
                </div>
                <button 
                  onClick={() => handleRespondToEnquiry(item)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-material">
                  Respond
                  <Reply className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
