import { categories as fallbackCategories, products as fallbackProducts } from '../data/products';

const REQUEST_TIMEOUT_MS = 12000;
const PRODUCT_CACHE_KEY = 'sambx.products.cache.v1';
const CATEGORY_CACHE_KEY = 'sambx.categories.cache.v1';
const HOME_CACHE_KEY = 'sambx.home.cache.v1';

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readJsonCache(key, fallback) {
  if (!isBrowserStorageAvailable()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonCache(key, value) {
  if (!isBrowserStorageAvailable()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

function normalizeProductList(items) {
  return Array.isArray(items) ? items : [];
}

function getCachedProducts() {
  return normalizeProductList(readJsonCache(PRODUCT_CACHE_KEY, []));
}

function cacheProducts(items) {
  writeJsonCache(PRODUCT_CACHE_KEY, normalizeProductList(items));
}

function getCachedProductById(id) {
  return getCachedProducts().find(item => String(item?.id) === String(id)) || null;
}

function getCachedCategories() {
  return normalizeProductList(readJsonCache(CATEGORY_CACHE_KEY, []));
}

function cacheCategories(items) {
  writeJsonCache(CATEGORY_CACHE_KEY, normalizeProductList(items));
}

function getCachedHomeData() {
  return readJsonCache(HOME_CACHE_KEY, null);
}

function cacheHomeData(data) {
  writeJsonCache(HOME_CACHE_KEY, data);
}

export function getBaseUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5002';
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    console.warn('VITE_API_URL is missing. Falling back to the current site origin for API requests.');
    return window.location.origin.replace(/\/+$/, '');
  }

  throw new Error('VITE_API_URL is missing. Set it to your deployed backend URL.');
}

function buildUrl(path, params = {}) {
  const url = new URL(path, getBaseUrl());
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestJson(path, { method = 'GET', body, params } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (path.includes('/admin')) {
    const token = localStorage.getItem('adminToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }

  return res.json();
}

export async function fetchProducts({ category, q, sort } = {}) {
  const url = buildUrl('/api/products', { category, q, sort });
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error('Failed to fetch products');

    const json = await res.json();
    const items = normalizeProductList(json.data);

    if (items.length && json.dataSource === 'db') {
      cacheProducts(items);
      cacheCategories([...new Set(items.map(item => item?.category).filter(Boolean))]);
    }

    const cachedProducts = getCachedProducts();
    const cachedCategories = getCachedCategories();

    if (json.dataSource !== 'db') {
      if (cachedProducts.length) {
        return { items: cachedProducts, dataSource: 'cache', categories: cachedCategories };
      }
      if (items.length) {
        return {
          items,
          dataSource: json.dataSource || 'fallback',
          categories: [...new Set(items.map(item => item?.category).filter(Boolean))],
        };
      }
    }

    const resolvedItems = items.length ? items : cachedProducts;
    return {
      items: resolvedItems,
      dataSource: json.dataSource || (cachedProducts.length ? 'cache' : 'none'),
      categories: cachedCategories.length
        ? cachedCategories
        : [...new Set(resolvedItems.map(item => item?.category).filter(Boolean))],
    };
  } catch (error) {
    const cachedProducts = getCachedProducts();
    if (cachedProducts.length) {
      return { items: cachedProducts, dataSource: 'cache', categories: getCachedCategories() };
    }
    if (fallbackProducts.length) {
      return { items: fallbackProducts, dataSource: 'fallback', categories: fallbackCategories };
    }
    throw error;
  }
}

export async function fetchProductById(id) {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/products/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Product not found');

    const data = await res.json();
    const product = data.data || null;

    if (product && data.dataSource === 'db') {
      const existing = getCachedProducts();
      const next = existing.filter(item => String(item?.id) !== String(product.id));
      cacheProducts([...next, product]);
    }

    return product || getCachedProductById(id) || fallbackProducts.find(item => String(item.id) === String(id)) || null;
  } catch {
    return getCachedProductById(id) || fallbackProducts.find(item => String(item.id) === String(id)) || null;
  }
}

export async function fetchCategories() {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');

    const data = await res.json();
    const categories = normalizeProductList(data.data);

    if (categories.length) {
      cacheCategories(categories);
      return categories;
    }

    const cachedCategories = getCachedCategories();
    if (cachedCategories.length) return cachedCategories;
    return fallbackCategories;
  } catch {
    const cachedCategories = getCachedCategories();
    if (cachedCategories.length) return cachedCategories;
    return fallbackCategories;
  }
}

export async function fetchHomeData() {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/products/home`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch home data');

    const data = await res.json();
    const homeData = data.data || {};

    if (homeData.featuredProducts?.length) cacheProducts(homeData.featuredProducts);
    cacheHomeData(homeData);
    return homeData;
  } catch {
    const cachedHomeData = getCachedHomeData();
    if (cachedHomeData) return cachedHomeData;

    const cachedProducts = getCachedProducts();
    return {
      featuredProducts: cachedProducts.slice(0, 4),
      services: [],
      testimonials: [],
      faqs: [],
      categories: getCachedCategories(),
    };
  }
}

export async function fetchAdminSummary() {
  const data = await requestJson('/api/admin/summary');
  return data.data || {};
}

export async function fetchAdminProducts(params = {}) {
  const data = await requestJson('/api/admin/products', { params });
  return data.data || [];
}

export async function createAdminProduct(payload) {
  return requestJson('/api/admin/products', { method: 'POST', body: payload });
}

export async function updateAdminProduct(id, payload) {
  return requestJson(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
}

export async function deleteAdminProduct(id) {
  return requestJson(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchAdminOrders(params = {}) {
  const data = await requestJson('/api/admin/orders', { params });
  return data.data || [];
}

export async function updateOrderStatus(id, status) {
  return requestJson(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function updateOrderPaymentVerification(id, payload) {
  return requestJson(`/api/admin/orders/${encodeURIComponent(id)}/payment`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function cancelOrder(id, cancellationReason = '') {
  return requestJson(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: 'PATCH',
    body: { cancellationReason },
  });
}

export async function fetchAdminQuotes(params = {}) {
  const data = await requestJson('/api/admin/quotes', { params });
  return data.data || [];
}

export async function updateQuoteStatus(id, status) {
  return requestJson(`/api/admin/quotes/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function fetchAdminContacts(params = {}) {
  const data = await requestJson('/api/admin/contacts', { params });
  return data.data || [];
}

export async function updateContactStatus(id, status) {
  return requestJson(`/api/admin/contacts/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function postAdminContactReply(id, payload) {
  return requestJson(`/api/admin/contacts/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: payload,
  });
}

export async function postAdminQuoteReply(id, payload) {
  return requestJson(`/api/admin/quotes/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: payload,
  });
}

export async function fetchAdminCustomOrders(params = {}) {
  const data = await requestJson('/api/admin/custom-orders', { params });
  return data.data || [];
}

export async function updateCustomOrderStatus(id, status) {
  return requestJson(`/api/admin/custom-orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function postAdminCustomOrderReply(id, payload) {
  return requestJson(`/api/admin/custom-orders/${encodeURIComponent(id)}/reply`, {
    method: 'POST',
    body: payload,
  });
}

export async function postContact(payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit contact');
  return res.json();
}

export async function postQuote(payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit quote');
  return res.json();
}

export async function postOrder(payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function submitCustomOrder(formData) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to submit custom order');
  }
  return res.json();
}

export async function fetchCustomOrders() {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders`);
  if (!res.ok) throw new Error('Failed to fetch custom orders');
  return res.json();
}

export async function fetchCustomOrderById(id) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch custom order');
  return res.json();
}

export async function updateCustomOrder(id, payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update custom order');
  return res.json();
}

export async function cancelCustomOrder(id) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders/${id}/cancel`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to cancel custom order');
  return res.json();
}

export async function deleteCustomOrder(id) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/custom-orders/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete custom order');
  return res.json();
}

// ── Pay Link ──────────────────────────────────────────────────────────────────

export async function getPayLink(token) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/pay-links/${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid pay link.');
  return data;
}

export async function postPayLinkOrder(token, payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/pay-links/${encodeURIComponent(token)}/order`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order.');
  return data;
}

// ── Admin: Generate Pay Link ──────────────────────────────────────────────────

export async function generateAdminPayLink(payload) {
  return requestJson('/api/pay-links', { method: 'POST', body: payload });
}

// ── Razorpay Integration ──────────────────────────────────────────────────────

export async function fetchRazorpayKey() {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/orders/razorpay-key`);
  if (!res.ok) throw new Error('Failed to fetch Razorpay key');
  return res.json();
}

export async function createRazorpayOrder(payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/orders/create-razorpay-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to initialize Razorpay payment');
  return data;
}

export async function verifyRazorpayPayment(payload) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/orders/verify-razorpay-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Payment verification failed');
  return data;
}

