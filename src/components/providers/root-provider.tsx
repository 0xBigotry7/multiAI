'use client';

import React from 'react';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { AuthType } from '@particle-network/auth-core';
import { ThemeProvider } from '@/providers/theme-provider';

export function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthCoreContextProvider
        options={{
          projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID as string,
          clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY as string,
          appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID as string,
          authTypes: [AuthType.email, AuthType.google],
          themeType: "dark",
          fiatCoin: "CNY",
          language: "zh-cn",
          promptSettingConfig: {
            promptPaymentPasswordSettingWhenSign: true,
            promptMasterPasswordSettingWhenLogin: true,
          },
          wallet: {
            themeType: 'dark',
            visible: true,
          },
        }}
      >
        {children}
      </AuthCoreContextProvider>
    </ThemeProvider>
  );
} 