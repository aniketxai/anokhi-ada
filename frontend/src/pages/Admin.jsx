import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  MessageSquareText,
  FileUp,
  LineChart,
  Settings2,
  Plus,
  CircleDollarSign,
  Clock3,
  Mail,
  PackageCheck,
  Loader,
  AlertCircle,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { categories } from '../data/products';
import { formatINR } from '../utils/currency';
import api from '../api/index.js';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import ImportProductsModal from '../components/ImportProductsModal';
import ReplyModal from '../components/ReplyModal';
import { AdminLogin, AdminLogoutButton } from './AdminLogin';
import {
  ProductEditModal,
  OrderDetailModal,
  OverviewSection,
  CatalogSection,
  OrdersSection,
  EnquiriesSection,
  CustomOrdersSection,
  formatPaymentValue,
} from './AdminComponents';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'catalog', label: 'Catalog', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'custom-orders', label: 'Custom Orders', icon: FileUp },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquareText },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

const statusStyles = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  processing: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  shipped: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  delivered: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  new: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  'in-review': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  quoted: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  replied: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

const emptyProductForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  rating: '',
  reviews: '',
  description: '',
  features: '',
  images: '',
  badge: '',
  stockQty: '',
  featured: false,
  inStock: true,
  netWeight: '',
  netWeightUnit: 'g',
};

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function uploadImageToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload env vars are missing');
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  return fetch(url, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      let message = 'Image upload failed';
      try {
        const data = await res.json();
        message = data?.error?.message || message;
      } catch {
        message = res.statusText || message;
      }
      throw new Error(message);
    }

    return res.json();
  });
}

export default function Admin() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken');
  });

  // UI State
  const [activeSection, setActiveSection] = useState('overview');
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [orderFilter, setOrderFilter] = useState('All');
  const [customOrderFilter, setCustomOrderFilter] = useState('All');
  const [enquiryFilter, setEnquiryFilter] = useState('All');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [respondingToCustomOrderId, setRespondingToCustomOrderId] = useState(null);
  const [customOrderReplyText, setCustomOrderReplyText] = useState('');
  const [sendingCustomOrderReply, setSendingCustomOrderReply] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // API State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomOrders, setAdminCustomOrders] = useState([]);
  const [adminQuotes, setAdminQuotes] = useState([]);
  const [adminContacts, setAdminContacts] = useState([]);
  const [activity, setActivity] = useState([]);

  // Check authentication on mount
 // Check authentication on mount
useEffect(() => {
  const token = localStorage.getItem('adminToken');
  setIsAuthenticated(!!token);
}, []);

const categoryOptions = ['All', ...categories];

