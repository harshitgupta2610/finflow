'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { SalesTrendChart } from '../components/SalesTrendChart';
import { ReceivablesChart } from '../components/ReceivablesChart';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { OverdueInvoicesWidget } from '../components/OverdueInvoicesWidget';
import { LowStockWidget } from '../components/LowStockWidget';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSessionActive = sessionStorage.getItem('finflow_session_active');
      const token = localStorage.getItem('finflow_access_token');
      if (!isSessionActive || !token) {
        router.replace('/login');
        return;
      }
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      router.replace('/login');
    }
  }, [loading, user, router]);


  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-500/30 animate-pulse">
          FF
        </div>
        <div className="text-xs text-slate-400">Verifying FinFlow session...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Top Banner & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950 p-6 rounded-2xl border border-slate-800 glass-card">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  SYSTEM ONLINE
                </span>
                <span className="text-xs text-slate-400">• Double-Entry Audited</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-100 mt-1 tracking-tight">
                FinFlow Financial Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time financial health, cashflow performance, GST liability, and inventory valuation.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/sales/new"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Sales Invoice (Alt+S)</span>
              </Link>
              <Link
                href="/vouchers/new"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <Plus className="h-4 w-4" />
                <span>New Voucher (Alt+V)</span>
              </Link>
            </div>
          </div>

          {/* 1. KPI Metrics */}
          <DashboardMetrics />

          {/* 2. Main Financial Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesTrendChart />
            <ReceivablesChart />
          </div>

          {/* 3. Action Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentTransactionsWidget />
            <OverdueInvoicesWidget />
            <LowStockWidget />
          </div>
        </main>
      </div>
    </div>
  );
}
