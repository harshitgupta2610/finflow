'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { api, getActiveCompanyId } from '../lib/api';
import {
  Building2,
  Calendar,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
  ArrowRight,
  Package,
  Users,
  FileText,
  BookOpen,
  Receipt,
  X,
  Bot,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, logout, selectedCompanyId, selectedFinancialYear, setSelectedFinancialYear } =
    useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Shortcut Ctrl+K to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch search data when search opens
  useEffect(() => {
    if (isOpen) {
      loadSearchData();
    }
  }, [isOpen]);

  const loadSearchData = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const [pRes, iRes] = await Promise.all([
        api.get('/parties', { params: { companyId } }).catch(() => ({ data: [] })),
        api.get('/items', { params: { companyId } }).catch(() => ({ data: [] })),
      ]);

      setParties(pRes.data || []);
      setItems(iRes.data || []);
    } catch (err) {
      console.error('Failed to load search index', err);
    } finally {
      setLoading(false);
    }
  };

  const quickNavigations = [
    { title: 'New Sales Invoice (Alt+N)', href: '/sales/new', category: 'Actions', icon: Receipt },
    { title: 'New Financial Voucher (Alt+V)', href: '/vouchers/new', category: 'Actions', icon: FileText },
    { title: 'New Purchase Bill (Alt+E)', href: '/purchases/new', category: 'Actions', icon: Receipt },
    { title: 'Day Book Register (Alt+B)', href: '/daybook', category: 'Navigation', icon: BookOpen },
    { title: 'Sales & Invoicing Module (Alt+S)', href: '/sales', category: 'Navigation', icon: Receipt },
    { title: 'Purchases Module (Alt+P)', href: '/purchases', category: 'Navigation', icon: Receipt },
    { title: 'Inventory & Stock Valuation (Alt+I)', href: '/inventory', category: 'Navigation', icon: Package },
    { title: 'Double Entry Accounting (Alt+A)', href: '/accounting', category: 'Navigation', icon: BookOpen },
    { title: 'GST & E-Invoicing Hub (Alt+G)', href: '/gst', category: 'Navigation', icon: Receipt },
    { title: 'Banking & Reconciliation (Alt+K)', href: '/banking', category: 'Navigation', icon: Building2 },
    { title: 'Financial Reports (Alt+R)', href: '/reports', category: 'Navigation', icon: FileText },
    { title: 'Party Master (Alt+M)', href: '/parties', category: 'Navigation', icon: Users },
    { title: 'Item Master Catalog (Alt+T)', href: '/items', category: 'Navigation', icon: Package },
    { title: 'AI Financial Advisor (Alt+C)', href: '/ai-assistant', category: 'Navigation', icon: Bot },
    { title: 'Audit Trail Logs (Alt+L)', href: '/audit-logs', category: 'Navigation', icon: ShieldCheck },
    { title: 'Settings (Alt+O)', href: '/settings', category: 'Navigation', icon: Settings },
  ];

  const filteredNavs = quickNavigations.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredParties = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.gstin && p.gstin.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.code && i.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (i.hsnCode && i.hsnCode.includes(searchQuery)),
  );

  const handleSelectRoute = (href: string) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Search & Breadcrumb */}
        <div className="flex items-center space-x-4 w-1/3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              readOnly
              onClick={() => setIsOpen(true)}
              placeholder="Search vouchers, invoices, parties, items... (Ctrl+K)"
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            />
            <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Selectors & User Info */}
        <div className="flex items-center space-x-4">
          {/* Company Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Building2 className="h-4 w-4 text-brand-400" />
            <span className="font-semibold text-slate-200">
              {user?.company?.displayName || 'FinFlow Enterprise Ltd'}
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
              <option value="FY 2026-27" className="bg-slate-900">
                FY 2026-27
              </option>
              <option value="FY 2025-26" className="bg-slate-900">
                FY 2025-26
              </option>
              <option value="FY 2024-25" className="bg-slate-900">
                FY 2024-25
              </option>
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
              <p className="font-semibold text-slate-200">
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {user?.roles?.[0] || 'OWNER'}
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

      {/* Global Search & Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Input Header */}
            <div className="relative p-4 border-b border-slate-800 bg-slate-950/60 flex items-center">
              <Search className="h-5 w-5 text-brand-400 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search vouchers, parties, items, or jump to a module..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Actions & Pages */}
              {filteredNavs.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Quick Navigation & Actions
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredNavs.slice(0, 6).map((nav, idx) => {
                      const Icon = nav.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectRoute(nav.href)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-slate-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className="h-4 w-4 text-brand-400" />
                            <span className="font-medium">{nav.title}</span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parties */}
              {filteredParties.length > 0 && (
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Customer & Supplier Parties ({filteredParties.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredParties.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectRoute('/parties')}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Users className="h-4 w-4 text-emerald-400" />
                          <div>
                            <span className="font-bold text-slate-100">{p.name}</span>
                            {p.gstin && (
                              <span className="block text-[10px] font-mono text-slate-400">
                                GSTIN: {p.gstin}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {p.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              {filteredItems.length > 0 && (
                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Item Master Catalog ({filteredItems.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRoute('/items')}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-slate-200 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2.5">
                          <Package className="h-4 w-4 text-indigo-400" />
                          <div>
                            <span className="font-bold text-slate-100">{item.name}</span>
                            <span className="block text-[10px] font-mono text-slate-400">
                              SKU: {item.code} • Rate: ₹{Number(item.sellingPrice || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Stock: {Number(item.openingStock || 0)} {item.unit || 'PCS'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredNavs.length === 0 &&
                filteredParties.length === 0 &&
                filteredItems.length === 0 && (
                  <div className="py-8 text-center text-slate-500">
                    No results found for "{searchQuery}".
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Press <kbd className="px-1 bg-slate-800 rounded text-slate-300">Esc</kbd> to close</span>
              <span>FinFlow Universal Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
