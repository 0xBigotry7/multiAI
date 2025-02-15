'use client';

import './globals.css';
import type { Metadata } from 'next';
import { RootProvider } from '@/components/providers/root-provider';

export const metadata: Metadata = {
  title: 'Multi-AI Dating Simulator',
  description: 'A modern AI dating simulator with multiple personalities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
} 