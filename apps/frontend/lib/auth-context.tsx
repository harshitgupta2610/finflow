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
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('finflow_session_active');
      localStorage.removeItem('finflow_access_token');
      localStorage.removeItem('finflow_refresh_token');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    async function initAuth() {
      if (typeof window === 'undefined') return;

      const isReload =
        (window.performance && (window.performance as any).navigation?.type === 1) ||
        (window.performance &&
          window.performance.getEntriesByType &&
          (window.performance.getEntriesByType('navigation')[0] as any)?.type === 'reload');

      const isSessionActive = sessionStorage.getItem('finflow_session_active');

      if (isReload || !isSessionActive) {
        localStorage.removeItem('finflow_access_token');
        localStorage.removeItem('finflow_refresh_token');
        sessionStorage.removeItem('finflow_session_active');
        setUser(null);
        setLoading(false);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          router.replace('/login');
        }
        return;
      }

      const token = localStorage.getItem('finflow_access_token');
      if (!token) {
        setLoading(false);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          router.replace('/login');
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        if (res.data.user?.company?.id) {
          setSelectedCompanyId(res.data.user.company.id);
          localStorage.setItem('finflow_company_id', res.data.user.company.id);
        }
        if (res.data.user?.company?.activeFinancialYearId) {
          localStorage.setItem(
            'finflow_financial_year_id',
            res.data.user.company.activeFinancialYearId,
          );
        }
      } catch (err) {
        localStorage.removeItem('finflow_access_token');
        localStorage.removeItem('finflow_refresh_token');
        sessionStorage.removeItem('finflow_session_active');
        setUser(null);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  const login = (tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    sessionStorage.setItem('finflow_session_active', 'true');
    localStorage.setItem('finflow_access_token', tokens.accessToken);
    localStorage.setItem('finflow_refresh_token', tokens.refreshToken);
    setUser(userData);
    if (userData.company?.id) {
      setSelectedCompanyId(userData.company.id);
      localStorage.setItem('finflow_company_id', userData.company.id);
    }
    if (userData.company?.activeFinancialYearId) {
      localStorage.setItem(
        'finflow_financial_year_id',
        userData.company.activeFinancialYearId,
      );
    }
    router.push('/');
  };

  const logout = () => {
    sessionStorage.removeItem('finflow_session_active');
    localStorage.removeItem('finflow_access_token');
    localStorage.removeItem('finflow_refresh_token');
    localStorage.removeItem('finflow_company_id');
    localStorage.removeItem('finflow_financial_year_id');
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
