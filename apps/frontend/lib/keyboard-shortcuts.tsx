'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Keyboard, X, Search, LayoutDashboard, ShoppingCart, ShoppingBag,
  Package, BookOpen, Receipt, Landmark, BarChart3, Users, Layers,
  ShieldCheck, Bot, Settings, Plus, FileText, CalendarDays,
} from 'lucide-react';

export interface Shortcut {
  keys: string;           // Display string e.g. "Alt+S"
  description: string;
  category: 'Navigation' | 'Actions' | 'Modules' | 'System';
  action: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface KeyboardShortcutContextType {
  shortcuts: Shortcut[];
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (keys: string) => void;
  showPalette: boolean;
  setShowPalette: (v: boolean) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showPalette, setShowPalette] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<Shortcut[]>([]);

  // Core navigation shortcuts
  const coreShortcuts: Shortcut[] = [
    { keys: 'Alt+D', description: 'Go to Dashboard', category: 'Navigation', action: () => router.push('/'), icon: LayoutDashboard },
    { keys: 'Alt+S', description: 'New Sales Invoice', category: 'Actions', action: () => router.push('/sales/new'), icon: ShoppingCart },
    { keys: 'Alt+V', description: 'New Financial Voucher', category: 'Actions', action: () => router.push('/vouchers/new'), icon: FileText },
    { keys: 'Alt+P', description: 'New Purchase Bill', category: 'Actions', action: () => router.push('/purchases/new'), icon: ShoppingBag },
    { keys: 'Alt+1', description: 'Sales & Invoicing', category: 'Modules', action: () => router.push('/sales'), icon: ShoppingCart },
    { keys: 'Alt+2', description: 'Purchases Module', category: 'Modules', action: () => router.push('/purchases'), icon: ShoppingBag },
    { keys: 'Alt+3', description: 'Inventory & Stock', category: 'Modules', action: () => router.push('/inventory'), icon: Package },
    { keys: 'Alt+4', description: 'Double Entry Accounting', category: 'Modules', action: () => router.push('/accounting'), icon: BookOpen },
    { keys: 'Alt+5', description: 'GST & E-Invoicing', category: 'Modules', action: () => router.push('/gst'), icon: Receipt },
    { keys: 'Alt+6', description: 'Banking & BRS', category: 'Modules', action: () => router.push('/banking'), icon: Landmark },
    { keys: 'Alt+7', description: 'Financial Reports', category: 'Modules', action: () => router.push('/reports'), icon: BarChart3 },
    { keys: 'Alt+8', description: 'Party Master', category: 'Modules', action: () => router.push('/parties'), icon: Users },
    { keys: 'Alt+9', description: 'Item Master', category: 'Modules', action: () => router.push('/items'), icon: Layers },
    { keys: 'Alt+0', description: 'Daybook', category: 'Modules', action: () => router.push('/daybook'), icon: CalendarDays },
    { keys: 'Alt+A', description: 'AI Business Advisor', category: 'Modules', action: () => router.push('/ai-assistant'), icon: Bot },
    { keys: 'Alt+L', description: 'Audit Logs', category: 'Modules', action: () => router.push('/audit-logs'), icon: ShieldCheck },
    { keys: 'Alt+,', description: 'Settings', category: 'Navigation', action: () => router.push('/settings'), icon: Settings },
    { keys: 'Ctrl+K', description: 'Global Search / Command Palette', category: 'System', action: () => {}, icon: Search },
    { keys: '?', description: 'Show Keyboard Shortcuts', category: 'System', action: () => setShowPalette(true), icon: Keyboard },
    { keys: 'Escape', description: 'Close Dialogs / Modals', category: 'System', action: () => setShowPalette(false), icon: X },
  ];

  const allShortcuts = [...coreShortcuts, ...customShortcuts];

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setCustomShortcuts(prev => {
      const filtered = prev.filter(s => s.keys !== shortcut.keys);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((keys: string) => {
    setCustomShortcuts(prev => prev.filter(s => s.keys !== keys));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        // Only allow Escape in inputs
        if (e.key === 'Escape') {
          setShowPalette(false);
        }
        return;
      }

      // Skip if on login/register pages
      if (pathname === '/login' || pathname === '/register') return;

      // "?" key for shortcut palette
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowPalette(prev => !prev);
        return;
      }

      // Escape to close palette
      if (e.key === 'Escape') {
        setShowPalette(false);
        return;
      }

      // Alt+key shortcuts
      if (e.altKey) {
        const key = e.key.toLowerCase();
        const altKey = `Alt+${e.key.length === 1 ? e.key.toUpperCase() : e.key}`;
        const shortcut = allShortcuts.find(s => s.keys === altKey);
        if (shortcut) {
          e.preventDefault();
          shortcut.action();
          setShowPalette(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, allShortcuts]);

  return (
    <KeyboardShortcutContext.Provider value={{ shortcuts: allShortcuts, registerShortcut, unregisterShortcut, showPalette, setShowPalette }}>
      {children}
      {showPalette && <ShortcutPalette shortcuts={allShortcuts} onClose={() => setShowPalette(false)} />}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutProvider');
  return context;
}

// ─── Shortcut Palette Modal ───────────────────────────────────
function ShortcutPalette({ shortcuts, onClose }: { shortcuts: Shortcut[]; onClose: () => void }) {
  const [filter, setFilter] = useState('');

  const categories = ['Actions', 'Navigation', 'Modules', 'System'] as const;

  const filtered = shortcuts.filter(s =>
    s.description.toLowerCase().includes(filter.toLowerCase()) ||
    s.keys.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-brand-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-brand-950/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Keyboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-slate-400">Power-user navigation — press any shortcut to execute</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter shortcuts..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {categories.map(cat => {
            const items = filtered.filter(s => s.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">{cat}</h3>
                <div className="space-y-1">
                  {items.map(shortcut => {
                    const Icon = shortcut.icon;
                    return (
                      <button
                        key={shortcut.keys}
                        onClick={() => { shortcut.action(); onClose(); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/70 transition-all group text-left"
                      >
                        <div className="flex items-center space-x-3">
                          {Icon && <Icon className="h-4 w-4 text-slate-500 group-hover:text-brand-400 transition-colors" />}
                          <span className="text-xs text-slate-200 group-hover:text-white font-medium">{shortcut.description}</span>
                        </div>
                        <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 group-hover:bg-brand-600/20 group-hover:text-brand-300 group-hover:border-brand-500/30 transition-all">
                          {shortcut.keys}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1 bg-slate-800 rounded text-slate-300">?</kbd> to toggle • <kbd className="px-1 bg-slate-800 rounded text-slate-300">Esc</kbd> to close</span>
          <span className="font-mono">FinFlow Power User Mode</span>
        </div>
      </div>
    </div>
  );
}