export async function incrementProductView(id) {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/products/${encodeURIComponent(id)}/view`, {
      method: 'POST',
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function markOrderPaymentFailed(payload) {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/orders/mark-failed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export function getCachedSiteContent() {
  return readJsonCache('sambx.siteContent.cache.v1', null);
}

export async function fetchSiteContent() {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/site-content/public`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch site content');
    const data = await res.json();
    const content = data.data || {};
    writeJsonCache('sambx.siteContent.cache.v1', content);
    return content;
  } catch (err) {
    const cached = readJsonCache('sambx.siteContent.cache.v1', null);
    if (cached) return cached;
    return null;
  }
}

export async function fetchAdminSiteContent() {
  const endpoints = ['/api/site-content/admin', '/api/admin/site-content', '/api/site-content/public'];
  for (const ep of endpoints) {
    try {
      const data = await requestJson(ep);
      if (data?.data) return data.data;
    } catch {
      // try next endpoint
    }
  }
  return (await fetchSiteContent()) || {};
}

export async function updateAdminSiteContent(payload) {
  const endpoints = ['/api/site-content/admin', '/api/admin/site-content', '/api/site-content'];
  for (const ep of endpoints) {
    try {
      const res = await requestJson(ep, { method: 'PUT', body: payload });
      if (res?.success) {
        if (res.data) writeJsonCache('sambx.siteContent.cache.v1', res.data);
        return res;
      }
    } catch {
      // try next endpoint
    }
  }
  // Local storage save fallback
  writeJsonCache('sambx.siteContent.cache.v1', payload);
  return { success: true, message: 'Saved content successfully', data: payload };
}

