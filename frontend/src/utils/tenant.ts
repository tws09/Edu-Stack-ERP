const BASE = import.meta.env.VITE_BASE_DOMAIN ?? 'tws.enterprises';

// Subdomains that are never org slugs
const RESERVED = new Set(['admin', 'api', 'www', 'app', 'edu', 'swh']);

// Subdomains that map to specific product landing pages
// Extend this set as new products launch (e.g. 'hospital', 'hr')
const PRODUCTS = new Set(['edu']);

export function getOrgSlug(): string | null {
  const host = window.location.hostname;
  if (host === 'localhost' || /^\d/.test(host)) return null;
  if (host === BASE || host === `www.${BASE}`) return null;
  if (!host.endsWith(`.${BASE}`)) return null;
  const sub = host.slice(0, -(BASE.length + 1));
  if (RESERVED.has(sub)) return null;
  return sub;
}

export function isAdminDomain(): boolean {
  const host = window.location.hostname;
  return host === `admin.${BASE}` || host === 'localhost';
}

// Returns the product subdomain ('edu', 'hospital', …) or null
export function getProductSubdomain(): string | null {
  const host = window.location.hostname;
  if (!host.endsWith(`.${BASE}`)) return null;
  const sub = host.slice(0, -(BASE.length + 1));
  return PRODUCTS.has(sub) ? sub : null;
}

export function schoolUrl(slug: string, path = ''): string {
  return `https://${slug}.${BASE}${path}`;
}

export function adminLoginUrl(): string {
  return `https://admin.${BASE}/login`;
}

export function productUrl(product: string, path = ''): string {
  return `https://${product}.${BASE}${path}`;
}
