'use client';

import type { Session } from 'next-auth';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  const login = useCallback(async (provider?: string) => {
    try {
      const result = await signIn(provider, { 
        redirect: true,
        callbackUrl: '/'
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }, []);

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    login,
    logout,
  };
} 