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
  AlertTriangle,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { categories, ADMIN_CATEGORIES, ADMIN_SUBCATEGORIES } from '../data/categories';
import { formatINR } from '../utils/currency';
import api from '../api/index.js';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import ImportProductsModal from '../components/ImportProductsModal';
import ReplyModal from '../components/ReplyModal';
import { AdminLogin, AdminLogoutButton } from './AdminLogin';
import {
  ProductEditModal,
  AddCategoryModal,
  OrderDetailModal,
  OverviewSection,
  CatalogSection,
  OrdersSection,
  EnquiriesSection,
  CustomOrdersSection,
  SiteContentSection,
  CustomersSection,
  formatPaymentValue,
} from './AdminComponents';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hr' : 'hrs'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'site-content', label: 'Homepage & Banners', icon: ImageIcon },
  { id: 'catalog', label: 'Catalog', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'custom-orders', label: 'Custom Orders', icon: FileUp },
  { id: 'customers', label: 'Customers', icon: ShieldCheck },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquareText },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  processing: 'bg-sky-100 text-sky-800 border-sky-300',
  shipped: 'bg-violet-100 text-violet-800 border-violet-300',
  delivered: 'bg-teal-100 text-teal-800 border-teal-300',
  new: 'bg-sky-100 text-sky-800 border-sky-300',
  'in-review': 'bg-amber-100 text-amber-800 border-amber-300',
  quoted: 'bg-purple-100 text-purple-800 border-purple-300',
  replied: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const emptyProductForm = {
  id: '',
  name: '',
  category: '',
  subCategory: '',
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
  const [productSubCategory, setProductSubCategory] = useState('All');
  const [orderFilter, setOrderFilter] = useState('All');
  const [customOrderFilter, setCustomOrderFilter] = useState('All');
  const [enquiryFilter, setEnquiryFilter] = useState('All');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
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
  const [dbCategories, setDbCategories] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomOrders, setAdminCustomOrders] = useState([]);
  const [adminQuotes, setAdminQuotes] = useState([]);
  const [adminContacts, setAdminContacts] = useState([]);
  const [adminSiteContent, setAdminSiteContent] = useState(null);
  const [savingSiteContent, setSavingSiteContent] = useState(false);
  const [activity, setActivity] = useState([]);

  // Check authentication on mount
useEffect(() => {
  const token = localStorage.getItem('adminToken');
  setIsAuthenticated(!!token);
}, []);

const categoryOptions = useMemo(() => {
  const set = new Set(ADMIN_CATEGORIES);
  (dbCategories || []).forEach((c) => {
    if (c?.name) set.add(c.name);
    if (typeof c === 'string') set.add(c);
  });
  (adminProducts || []).forEach((p) => {
    if (p.category) set.add(p.category);
  });
  return ['All', ...Array.from(set)];
}, [dbCategories, adminProducts]);

const subCategoryOptions = useMemo(() => {
  const set = new Set(ADMIN_SUBCATEGORIES);
  (adminProducts || []).forEach((p) => {
    if (p.subCategory) set.add(p.subCategory);
  });
  return ['All', ...Array.from(set)];
}, [adminProducts]);

