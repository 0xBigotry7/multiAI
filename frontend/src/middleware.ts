import createMiddleware from 'next-intl/middleware';
import { languages } from './lib/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: Object.keys(languages),
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Enable locale detection
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|zh|es|fr|de|it|pt|ru|ja|ko)/:path*']
}; 