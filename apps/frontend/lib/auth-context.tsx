'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName?: string;
  company?: {
    id: string;
    legalName: string;
    displayName: string;
    activeFinancialYearId: string;
  };
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  logout: () => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string) => void;
  selectedFinancialYear: string;
  setSelectedFinancialYear: (fy: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('FY 2024-25');
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('finflow_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        if (res.data.user?.company?.id) {
          setSelectedCompanyId(res.data.user.company.id);
        }
      } catch (err) {
        localStorage.removeItem('finflow_access_token');
        localStorage.removeItem('finflow_refresh_token');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    localStorage.setItem('finflow_access_token', tokens.accessToken);
    localStorage.setItem('finflow_refresh_token', tokens.refreshToken);
    setUser(userData);
    if (userData.company?.id) {
      setSelectedCompanyId(userData.company.id);
    }
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('finflow_access_token');
    localStorage.removeItem('finflow_refresh_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        selectedCompanyId,
        setSelectedCompanyId,
        selectedFinancialYear,
        setSelectedFinancialYear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