const loadAdminData = useCallback(async ({ showLoading = true } = {}) => {
    let cancelled = false;

    if (showLoading) setLoading(true);

    try {
      setError(null);

      const [summaryResult, productsResult, ordersResult, customOrdersResult, quotesResult, contactsResult] = await Promise.allSettled([
        api.fetchAdminSummary(),
        api.fetchAdminProducts(),
        api.fetchAdminOrders(),
        api.fetchAdminCustomOrders(),
        api.fetchAdminQuotes(),
        api.fetchAdminContacts(),
      ]);

      if (cancelled) return;

      const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
      const customOrdersData = customOrdersResult.status === 'fulfilled' ? customOrdersResult.value : [];
      const quotesData = quotesResult.status === 'fulfilled' ? quotesResult.value : [];
      const contactsData = contactsResult.status === 'fulfilled' ? contactsResult.value : [];

      setSummary(summaryData);
      setAdminProducts(productsData);
      setAdminOrders(ordersData);
      setAdminCustomOrders(customOrdersData);
      setAdminQuotes(quotesData);
      setAdminContacts(contactsData);
      
      

      const recentActivity = [
        ...(customOrdersData.slice(0, 1).map((co) => ({
          title: `Custom order from ${co.name}`,
          time: 'just now',
          type: 'custom-order',
        })) || []),
        ...(ordersData.slice(0, 1).map((o) => ({
          title: `New order ${o._id || o.id} accepted`,
          time: '4 min ago',
          type: 'order',
        })) || []),
        ...(quotesData.slice(0, 1).map((q) => ({
          title: `Quote request from ${q.companyName || q.name}`,
          time: '17 min ago',
          type: 'quote',
        })) || []),
        ...(productsData.slice(0, 1).map((p) => ({
          title: `Product ${p.id} updated`,
          time: '43 min ago',
          type: 'catalog',
        })) || []),
      ];
      setActivity(recentActivity.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      if (!cancelled && showLoading) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadAdminData({ showLoading: true }).finally(() => {
      if (!active) return;
    });

    return () => {
      active = false;
    };
  }, [loadAdminData]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();

    return (adminProducts || []).filter((product) => {
      const matchesQuery =
        !q ||
        (product.name || '').toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q);

      const matchesCategory = productCategory === 'All' || product.category === productCategory;
      return matchesQuery && matchesCategory;
    });
  }, [productQuery, productCategory, adminProducts]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All') return adminOrders;
    return (adminOrders || []).filter((order) => order.status === orderFilter);
  }, [orderFilter, adminOrders]);

  const filteredEnquiries = useMemo(() => {
    const enquiries = [
      ...(adminContacts || []).map((item) => ({
        ...item,
        enquiryType: 'contact',
        status: item.status === 'read' ? 'in-review' : item.status,
      })),
      ...(adminQuotes || []).map((item) => ({ ...item, enquiryType: 'quote' })),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (enquiryFilter === 'All') return enquiries;
    return enquiries.filter((item) => item.status === enquiryFilter);
  }, [enquiryFilter, adminContacts, adminQuotes]);

  const lowStockProducts = useMemo(
    () => (adminProducts || []).filter((p) => p.inStock === false || (p.stockQty !== undefined && p.stockQty < 10)),
    [adminProducts]
  );

  const statusCounts = useMemo(
    () => ({
      totalProducts: (adminProducts || []).length,
      totalCategories: categories.length,
      totalOrders: (adminOrders || []).length,
      totalEnquiries: (adminContacts || []).length + (adminQuotes || []).length,
    }),
    [adminProducts, adminOrders, adminContacts, adminQuotes]
  );

  const kpis = useMemo(
    () => [
      {
        label: 'Revenue',
        value: summary?.totalRevenue ? formatINR(summary.totalRevenue) : '₹0',
        delta: '+18.4%',
        tone: 'up',
        icon: CircleDollarSign,
      },
      {
        label: 'Orders',
        value: statusCounts.totalOrders.toString(),
        delta: '+11.2%',
        tone: 'up',
        icon: ShoppingCart,
      },
      {
        label: 'Pending',
        value: (adminOrders || []).filter((o) => o.status === 'pending').length.toString(),
        delta: '-4.1%',
        tone: 'down',
        icon: Clock3,
      },
      {
        label: 'Messages',
        value: (adminContacts || []).length.toString(),
        delta: '+6.7%',
        tone: 'up',
        icon: Mail,
      },
      {
        label: 'Low Stock',
        value: lowStockProducts.length.toString(),
        delta: 'Needs restock',
        tone: 'warn',
        icon: PackageCheck,
      },
    ],
    [summary, statusCounts, adminOrders, adminContacts, lowStockProducts]
  );

  const resetProductForm = useCallback(() => {
    setProductForm(emptyProductForm);
    setEditingProductId(null);
  }, []);

  const beginCreateProduct = useCallback(() => {
    resetProductForm();
    setEditingProductId(null);
    setActiveSection('catalog');
    setSuccessMessage('Ready to create a new product');
    setIsProductModalOpen(true);
  }, [resetProductForm]);

  const beginEditProduct = useCallback((product) => {
    setEditingProductId(product.id || product._id || null);
    setActiveSection('catalog');
    setSuccessMessage(null);
    setProductForm({
      id: product.id || '',
      name: product.name || '',
      category: product.category || '',
      price: product.price ?? '',
      originalPrice: product.originalPrice ?? '',
      rating: product.rating ?? '',
      reviews: product.reviews ?? '',
      description: product.description || '',
      features: Array.isArray(product.features) ? product.features.join(', ') : (product.features || ''),
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.images || ''),
      badge: product.badge || '',
      stockQty: product.stockQty ?? '',
      netWeight: product.netWeight ?? '',
      netWeightUnit: product.netWeightUnit || 'g',
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock),
    });
    setIsProductModalOpen(true);
  }, []);

  const handleProductFieldChange = useCallback((field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleProductImageUpload = useCallback(async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;

    try {
      setUploadingImages(true);
      setError(null);
      setSuccessMessage(null);

      const uploads = await Promise.all(list.map((file) => uploadImageToCloudinary(file)));
      const uploadedUrls = uploads.map((item) => item.secure_url).filter(Boolean);

      setProductForm((prev) => {
        const currentUrls = String(prev.images || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        const nextUrls = [...currentUrls, ...uploadedUrls];
        return { ...prev, images: Array.from(new Set(nextUrls)).join(', ') };
      });

      setSuccessMessage(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} to Cloudinary`);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setProductForm((prev) => {
      const urls = String(prev.images || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      urls.splice(index, 1);
      return { ...prev, images: urls.join(', ') };
    });
  }, []);

  const refreshData = useCallback(() => loadAdminData({ showLoading: false }), [loadAdminData]);

  const handleSaveProduct = useCallback(async (e) => {
    e?.preventDefault?.();

    const payload = {
      ...productForm,
      price: productForm.price === '' ? '' : Number(productForm.price),
      originalPrice: productForm.originalPrice === '' ? '' : Number(productForm.originalPrice),
      rating: productForm.rating === '' ? '' : Number(productForm.rating),
      reviews: productForm.reviews === '' ? '' : Number(productForm.reviews),
      stockQty: productForm.stockQty === '' ? '' : Number(productForm.stockQty),
      netWeight: productForm.netWeight === '' ? null : Number(productForm.netWeight),
      netWeightUnit: productForm.netWeightUnit || 'g',
      features: productForm.features,
      images: productForm.images,
      specifications: {},
    };

    try {
      setSavingProduct(true);
      setError(null);
      setSuccessMessage(null);

      if (editingProductId) {
        await api.updateAdminProduct(editingProductId, payload);
        setSuccessMessage('Product updated successfully');
      } else {
        await api.createAdminProduct(payload);
        setSuccessMessage('Product created successfully');
      }

      await refreshData();
      
      // Close modal and reset form after successful save
      setIsProductModalOpen(false);
      resetProductForm();
      setEditingProductId(null);
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  }, [productForm, editingProductId, refreshData, resetProductForm]);

  const handleDeleteProduct = useCallback(async (product) => {
    const id = product.id || product._id;
    if (!id) return;

    const confirmed = window.confirm(`Delete ${product.name || id}?`);
    if (!confirmed) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await api.deleteAdminProduct(id);
      if (editingProductId === id) resetProductForm();
      setSuccessMessage('Product deleted');
      await refreshData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'Failed to delete product');
    }
  }, [editingProductId, refreshData, resetProductForm]);

  const handleOrderStatusSave = useCallback(async (orderId, status) => {
    if (!orderId || !status) return;

    try {
      setSavingOrderId(orderId);
      setError(null);
      setSuccessMessage(null);
      await api.updateOrderStatus(orderId, status);
      setSuccessMessage('Order status updated');
      await refreshData();
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError(err.message || 'Failed to update order status');
    } finally {
      setSavingOrderId(null);
    }
  }, [refreshData]);

  const handlePaymentVerificationSave = useCallback(async (orderId, verified, paymentData = {}) => {
    if (!orderId) return;

    try {
      setSavingOrderId(orderId);
      setError(null);
      setSuccessMessage(null);
      const result = await api.updateOrderPaymentVerification(orderId, {
        verified,
        ...paymentData,
      });
      const updatedOrder = result?.data || null;
      if (updatedOrder) {
        setAdminOrders((prevOrders) =>
          prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
        );
        setSelectedOrder(updatedOrder);
      }
      setSuccessMessage(verified ? 'Payment marked verified' : 'Payment marked unverified');
      await refreshData();
    } catch (err) {
      console.error('Failed to update payment verification:', err);
      setError(err.message || 'Failed to update payment verification');
    } finally {
      setSavingOrderId(null);
    }
  }, [refreshData]);

  const handleExportData = useCallback(async () => {
    try {
      setError(null);
      const data = {
        products: adminProducts,
        orders: adminOrders,
        quotes: adminQuotes,
        contacts: adminContacts,
        exportDate: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sambx-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Data exported successfully');
    } catch (err) {
      console.error('Failed to export data:', err);
      setError('Failed to export data');
    }
  }, [adminProducts, adminOrders, adminQuotes, adminContacts]);

  const handleBulkImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.products && Array.isArray(data.products)) {
          setSuccessMessage(`Import started: ${data.products.length} products`);
        }
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    input.click();
  }, []);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  }, []);

  const handleOrderUpdated = useCallback((updatedOrder) => {
    // Update the orders list with the updated order
    setAdminOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
  }, []);

  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  const handleUpdateQuoteStatus = useCallback(async (quoteId, status) => {
    if (!quoteId || !status) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await api.updateQuoteStatus(quoteId, status);
      setSuccessMessage('Quote status updated');
      await refreshData();
    } catch (err) {
      console.error('Failed to update quote status:', err);
      setError(err.message || 'Failed to update quote status');
    }
  }, [refreshData]);

  const handleUpdateContactStatus = useCallback(async (contactId, status) => {
    if (!contactId || !status) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await api.updateContactStatus(contactId, status);
      setSuccessMessage('Contact status updated');
      await refreshData();
    } catch (err) {
      console.error('Failed to update contact status:', err);
      setError(err.message || 'Failed to update contact status');
    }
  }, [refreshData]);
  const handleRespondToEnquiry = useCallback((enquiry) => {
    setReplyTarget(enquiry);
    setIsReplyModalOpen(true);
  }, []);

  const sendReply = useCallback(async ({ subject, body }) => {
    if (!replyTarget) return;
    const id = replyTarget?._id || replyTarget?.id;
    const enquiryType = replyTarget?.enquiryType || (replyTarget?.material ? 'quote' : 'contact');

    try {
      setReplyLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (enquiryType === 'contact') {
        await api.postAdminContactReply(id, { subject, body });
      } else {
        await api.postAdminQuoteReply(id, { subject, body });
      }

      setSuccessMessage('Reply sent successfully');
      setIsReplyModalOpen(false);
      setReplyTarget(null);
      await refreshData();
    } catch (err) {
      console.error('Failed to send reply:', err);
      setError(err.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  }, [replyTarget, refreshData]);

  const handleViewCustomOrder = useCallback((order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  }, []);

  const handleReplyCustomOrder = useCallback((order, text) => {
    if (!order && !text) {
      // Cancel/close
      setRespondingToCustomOrderId(null);
      setCustomOrderReplyText('');
      return;
    }

    if (!text) {
      // Open reply mode
      setRespondingToCustomOrderId(order._id || order.id);
      setCustomOrderReplyText('');
      return;
    }

    // Send reply
    sendCustomOrderReply(order, text);
  }, []);

  const sendCustomOrderReply = useCallback(async (order, text) => {
    if (!order || !text.trim()) return;
    const orderId = order._id || order.id;

    try {
      setSendingCustomOrderReply(true);
      setError(null);
      setSuccessMessage(null);

      await api.postAdminCustomOrderReply(orderId, {
        subject: `Quote for Custom Order - ${order.name}`,
        body: text,
      });

      setSuccessMessage('Quote sent successfully');
      setRespondingToCustomOrderId(null);
      setCustomOrderReplyText('');
      await refreshData();
    } catch (err) {
      console.error('Failed to send custom order reply:', err);
      setError(err.message || 'Failed to send reply');
    } finally {
      setSendingCustomOrderReply(false);
    }
  }, [refreshData]);

  // If not authenticated, show login
if (!isAuthenticated) {
  return (
    <AdminLogin
      onLogin={() => {
        setIsAuthenticated(true);
      }}
    />
  );
}

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(229,232,235,0.08),transparent_30%)]" />
        <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/8 bg-black/30 p-6 sm:p-8 shadow-soft backdrop-blur-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Loader size={28} className="animate-spin" />
          </div>
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-outline">Loading data</p>
          <h1 className="mt-2 text-2xl font-bold font-display">SAMBX Admin Panel</h1>
          <p className="mt-3 text-sm text-secondary-text">
            Fetching products, orders, enquiries, and dashboard summary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(229,232,235,0.08),transparent_30%)]" />

      {error && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-red-500/25 bg-red-500/15 px-4 py-3 text-red-300 flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-screen-2xl">
        {/* Sidebar */}
        <aside className="hidden xl:flex w-72 flex-col border-r border-white/8 bg-black/20 backdrop-blur-xl px-5 py-6 sticky top-0 h-screen">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-outline">SAMBX</p>
              <h1 className="text-2xl font-bold font-display">Admin Forge</h1>
            </div>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Live</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-material text-left ${
                    active
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white/3 text-secondary-text hover:bg-white/6 hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure Admin</p>
                <p className="text-xs text-secondary-text">2FA · Audit logs · Roles</p>
              </div>
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              Product, order, quote, and message management for the full SAMBX Forge.
            </p>
            <AdminLogoutButton onLogout={() => setIsAuthenticated(false)} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mb-6 rounded-[28px] border border-white/8 bg-white/4 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-outline">Ecommerce control center</p>
                <h2 className="mt-1 text-3xl sm:text-4xl font-bold font-display">SAMBX Admin Panel</h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-secondary-text">
                  Manage products, orders, quote requests, customer messages, shipping, and store settings in one command center.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10 transition-material">
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={beginCreateProduct}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-primary-light transition-material"
                >
                  <Plus size={16} />
                  Add product
                </button>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="flex flex-wrap gap-2 xl:hidden mb-6 overflow-x-auto hide-scrollbar pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-material ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-white/4 text-secondary-text hover:bg-white/8 hover:text-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <OverviewSection
              kpis={kpis}
              activity={activity}
              filteredOrders={filteredOrders}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
              statusCounts={statusCounts}
              lowStockProducts={lowStockProducts}
              handleViewOrder={handleViewOrder}
              filteredEnquiries={filteredEnquiries}
              enquiryFilter={enquiryFilter}
              setEnquiryFilter={setEnquiryFilter}
              handleRespondToEnquiry={handleRespondToEnquiry}
            />
          )}

          {/* CATALOG SECTION */}
          {activeSection === 'catalog' && (
            <>
              <CatalogSection
                productQuery={productQuery}
                setProductQuery={setProductQuery}
                productCategory={productCategory}
                setProductCategory={setProductCategory}
                categoryOptions={categoryOptions}
                filteredProducts={filteredProducts}
                adminProducts={adminProducts}
                beginEditProduct={beginEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                resetProductForm={resetProductForm}
                setEditingProductId={setEditingProductId}
                setIsProductModalOpen={setIsProductModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
              />

              {/* Product Edit Modal */}
              <ProductEditModal
                isOpen={isProductModalOpen}
                product={editingProductId ? adminProducts.find((p) => (p._id || p.id) === editingProductId) : null}
                form={productForm}
                onChange={handleProductFieldChange}
                onUploadImages={handleProductImageUpload}
                onRemoveImage={handleRemoveImage}
                onSave={(e) => {
                  e.preventDefault();
                  handleSaveProduct(e);
                }}
                onClose={() => {
                  setIsProductModalOpen(false);
                  resetProductForm();
                  setEditingProductId(null);
                }}
                loading={savingProduct}
                uploadingImages={uploadingImages}
              />
            </>
          )}

          {/* ORDERS SECTION */}
          {activeSection === 'orders' && (
            <OrdersSection
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
              filteredOrders={filteredOrders}
              handleOrderStatusSave={handleOrderStatusSave}
              savingOrderId={savingOrderId}
              handleViewOrder={handleViewOrder}
              onOrderUpdated={handleOrderUpdated}
            />
          )}

          {/* CUSTOM ORDERS SECTION */}
          {activeSection === 'custom-orders' && (
            <CustomOrdersSection
              customOrders={adminCustomOrders}
              customOrderFilter={customOrderFilter}
              setCustomOrderFilter={setCustomOrderFilter}
              handleViewCustomOrder={handleViewCustomOrder}
              handleReplyCustomOrder={handleReplyCustomOrder}
              respondingToOrderId={respondingToCustomOrderId}
              replyText={customOrderReplyText}
              setReplyText={setCustomOrderReplyText}
              sendingReply={sendingCustomOrderReply}
            />
          )}

          {/* ENQUIRIES SECTION */}
          {activeSection === 'enquiries' && (
            <EnquiriesSection
              enquiryFilter={enquiryFilter}
              setEnquiryFilter={setEnquiryFilter}
              filteredEnquiries={filteredEnquiries}
              handleRespondToEnquiry={handleRespondToEnquiry}
            />
          )}

          {/* ANALYTICS SECTION */}
          {activeSection === 'analytics' && (
            <AdminAnalytics
              summary={summary}
              orders={adminOrders}
              products={adminProducts}
              contacts={adminContacts}
              quotes={adminQuotes}
            />
          )}

          {/* SETTINGS SECTION */}
          {activeSection === 'settings' && <AdminSettings />}
        </main>

        {/* Import Products Modal */}
        <ImportProductsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={() => {
            refreshData();
            setSuccessMessage('Products imported successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />

        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setReplyTarget(null);
          }}
          onSend={sendReply}
          initialSubject={replyTarget?.subject || replyTarget?.material || ''}
          initialBody={replyTarget?.message || replyTarget?.notes || ''}
          loading={replyLoading}
        />

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isOrderDetailOpen}
          order={selectedOrder}
          onClose={() => {
            setIsOrderDetailOpen(false);
            setSelectedOrder(null);
          }}
          onOrderUpdated={handleOrderUpdated}
          onPaymentVerificationSave={handlePaymentVerificationSave}
        />
      </div>
    </div>
  );
}
