'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  BookOpen,
  Receipt,
  Landmark,
  BarChart3,
  Users,
  Building2,
  Settings,
  ShieldCheck,
  Bot,
  Layers,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sales & Invoicing', href: '/sales', icon: ShoppingCart },
  { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
  { name: 'Inventory & Stock', href: '/inventory', icon: Package },
  { name: 'Double Entry Accounting', href: '/accounting', icon: BookOpen },
  { name: 'GST & E-Invoicing', href: '/gst', icon: Receipt },
  { name: 'Banking & Reconciliation', href: '/banking', icon: Landmark },
  { name: 'Financial Reports', href: '/reports', icon: BarChart3 },
  { name: 'Party Master', href: '/parties', icon: Users },
  { name: 'Item Master', href: '/items', icon: Layers },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
  { name: 'AI Business Advisor', href: '/ai-assistant', icon: Bot, badge: 'PRO' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-brand-500/20">
          FF
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-slate-100">
            Fin<span className="text-brand-400">Flow</span>
          </span>
          <span className="block text-[10px] text-slate-500 tracking-wider font-semibold uppercase">
            Cloud Accounting
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Prisma Engine</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
