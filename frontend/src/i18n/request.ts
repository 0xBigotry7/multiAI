import { getRequestConfig } from 'next-intl/server';
import { languages, type Locale } from '@/lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`@/messages/${locale}.json`)).default,
    timeZone: 'Asia/Shanghai',
    now: new Date()
  };
}); 