const loadAdminData = useCallback(async ({ showLoading = true } = {}) => {
    let cancelled = false;

    if (showLoading) setLoading(true);

    try {
      setError(null);

      const [summaryResult, productsResult, categoriesResult, ordersResult, customOrdersResult, quotesResult, contactsResult, siteContentResult] = await Promise.allSettled([
        api.fetchAdminSummary(),
        api.fetchAdminProducts(),
        api.fetchAdminCategories(),
        api.fetchAdminOrders(),
        api.fetchAdminCustomOrders(),
        api.fetchAdminQuotes(),
        api.fetchAdminContacts(),
        api.fetchAdminSiteContent(),
      ]);

      if (cancelled) return;

      const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const productsData = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const categoriesData = categoriesResult.status === 'fulfilled' ? (categoriesResult.value?.data || categoriesResult.value?.categories || []) : [];
      const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
      const customOrdersData = customOrdersResult.status === 'fulfilled' ? customOrdersResult.value : [];
      const quotesData = quotesResult.status === 'fulfilled' ? quotesResult.value : [];
      const contactsData = contactsResult.status === 'fulfilled' ? contactsResult.value : [];
      const siteContentData = siteContentResult.status === 'fulfilled' ? siteContentResult.value : null;

      setSummary(summaryData);
      setAdminProducts(productsData);
      setDbCategories(categoriesData);
      setAdminOrders(ordersData);
      setAdminCustomOrders(customOrdersData);
      setAdminQuotes(quotesData);
      setAdminContacts(contactsData);
      setAdminSiteContent(siteContentData);
      
      

      const allActivities = [
        ...(ordersData || []).map((o) => {
          const orderNum = o.orderNumber || (o._id ? `#${String(o._id).slice(-6)}` : 'Order');
          const customerName = o.shipping?.firstName
            ? `${o.shipping.firstName} ${o.shipping.lastName || ''}`.trim()
            : o.customerName || o.customer || '';
          const statusText = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Pending';
          const title = customerName
            ? `Order ${orderNum} (${statusText}) - ${customerName}`
            : `Order ${orderNum} (${statusText})`;
          const rawDate = o.createdAt || o.updatedAt;
          return {
            id: o._id || o.id,
            title,
            timestamp: rawDate ? new Date(rawDate).getTime() : 0,
            time: formatRelativeTime(rawDate),
            type: 'order',
          };
        }),
        ...(customOrdersData || []).map((co) => {
          const name = co.name || co.customerName || 'Customer';
          const statusText = co.status ? co.status.charAt(0).toUpperCase() + co.status.slice(1) : 'New';
          const title = `Custom order from ${name} (${statusText})`;
          const rawDate = co.createdAt || co.updatedAt;
          return {
            id: co._id || co.id,
            title,
            timestamp: rawDate ? new Date(rawDate).getTime() : 0,
            time: formatRelativeTime(rawDate),
            type: 'custom-order',
          };
        }),
        ...(quotesData || []).map((q) => {
          const name = q.companyName || q.name || 'Customer';
          const statusText = q.status ? q.status.charAt(0).toUpperCase() + q.status.slice(1) : 'New';
          const title = `Quote request from ${name} (${statusText})`;
          const rawDate = q.createdAt || q.updatedAt;
          return {
            id: q._id || q.id,
            title,
            timestamp: rawDate ? new Date(rawDate).getTime() : 0,
            time: formatRelativeTime(rawDate),
            type: 'quote',
          };
        }),
        ...(contactsData || []).map((c) => {
          const name = c.name || 'Customer';
          const title = `Enquiry from ${name}: ${c.subject || 'Message'}`;
          const rawDate = c.createdAt || c.updatedAt;
          return {
            id: c._id || c.id,
            title,
            timestamp: rawDate ? new Date(rawDate).getTime() : 0,
            time: formatRelativeTime(rawDate),
            type: 'contact',
          };
        }),
        ...(productsData || []).map((p) => {
          const name = p.name || p.id || 'Product';
          const title = `Catalog product "${name}" updated`;
          const rawDate = p.updatedAt || p.createdAt;
          return {
            id: p._id || p.id,
            title,
            timestamp: rawDate ? new Date(rawDate).getTime() : 0,
            time: formatRelativeTime(rawDate),
            type: 'catalog',
          };
        }),
      ];

      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivity(allActivities.slice(0, 6));
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
        (product.subCategory || '').toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q);

      const matchesCategory = productCategory === 'All' || product.category === productCategory;
      const matchesSubCategory = productSubCategory === 'All' || product.subCategory === productSubCategory;
      return matchesQuery && matchesCategory && matchesSubCategory;
    });
  }, [productQuery, productCategory, productSubCategory, adminProducts]);

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
        label: 'Failed Payments',
        value: (summary?.failedPaymentCount ?? (adminOrders || []).filter((o) => o.payment?.status === 'failed' || o.status === 'failed').length).toString(),
        delta: summary?.failedPaymentAmount ? `Loss: ${formatINR(summary.failedPaymentAmount)}` : 'Recoverable',
        tone: 'down',
        icon: AlertTriangle,
      },
      {
        label: 'Total Views',
        value: (summary?.totalProductViews ?? (adminProducts || []).reduce((s, p) => s + Number(p.views || 0), 0)).toString(),
        delta: 'Store impressions',
        tone: 'up',
        icon: Eye,
      },
      {
        label: 'Pending',
        value: (adminOrders || []).filter((o) => o.status === 'pending' && o.payment?.status !== 'failed').length.toString(),
        delta: '-4.1%',
        tone: 'down',
        icon: Clock3,
      },
      {
        label: 'Low Stock',
        value: lowStockProducts.length.toString(),
        delta: 'Needs restock',
        tone: 'warn',
        icon: PackageCheck,
      },
    ],
    [summary, statusCounts, adminOrders, adminProducts, lowStockProducts]
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
      subCategory: product.subCategory || product.subcategory || '',
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
      category: productForm.category,
      subCategory: productForm.subCategory,
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

  const handleSaveCategory = useCallback(async ({ name, subCategories }) => {
    try {
      setSavingCategory(true);
      setError(null);
      await api.createAdminCategory({ name, subCategories });
      setSuccessMessage(`Custom category "${name}" saved to database!`);
      setIsAddCategoryModalOpen(false);
      await refreshData();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  }, [refreshData]);

  const handleQuickUpdateSubCategory = useCallback(async (product, newSubCategory) => {
    const id = product.id || product._id;
    if (!id) return;

    try {
      setError(null);
      setSuccessMessage(null);
      await api.updateAdminProduct(id, {
        ...product,
        subCategory: newSubCategory,
      });
      setSuccessMessage(`Updated subcategory for "${product.name}" to "${newSubCategory || 'None'}"`);
      await refreshData();
    } catch (err) {
      console.error('Failed to update subcategory:', err);
      setError(err.message || 'Failed to update subcategory');
    }
  }, [refreshData]);

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

  const handleSaveSiteContent = useCallback(async (updatedContent) => {
    setSavingSiteContent(true);
    try {
      setError(null);
      const res = await api.updateAdminSiteContent(updatedContent);
      setAdminSiteContent(res.data);
      setSuccessMessage('Homepage content updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save site content:', err);
      setError(err.message || 'Failed to save site content');
    } finally {
      setSavingSiteContent(false);
    }
  }, []);

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
      link.download = `anokhi-ada-export-${new Date().toISOString().split('T')[0]}.json`;
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
          <h1 className="mt-2 text-2xl font-bold font-display">Anokhi Ada Admin Panel</h1>
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
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-rose-900 font-bold shadow-lg flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-screen-2xl">
        {/* Sidebar */}
        <aside className="hidden xl:flex w-72 flex-col border-r border-border bg-card px-5 py-6 sticky top-0 h-screen shadow-xs">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-outline font-bold">Anokhi Ada</p>
              <h1 className="text-2xl font-extrabold text-foreground font-display">Admin Panel</h1>
            </div>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900">Live</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors text-left ${
                    active
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'bg-transparent text-foreground hover:bg-surface-muted hover:text-primary'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Secure Admin</p>
                <p className="text-xs font-medium text-secondary-text">2FA · Audit logs · Roles</p>
              </div>
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              Product, order, quote, and message management for Anokhi Ada.
            </p>
            <AdminLogoutButton onLogout={() => setIsAuthenticated(false)} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mb-6 rounded-[28px] border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-outline font-bold">Ecommerce control center</p>
                <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-foreground font-display">Anokhi Ada Admin Panel</h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-secondary-text font-medium">
                  Manage products, orders, quote requests, customer messages, shipping, and store settings in one command center.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors shadow-xs">
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={beginCreateProduct}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-xs"
                >
                  <Plus size={16} />
                  Add product
                </button>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-900 shadow-xs">
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

          {/* SITE CONTENT SECTION */}
          {activeSection === 'site-content' && (
            <SiteContentSection
              siteContent={adminSiteContent}
              onSaveSiteContent={handleSaveSiteContent}
              saving={savingSiteContent}
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
                productSubCategory={productSubCategory}
                setProductSubCategory={setProductSubCategory}
                subCategoryOptions={subCategoryOptions}
                filteredProducts={filteredProducts}
                adminProducts={adminProducts}
                beginEditProduct={beginEditProduct}
                handleDeleteProduct={handleDeleteProduct}
                handleQuickUpdateSubCategory={handleQuickUpdateSubCategory}
                resetProductForm={resetProductForm}
                setEditingProductId={setEditingProductId}
                setIsProductModalOpen={setIsProductModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
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
                categoryOptions={categoryOptions}
              />

              {/* Add Custom Category Modal */}
              <AddCategoryModal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                onSaveCategory={handleSaveCategory}
                loading={savingCategory}
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

          {/* CUSTOMERS SECTION */}
          {activeSection === 'customers' && <CustomersSection />}

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
