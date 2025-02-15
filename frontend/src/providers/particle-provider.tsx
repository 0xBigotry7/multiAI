'use client';

import * as React from 'react';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { Ethereum } from '@particle-network/chains';
import { AuthType } from '@particle-network/auth-core';

if (!process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || 
    !process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || 
    !process.env.NEXT_PUBLIC_PARTICLE_APP_ID) {
  throw new Error('Missing Particle Network credentials in environment variables');
}

const config = {
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID as string,
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY as string,
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID as string,
  chains: [Ethereum],
  authTypes: [AuthType.email, AuthType.google, AuthType.github],
  modalTheme: 'dark',
  appearance: 'dark',
  promptSettingConfig: {
    promptPaymentPasswordSettingWhenSign: 1,
    promptMasterPasswordSettingWhenLogin: 1,
  },
};

export default function ParticleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCoreContextProvider options={config}>
      {children}
    </AuthCoreContextProvider>
  );
} 