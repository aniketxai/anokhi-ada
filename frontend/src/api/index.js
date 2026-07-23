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

  if (path.includes('/admin') || path.includes('/auth')) {
    const token = localStorage.getItem('adminToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetchWithTimeout(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/products/home`);
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

// ── Default export ────────────────────────────────────────────────────────────

export default {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchHomeData,
  getCachedProducts,
  getCachedProductById,
  getCachedCategories,
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
};