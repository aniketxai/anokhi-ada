const DEFAULT_FALLBACK_IMAGE = 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600';

export function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_FALLBACK_IMAGE;
  if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
    return DEFAULT_FALLBACK_IMAGE;
  }
  return url;
}

export function sanitizeProductImages(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return [DEFAULT_FALLBACK_IMAGE];
  }
  const cleaned = images.map(sanitizeImageUrl);
  return cleaned.length ? cleaned : [DEFAULT_FALLBACK_IMAGE];
}
