import { type Locale } from '@/i18n';

/**
 * Builds a URL path (no locale prefix since we use cookie-based locale detection)
 * - Returns path as-is without any locale prefix
 * - Locale is handled via cookies, not URL
 */
export function getLocalizedPath(path: string, locale?: Locale): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // With localePrefix: 'never', we don't add locale prefixes to URLs
  // Locale is detected from cookies by the middleware
  return normalizedPath;
}
