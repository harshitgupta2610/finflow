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
  CalendarDays,
  Keyboard,
} from 'lucide-react';
import { useKeyboardShortcuts } from '../lib/keyboard-shortcuts';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, shortcut: 'Alt+D' },
  { name: 'Day Book', href: '/daybook', icon: CalendarDays, shortcut: 'Alt+B' },
  { name: 'Sales & Invoicing', href: '/sales', icon: ShoppingCart, shortcut: 'Alt+S' },
  { name: 'Purchases', href: '/purchases', icon: ShoppingBag, shortcut: 'Alt+P' },
  { name: 'Inventory & Stock', href: '/inventory', icon: Package, shortcut: 'Alt+I' },
  { name: 'Double Entry Accounting', href: '/accounting', icon: BookOpen, shortcut: 'Alt+A' },
  { name: 'GST & E-Invoicing', href: '/gst', icon: Receipt, shortcut: 'Alt+G' },
  { name: 'Banking & Reconciliation', href: '/banking', icon: Landmark, shortcut: 'Alt+K' },
  { name: 'Financial Reports', href: '/reports', icon: BarChart3, shortcut: 'Alt+R' },
  { name: 'Party Master', href: '/parties', icon: Users, shortcut: 'Alt+M' },
  { name: 'Item Master', href: '/items', icon: Layers, shortcut: 'Alt+T' },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck, shortcut: 'Alt+L' },
  { name: 'AI Business Advisor', href: '/ai-assistant', icon: Bot, badge: 'PRO', shortcut: 'Alt+C' },
  { name: 'Settings', href: '/settings', icon: Settings, shortcut: 'Alt+O' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { setShowPalette } = useKeyboardShortcuts();

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
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={`${item.name} (${item.shortcut})`}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.badge}
                  </span>
                )}
                {item.shortcut && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'bg-white/10 text-white/80' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.shortcut}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] space-y-2">
        <button
          onClick={() => setShowPalette(true)}
          title="Open Keyboard Shortcuts Directory (? or F1)"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 text-[11px] text-slate-300 hover:text-white transition-all group shadow-sm"
        >
          <span className="flex items-center space-x-2">
            <Keyboard className="h-3.5 w-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-xs">Shortcuts Palette</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 group-hover:border-brand-500/50 group-hover:text-brand-300">
            ?
          </kbd>
        </button>

        <div className="flex items-center justify-between text-slate-400 px-1 pt-0.5">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px]">Prisma Engine</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
