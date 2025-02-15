import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { languages } from '@/lib/i18n';
import RootLayout from '@/components/layout/RootLayout';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return Object.keys(languages).map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate that the incoming locale is supported
  if (!Object.keys(languages).includes(locale)) {
    notFound();
  }

  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <RootLayout>
        {children}
      </RootLayout>
    </NextIntlClientProvider>
  );
} 