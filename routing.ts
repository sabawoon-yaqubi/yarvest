import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Define locales here to avoid circular dependency
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Only show locale prefix for non-default locale (Spanish)
  // English will be at root (/), Spanish at (/es)
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
