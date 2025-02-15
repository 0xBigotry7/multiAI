'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';
import { ReactNode } from 'react';
import { defaultLocale, type Locale } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  locale?: Locale;
  messages?: Record<string, any>;
}

export function I18nProvider({ children, locale = defaultLocale, messages }: I18nProviderProps) {
  const defaultMessages = useMessages();
  
  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages || defaultMessages}
      defaultTranslationValues={{
        strong: (chunks) => <strong>{chunks}</strong>,
        em: (chunks) => <em>{chunks}</em>,
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
} 