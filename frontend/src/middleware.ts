import createMiddleware from 'next-intl/middleware';
import { languages, defaultLocale } from './lib/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: Object.keys(languages),
  
  // Used when no locale matches
  defaultLocale,
  
  // Enable locale detection
  localeDetection: true,
  
  // Set default locale prefix for better SEO
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(zh|en)/:path*']
}; 