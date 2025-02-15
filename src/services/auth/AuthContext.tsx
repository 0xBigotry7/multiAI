import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthType } from '@particle-network/auth-core';
import { useConnect, useAuthCore } from '@particle-network/authkit';

interface UserInfo {
  uuid: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithWeChat: () => Promise<void>;
  loginWithWallet: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  loginWithEmail: async () => {},
  loginWithWeChat: async () => {},
  loginWithWallet: async () => {},
  signup: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();

  const login = async () => {
    try {
      setError(null);
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await connect({
        preferredAuthType: AuthType.EMAIL,
        account: email,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with email');
      throw err;
    }
  };

  const loginWithWeChat = async () => {
    try {
      setError(null);
      await connect({
        preferredAuthType: AuthType.WECHAT,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with WeChat');
      throw err;
    }
  };

  const loginWithWallet = async () => {
    try {
      setError(null);
      await connect({
        preferredAuthType: AuthType.WALLET,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with wallet');
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      await connect({
        preferredAuthType: AuthType.EMAIL,
        account: email,
        password,
        signup: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        user: userInfo ? userInfo as UserInfo : null,
        loading: !connected,
        error,
        login,
        loginWithEmail,
        loginWithWeChat,
        loginWithWallet,
        signup,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 