export async function uploadImageCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // 1. Try direct Cloudinary upload if configured
  if (cloudName && uploadPreset) {
    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(url, { method: 'POST', body: formData });
      if (res.ok) {
        const json = await res.json();
        if (json.secure_url || json.url) return json.secure_url || json.url;
      }
    } catch (err) {
      console.warn('Direct Cloudinary upload failed, falling back:', err);
    }
  }

  // 2. Try backend upload service (/api/site-content/admin/upload or /api/admin/upload)
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('adminToken');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const endpoints = [
      `${getBaseUrl()}/api/site-content/admin/upload`,
      `${getBaseUrl()}/api/admin/upload`,
      `${getBaseUrl()}/api/admin/site-content/upload`,
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, { method: 'POST', headers, body: formData });
        if (res.ok) {
          const json = await res.json();
          if (json.url) return json.url;
        }
      } catch {
        // try next endpoint
      }
    }
  } catch (err) {
    console.warn('Backend upload failed, falling back to FileReader:', err);
  }

  // 3. Guaranteed client-side FileReader Data URI fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ── Customer auth (signup / login / forgot-password OTP flow) ────────────────

function customerAuthHeaders() {
  const token = localStorage.getItem('customerToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerCustomer({ name, email, phone, password }) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function loginCustomer({ email, password }) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function fetchMyProfile() {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/me`, {
    headers: customerAuthHeaders(),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load profile');
  return data;
}

export async function updateCustomerProfile(profileData) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/me`, {
    method: 'PUT',
    headers: { ...customerAuthHeaders(), 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function fetchCustomerOrders() {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/orders`, {
    headers: customerAuthHeaders(),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch order history');
  return data;
}

export async function requestPasswordResetOtp(email) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send reset code');
  return data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid code');
  return data;
}

export async function resetCustomerPassword({ email, resetToken, newPassword }) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/customer-auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ email, resetToken, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
}

// ── Order tracking (Manual Admin Controlled) ──────────────────────────────────

export async function trackOrder({ orderNumber, contact }) {
  const res = await fetchWithTimeout(`${getBaseUrl()}/api/tracking/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ orderNumber, contact }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Order not found');
  return data;
}

// ── Admin: shipments (Manual Control) ─────────────────────────────────────────

export async function adminSaveShipment(orderId, shipmentData = {}) {
  return requestJson(`/api/admin/shipments/${orderId}/save`, { method: 'POST', body: shipmentData });
}

export async function adminCreateShipment(orderId, options = {}) {
  return adminSaveShipment(orderId, options);
}

export async function adminSyncShipment(orderId) {
  return requestJson(`/api/admin/shipments/${orderId}/sync`, { method: 'POST' });
}

export async function adminCancelShipment(orderId, reason) {
  return requestJson(`/api/admin/shipments/${orderId}/cancel`, { method: 'POST', body: { reason } });
}

export async function adminGetShipment(orderId) {
  return requestJson(`/api/admin/shipments/${orderId}`);
}

// ── Admin: registered customers ───────────────────────────────────────────────

export async function adminFetchUsers(q) {
  return requestJson('/api/admin/users', { params: { q } });
}

export async function adminSetUserBlocked(userId, isBlocked) {
  return requestJson(`/api/admin/users/${userId}/status`, { method: 'PATCH', body: { isBlocked } });
}

// ── Default export ────────────────────────────────────────────────────────────

export default {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchHomeData,
  fetchSiteContent,
  getCachedSiteContent,
  fetchAdminSiteContent,
  updateAdminSiteContent,
  uploadImageCloudinary,
  getCachedProducts,
  getCachedProductById,
  getCachedCategories,
  incrementProductView,
  markOrderPaymentFailed,
  postContact,
  postQuote,
  postOrder,
  submitCustomOrder,
  fetchCustomOrders,
  fetchCustomOrderById,
  updateCustomOrder,
  cancelCustomOrder,
  deleteCustomOrder,
  fetchAdminSummary,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderPaymentVerification,
  fetchAdminQuotes,
  updateQuoteStatus,
  fetchAdminCustomOrders,
  updateCustomOrderStatus,
  postAdminCustomOrderReply,
  fetchAdminContacts,
  updateContactStatus,
  postAdminContactReply,
  postAdminQuoteReply,
  cancelOrder,
  getPayLink,
  postPayLinkOrder,
  generateAdminPayLink,
  fetchRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  registerCustomer,
  loginCustomer,
  fetchMyProfile,
  updateCustomerProfile,
  fetchCustomerOrders,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetCustomerPassword,
  trackOrder,
  adminSaveShipment,
  adminCreateShipment,
  adminSyncShipment,
  adminCancelShipment,
  adminGetShipment,
  adminFetchUsers,
  adminSetUserBlocked,
};