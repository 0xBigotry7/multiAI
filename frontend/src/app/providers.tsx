'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/providers/theme-provider';
import { type Locale } from '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, any>;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Shanghai">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
} 