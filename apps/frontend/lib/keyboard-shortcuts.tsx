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
    { keys: 'Alt+D', description: 'Dashboard Overview', category: 'Navigation', action: () => navigateTo('/', 'Alt+D', 'Dashboard'), icon: LayoutDashboard },
    { keys: 'Alt+B', description: 'Day Book Register', category: 'Modules', action: () => navigateTo('/daybook', 'Alt+B', 'Day Book'), icon: CalendarDays },
    { keys: 'Alt+S', description: 'Sales & Invoicing', category: 'Modules', action: () => navigateTo('/sales', 'Alt+S', 'Sales & Invoicing'), icon: ShoppingCart },
    { keys: 'Alt+P', description: 'Purchases Module', category: 'Modules', action: () => navigateTo('/purchases', 'Alt+P', 'Purchases'), icon: ShoppingBag },
    { keys: 'Alt+I', description: 'Inventory & Stock Valuation', category: 'Modules', action: () => navigateTo('/inventory', 'Alt+I', 'Inventory & Stock'), icon: Package },
    { keys: 'Alt+A', description: 'Double Entry Accounting', category: 'Modules', action: () => navigateTo('/accounting', 'Alt+A', 'Accounting & Ledgers'), icon: BookOpen },
    { keys: 'Alt+G', description: 'GST & E-Invoicing Portal', category: 'Modules', action: () => navigateTo('/gst', 'Alt+G', 'GST & E-Invoicing'), icon: Receipt },
    { keys: 'Alt+K', description: 'Banking & Reconciliation', category: 'Modules', action: () => navigateTo('/banking', 'Alt+K', 'Banking & Reconciliation'), icon: Landmark },
    { keys: 'Alt+R', description: 'Financial Reports & P&L', category: 'Modules', action: () => navigateTo('/reports', 'Alt+R', 'Financial Reports'), icon: BarChart3 },
    { keys: 'Alt+M', description: 'Party Master (Customers/Suppliers)', category: 'Modules', action: () => navigateTo('/parties', 'Alt+M', 'Party Master'), icon: Users },
    { keys: 'Alt+T', description: 'Item Master Catalog', category: 'Modules', action: () => navigateTo('/items', 'Alt+T', 'Item Master'), icon: Layers },
    { keys: 'Alt+C', description: 'AI Financial Advisor & CFO Agent', category: 'Modules', action: () => navigateTo('/ai-assistant', 'Alt+C', 'AI Financial Advisor'), icon: Bot },
    { keys: 'Alt+L', description: 'Audit Trail Logs', category: 'Modules', action: () => navigateTo('/audit-logs', 'Alt+L', 'Audit Logs'), icon: ShieldCheck },
    { keys: 'Alt+O', description: 'Settings & Configuration', category: 'Navigation', action: () => navigateTo('/settings', 'Alt+O', 'Settings'), icon: Settings },
    { keys: 'Alt+N', description: 'New Sales Invoice', category: 'Actions', action: () => navigateTo('/sales/new', 'Alt+N', 'New Sales Invoice'), icon: ShoppingCart },
    { keys: 'Alt+V', description: 'New Financial Voucher', category: 'Actions', action: () => navigateTo('/vouchers/new', 'Alt+V', 'New Voucher'), icon: FileText },
    { keys: 'Alt+E', description: 'New Purchase Bill', category: 'Actions', action: () => navigateTo('/purchases/new', 'Alt+E', 'New Purchase Bill'), icon: ShoppingBag },
    {
      keys: 'Ctrl+K',
      description: 'Global Search / Command Palette',
      category: 'System',
      action: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        }
      },
      icon: Search,
    },
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

      // '?' key or F1 for palette — works reliably across keyboard layouts
      const isQuestionShortcut =
        e.key === '?' || (e.shiftKey && (e.code === 'Slash' || e.key === '/')) || e.key === 'F1';

      if (isQuestionShortcut && !e.ctrlKey && !e.altKey && !e.metaKey && !isInInput) {
        e.preventDefault();
        setShowPalette(prev => !prev);
        return;
      }

      // ─── ALT + ALPHABET KEY HANDLERS ──────────────────────────────
      // Note: Alt shortcuts work universally across the app, even if focused in an input field!
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        let letterKey: string | null = null;
        const code = e.code;
        const key = e.key.toLowerCase();

        if (code === 'KeyD' || key === 'd') letterKey = 'D';
        else if (code === 'KeyB' || key === 'b') letterKey = 'B';
        else if (code === 'KeyS' || key === 's') letterKey = 'S';
        else if (code === 'KeyP' || key === 'p') letterKey = 'P';
        else if (code === 'KeyI' || key === 'i') letterKey = 'I';
        else if (code === 'KeyA' || key === 'a') letterKey = 'A';
        else if (code === 'KeyG' || key === 'g') letterKey = 'G';
        else if (code === 'KeyK' || key === 'k') letterKey = 'K';
        else if (code === 'KeyR' || key === 'r') letterKey = 'R';
        else if (code === 'KeyM' || key === 'm') letterKey = 'M';
        else if (code === 'KeyT' || key === 't') letterKey = 'T';
        else if (code === 'KeyC' || key === 'c') letterKey = 'C';
        else if (code === 'KeyL' || key === 'l') letterKey = 'L';
        else if (code === 'KeyO' || key === 'o') letterKey = 'O';
        else if (code === 'KeyN' || key === 'n') letterKey = 'N';
        else if (code === 'KeyV' || key === 'v') letterKey = 'V';
        else if (code === 'KeyE' || key === 'e') letterKey = 'E';

        if (letterKey !== null) {
          e.preventDefault();
          e.stopPropagation();

          const alphabetRoutes: Record<string, { path: string; label: string }> = {
            'D': { path: '/', label: 'Dashboard Overview' },
            'B': { path: '/daybook', label: 'Day Book Register' },
            'S': { path: '/sales', label: 'Sales & Invoicing' },
            'P': { path: '/purchases', label: 'Purchases Module' },
            'I': { path: '/inventory', label: 'Inventory & Stock Valuation' },
            'A': { path: '/accounting', label: 'Double Entry Accounting' },
            'G': { path: '/gst', label: 'GST & E-Invoicing Portal' },
            'K': { path: '/banking', label: 'Banking & Reconciliation' },
            'R': { path: '/reports', label: 'Financial Reports & P&L' },
            'M': { path: '/parties', label: 'Party Master' },
            'T': { path: '/items', label: 'Item Master Catalog' },
            'C': { path: '/ai-assistant', label: 'AI Financial Advisor' },
            'L': { path: '/audit-logs', label: 'Audit Trail Logs' },
            'O': { path: '/settings', label: 'Settings & Configuration' },
            'N': { path: '/sales/new', label: 'New Sales Invoice' },
            'V': { path: '/vouchers/new', label: 'New Voucher' },
            'E': { path: '/purchases/new', label: 'New Purchase Bill' },
          };

          const targetRoute = alphabetRoutes[letterKey];
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

// ─── Keycap Renderer Helper ──────────────────────────────────
function renderKeycaps(keys: string) {
  if (keys.includes('+')) {
    const parts = keys.split('+');
    return (
      <div className="flex items-center space-x-1 shrink-0">
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            <kbd className="px-1.5 py-0.5 min-w-[20px] text-center rounded bg-slate-800/90 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-200 shadow-sm shadow-black/40 group-hover:bg-brand-500/20 group-hover:border-brand-500/40 group-hover:text-brand-300 transition-colors">
              {p.trim()}
            </kbd>
            {idx < parts.length - 1 && (
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-400 select-none">
                +
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <kbd className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-200 shadow-sm shadow-black/40 group-hover:bg-brand-500/20 group-hover:border-brand-500/40 group-hover:text-brand-300 transition-colors">
      {keys}
    </kbd>
  );
}

// ─── Shortcut Palette Modal ───────────────────────────────────
function ShortcutPalette({ shortcuts, onClose }: { shortcuts: Shortcut[]; onClose: () => void }) {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Modules' | 'Actions' | 'Navigation' | 'System'>('ALL');

  // Lock body scroll when modal is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const categories = ['ALL', 'Modules', 'Actions', 'Navigation', 'System'] as const;

  const filtered = shortcuts.filter(s => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const q = filter.trim().toLowerCase();
    if (!q) return matchesCategory;
    const matchesQuery =
      s.description.toLowerCase().includes(q) ||
      s.keys.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const getCategoryCount = (cat: typeof categories[number]) => {
    if (cat === 'ALL') return shortcuts.length;
    return shortcuts.filter(s => s.category === cat).length;
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Modules':
        return { badge: 'bg-brand-500/10 text-brand-300 border-brand-500/20', iconBg: 'bg-brand-500/15 text-brand-400' };
      case 'Actions':
        return { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', iconBg: 'bg-emerald-500/15 text-emerald-400' };
      case 'Navigation':
        return { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', iconBg: 'bg-amber-500/15 text-amber-400' };
      default:
        return { badge: 'bg-slate-700/40 text-slate-300 border-slate-700/60', iconBg: 'bg-slate-800 text-slate-400' };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl shadow-brand-500/10 ring-1 ring-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/30 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/30">
              <Keyboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
                  Keyboard Shortcuts Directory
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                  Instant Keys
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Press any combination directly or click to navigate instantly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts palette"
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors border border-transparent hover:border-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search shortcuts by name, key, or function (e.g. Day Book, Alt+B, Sales)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => {
              const count = getCategoryCount(cat);
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium text-[11px] transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <span>{cat === 'ALL' ? 'All Shortcuts' : cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shortcuts Body (Responsive 2-Column Grid) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-200">No shortcuts found for &quot;{filter}&quot;</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try searching by module name like &quot;Sales&quot;, &quot;Day Book&quot;, or key combination like &quot;Alt+B&quot;
              </p>
              <button
                onClick={() => {
                  setFilter('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filtered.map((shortcut) => {
                const Icon = shortcut.icon;
                const theme = getCategoryTheme(shortcut.category);
                return (
                  <button
                    key={shortcut.keys}
                    onClick={() => {
                      shortcut.action();
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-brand-500/40 transition-all group text-left shadow-sm"
                  >
                    <div className="flex items-center space-x-3 min-w-0 mr-2">
                      <div className={`h-8 w-8 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                        {Icon ? <Icon className="h-4 w-4" /> : <Keyboard className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                            {shortcut.description}
                          </span>
                        </div>
                        <span className={`inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded border ${theme.badge}`}>
                          {shortcut.category}
                        </span>
                      </div>
                    </div>

                    {renderKeycaps(shortcut.keys)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">?</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">F1</kbd> to toggle</span>
            <span className="text-slate-600">•</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Esc</kbd> to close</span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[10px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FinFlow Instant Key Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
