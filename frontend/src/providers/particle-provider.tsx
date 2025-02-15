'use client';

import * as React from 'react';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { Ethereum } from '@particle-network/chains';

if (!process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || 
    !process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || 
    !process.env.NEXT_PUBLIC_PARTICLE_APP_ID) {
  throw new Error('Missing Particle Network credentials in environment variables');
}

const config = {
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
  chains: [Ethereum],
};

export default function ParticleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCoreContextProvider options={config} theme="dark">
      {children}
    </AuthCoreContextProvider>
  );
} 