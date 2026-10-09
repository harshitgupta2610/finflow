'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Keyboard, X, Search, LayoutDashboard, ShoppingCart, ShoppingBag,
  Package, BookOpen, Receipt, Landmark, BarChart3, Users, Layers,
  ShieldCheck, Bot, Settings, Plus, FileText, CalendarDays, Zap,
} from 'lucide-react';

export interface Shortcut {
  keys: string;
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
  const [activeToast, setActiveToast] = useState<{ keys: string; label: string } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showShortcutFeedback = useCallback((keys: string, label: string) => {
    setActiveToast({ keys, label });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 1400);
  }, []);

  const navigateTo = useCallback((path: string, keys: string, label: string) => {
    showShortcutFeedback(keys, label);
    setShowPalette(false);
    router.push(path);
  }, [router, showShortcutFeedback]);

  // Core navigation shortcuts
  const coreShortcuts: Shortcut[] = [
    { keys: 'Alt+D', description: 'Go to Dashboard', category: 'Navigation', action: () => navigateTo('/', 'Alt+D', 'Dashboard'), icon: LayoutDashboard },
    { keys: 'Alt+0', description: 'Day Book Register', category: 'Modules', action: () => navigateTo('/daybook', 'Alt+0', 'Day Book'), icon: CalendarDays },
    { keys: 'Alt+1', description: 'Sales & Invoicing', category: 'Modules', action: () => navigateTo('/sales', 'Alt+1', 'Sales & Invoicing'), icon: ShoppingCart },
    { keys: 'Alt+2', description: 'Purchases Module', category: 'Modules', action: () => navigateTo('/purchases', 'Alt+2', 'Purchases'), icon: ShoppingBag },
    { keys: 'Alt+3', description: 'Inventory & Stock', category: 'Modules', action: () => navigateTo('/inventory', 'Alt+3', 'Inventory & Stock'), icon: Package },
    { keys: 'Alt+4', description: 'Double Entry Accounting', category: 'Modules', action: () => navigateTo('/accounting', 'Alt+4', 'Accounting & Ledgers'), icon: BookOpen },
    { keys: 'Alt+5', description: 'GST & E-Invoicing', category: 'Modules', action: () => navigateTo('/gst', 'Alt+5', 'GST & E-Invoicing'), icon: Receipt },
    { keys: 'Alt+6', description: 'Banking & BRS', category: 'Modules', action: () => navigateTo('/banking', 'Alt+6', 'Banking & Reconciliation'), icon: Landmark },
    { keys: 'Alt+7', description: 'Financial Reports', category: 'Modules', action: () => navigateTo('/reports', 'Alt+7', 'Financial Reports'), icon: BarChart3 },
    { keys: 'Alt+8', description: 'Party Master', category: 'Modules', action: () => navigateTo('/parties', 'Alt+8', 'Party Master'), icon: Users },
    { keys: 'Alt+9', description: 'Item Master', category: 'Modules', action: () => navigateTo('/items', 'Alt+9', 'Item Master'), icon: Layers },
    { keys: 'Alt+S', description: 'New Sales Invoice', category: 'Actions', action: () => navigateTo('/sales/new', 'Alt+S', 'New Sales Invoice'), icon: ShoppingCart },
    { keys: 'Alt+V', description: 'New Financial Voucher', category: 'Actions', action: () => navigateTo('/vouchers/new', 'Alt+V', 'New Voucher'), icon: FileText },
    { keys: 'Alt+P', description: 'New Purchase Bill', category: 'Actions', action: () => navigateTo('/purchases/new', 'Alt+P', 'New Purchase Bill'), icon: ShoppingBag },
    { keys: 'Alt+A', description: 'AI Business Advisor', category: 'Modules', action: () => navigateTo('/ai-assistant', 'Alt+A', 'AI Financial Advisor'), icon: Bot },
    { keys: 'Alt+L', description: 'Audit Logs', category: 'Modules', action: () => navigateTo('/audit-logs', 'Alt+L', 'Audit Logs'), icon: ShieldCheck },
    { keys: 'Alt+,', description: 'Settings', category: 'Navigation', action: () => navigateTo('/settings', 'Alt+,', 'Settings'), icon: Settings },
    { keys: 'Ctrl+K', description: 'Command Palette / Search', category: 'System', action: () => {}, icon: Search },
    { keys: '?', description: 'Show Keyboard Shortcuts Palette', category: 'System', action: () => setShowPalette(true), icon: Keyboard },
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
      const target = e.target as HTMLElement | null;
      const isInInput = !!(
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      );

      // Skip on login/register pages
      if (pathname === '/login' || pathname === '/register') return;

      // Escape to close palette
      if (e.key === 'Escape') {
        setShowPalette(false);
        setActiveToast(null);
        return;
      }

      // '?' key for palette — only when not typing inside an input
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey && !isInInput) {
        e.preventDefault();
        setShowPalette(prev => !prev);
        return;
      }

      // ─── ALT + KEY / NUMBER HANDLERS ──────────────────────────────
      // Note: Alt shortcuts work universally, even if focused in an input field!
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        // Detect number keys (top row digits and numpad digits)
        let numKey: string | null = null;
        if (e.code === 'Digit0' || e.code === 'Numpad0' || e.key === '0') numKey = '0';
        else if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') numKey = '1';
        else if (e.code === 'Digit2' || e.code === 'Numpad2' || e.key === '2') numKey = '2';
        else if (e.code === 'Digit3' || e.code === 'Numpad3' || e.key === '3') numKey = '3';
        else if (e.code === 'Digit4' || e.code === 'Numpad4' || e.key === '4') numKey = '4';
        else if (e.code === 'Digit5' || e.code === 'Numpad5' || e.key === '5') numKey = '5';
        else if (e.code === 'Digit6' || e.code === 'Numpad6' || e.key === '6') numKey = '6';
        else if (e.code === 'Digit7' || e.code === 'Numpad7' || e.key === '7') numKey = '7';
        else if (e.code === 'Digit8' || e.code === 'Numpad8' || e.key === '8') numKey = '8';
        else if (e.code === 'Digit9' || e.code === 'Numpad9' || e.key === '9') numKey = '9';

        if (numKey !== null) {
          e.preventDefault();
          e.stopPropagation();

          const numberRoutes: Record<string, { path: string; label: string }> = {
            '0': { path: '/daybook', label: 'Day Book Register' },
            '1': { path: '/sales', label: 'Sales & Invoicing' },
            '2': { path: '/purchases', label: 'Purchases' },
            '3': { path: '/inventory', label: 'Inventory & Stock' },
            '4': { path: '/accounting', label: 'Accounting & Ledgers' },
            '5': { path: '/gst', label: 'GST & E-Invoicing' },
            '6': { path: '/banking', label: 'Banking & Reconciliation' },
            '7': { path: '/reports', label: 'Financial Reports' },
            '8': { path: '/parties', label: 'Party Master' },
            '9': { path: '/items', label: 'Item Master' },
          };

          const targetRoute = numberRoutes[numKey];
          if (targetRoute) {
            navigateTo(targetRoute.path, `Alt+${numKey}`, targetRoute.label);
          }
          return;
        }

        // Detect letters (D, S, V, P, A, L, Comma)
        let letterKey: string | null = null;
        if (e.code === 'KeyD' || e.key.toLowerCase() === 'd') letterKey = 'D';
        else if (e.code === 'KeyS' || e.key.toLowerCase() === 's') letterKey = 'S';
        else if (e.code === 'KeyV' || e.key.toLowerCase() === 'v') letterKey = 'V';
        else if (e.code === 'KeyP' || e.key.toLowerCase() === 'p') letterKey = 'P';
        else if (e.code === 'KeyA' || e.key.toLowerCase() === 'a') letterKey = 'A';
        else if (e.code === 'KeyL' || e.key.toLowerCase() === 'l') letterKey = 'L';
        else if (e.code === 'Comma' || e.key === ',') letterKey = ',';

        if (letterKey !== null) {
          e.preventDefault();
          e.stopPropagation();

          const letterRoutes: Record<string, { path: string; label: string }> = {
            'D': { path: '/', label: 'Dashboard' },
            'S': { path: '/sales/new', label: 'New Sales Invoice' },
            'V': { path: '/vouchers/new', label: 'New Voucher' },
            'P': { path: '/purchases/new', label: 'New Purchase Bill' },
            'A': { path: '/ai-assistant', label: 'AI Financial Advisor' },
            'L': { path: '/audit-logs', label: 'Audit Logs' },
            ',': { path: '/settings', label: 'Settings' },
          };

          const targetRoute = letterRoutes[letterKey];
          if (targetRoute) {
            navigateTo(targetRoute.path, `Alt+${letterKey}`, targetRoute.label);
          }
          return;
        }
      }
    };

    // Use capture phase (true) so the window catches keys before child elements or browser menu bars
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [pathname, navigateTo]);

  return (
    <KeyboardShortcutContext.Provider
      value={{
        shortcuts: allShortcuts,
        registerShortcut,
        unregisterShortcut,
        showPalette,
        setShowPalette,
      }}
    >
      {children}

      {/* Floating Shortcut Triggered Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-3 fade-in duration-150 pointer-events-none">
          <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-brand-500/40 text-slate-100 shadow-2xl shadow-brand-500/20 backdrop-blur-md">
            <div className="h-6 w-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <span className="font-mono font-bold text-brand-400">{activeToast.keys}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="font-medium text-slate-200">{activeToast.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Shortcut Palette Modal */}
      {showPalette && (
        <ShortcutPalette
          shortcuts={allShortcuts}
          onClose={() => setShowPalette(false)}
        />
      )}
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

  const categories = ['Modules', 'Actions', 'Navigation', 'System'] as const;

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
              <h2 className="text-lg font-extrabold text-slate-100">Keyboard Shortcuts Palette</h2>
              <p className="text-[11px] text-slate-400">Press shortcut keys directly or click any item to navigate</p>
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
              placeholder="Search shortcuts (e.g. Daybook, Alt+0, Sales)..."
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
          <span className="font-mono text-brand-400">FinFlow Instant Keys Active</span>
        </div>
      </div>
    </div>
  );
}
