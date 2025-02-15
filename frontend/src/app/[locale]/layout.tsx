import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { languages, type Locale } from '@/lib/i18n';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/app/providers';
import { Inter } from 'next/font/google';
import ClientLayout from '../client-layout';
import { RootLayout } from '@/components/layout/RootLayout';

const inter = Inter({ subsets: ['latin'] });

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return Object.keys(languages).map((locale) => ({ locale }));
}

export default async function LocaleLayout({ 
  children, 
  params: { locale: localeParam } 
}: LocaleLayoutProps) {
  // Validate that the incoming locale is supported
  if (!Object.keys(languages).includes(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers locale={locale} messages={messages}>
          <ClientLayout>
            <RootLayout>
              {children}
            </RootLayout>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
} 