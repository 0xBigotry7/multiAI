import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata';
import { languages } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

// Root layout - server component
export { metadata };

export async function generateStaticParams() {
  return Object.keys(languages).map((locale) => ({ locale }));
}

// Client wrapper component
import ClientLayout from './client-layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
} 