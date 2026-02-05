import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Define locales here to use in getRequestConfig
const locales = ['en', 'es'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

// Re-export from routing for backward compatibility
export { locales, type Locale, defaultLocale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request, fallback to default if not provided
  let locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  // If invalid or undefined, fall back to default locale instead of calling notFound()
  // (notFound() cannot be called in root layout context)
  const validLocale: Locale = (locale && locales.includes(locale as Locale)) 
    ? (locale as Locale) 
    : defaultLocale;

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`./messages/${validLocale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${validLocale}, falling back to ${defaultLocale}`);
    messages = (await import(`./messages/${defaultLocale}.json`)).default;
  }

  return {
    locale: validLocale,
    messages,
    // Configure error handling for missing messages
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      console.warn(`Missing translation: ${path}`);
      return path;
    },
    onError(error) {
      // Log error but don't crash the app
      if (process.env.NODE_ENV === 'development') {
        console.error('Translation error:', error);
      }
    }
  };
});
