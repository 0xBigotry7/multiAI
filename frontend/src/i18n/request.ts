import { getRequestConfig } from 'next-intl/server';
import { languages, type Locale } from '@/lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  if (!(locale in languages)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  
  return {
    messages: (await import(`@/messages/${locale}.json`)).default
  };
}); 