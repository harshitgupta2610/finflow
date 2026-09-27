'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import {
  Building2,
  Calendar,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';

export function Header() {
  const { user, logout, selectedCompanyId, selectedFinancialYear, setSelectedFinancialYear } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search & Breadcrumb */}
      <div className="flex items-center space-x-4 w-1/3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vouchers, invoices, parties, items... (Ctrl+K)"
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Selectors & User Info */}
      <div className="flex items-center space-x-4">
        {/* Company Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Building2 className="h-4 w-4 text-brand-400" />
          <span className="font-semibold text-slate-200">
            {user?.company?.displayName || 'FinFlow Demo Corp'}
          </span>
          <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded font-mono">
            {user?.organizationName || 'DEMO'}
          </span>
        </div>

        {/* Financial Year Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Calendar className="h-4 w-4 text-emerald-400" />
          <select
            value={selectedFinancialYear}
            onChange={(e) => setSelectedFinancialYear(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="FY 2024-25" className="bg-slate-900">FY 2024-25</option>
            <option value="FY 2023-24" className="bg-slate-900">FY 2023-24</option>
            <option value="FY 2025-26" className="bg-slate-900">FY 2025-26</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-brand-500 rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 h-2 w-2 bg-brand-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-200">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-slate-400 font-mono">
              {user?.roles?.[0] || 'SUPER_ADMIN'}
            </p>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
