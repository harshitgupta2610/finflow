'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  BookOpen,
  Plus,
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

export default function ChartOfAccountsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    accountGroupId: '',
    openingBalance: '0',
    openingBalanceType: 'DEBIT',
  });

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const [groupRes, accRes] = await Promise.all([
        api.get('/accounts/groups', { params: { companyId } }).catch(() => ({ data: [] })),
        api.get('/accounts', { params: { companyId } }).catch(() => ({ data: [] })),
      ]);

      setGroups(groupRes.data || []);
      setAccounts(accRes.data || []);

      if (groupRes.data && groupRes.data.length > 0 && !formData.accountGroupId) {
        setFormData((prev) => ({ ...prev, accountGroupId: groupRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load chart of accounts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.accountGroupId) {
      setError('Please provide a ledger name and select an account group');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const companyId = await getActiveCompanyId();

      await api.post('/accounts', {
        companyId,
        accountGroupId: formData.accountGroupId,
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        openingBalanceType: formData.openingBalanceType,
      });

      setShowModal(false);
      setFormData({
        name: '',
        code: '',
        accountGroupId: groups[0]?.id || '',
        openingBalance: '0',
        openingBalanceType: 'DEBIT',
      });
      await fetchTree();
    } catch (err: any) {
      console.error('Failed to create ledger account', err);
      setError(err.response?.data?.message || 'Failed to create ledger account');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

  // Flattened ledgers for display or hierarchical group matching
  const filteredGroups = groups.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()) ||
      (g.accounts &&
        g.accounts.some(
          (a: any) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.code.toLowerCase().includes(search.toLowerCase()),
        ));
    return matchesCategory && (search ? matchesSearch : true);
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-brand-400" />
                <h1 className="text-xl font-extrabold text-slate-100">Hierarchical Chart of Accounts</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited general ledger accounts, master groups, opening balances, and double-entry classifications.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchTree}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Ledger Account</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search ledgers or codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Account Tree View */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
              Loading Chart of Accounts from database...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
              No account groups or ledgers found. Click "New Ledger Account" to register one.
            </div>
          ) : (
            <div className="space-y-4">
              {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']
                .filter((cat) => selectedCategory === 'ALL' || cat === selectedCategory)
                .map((cat) => {
                  const catGroups = filteredGroups.filter((g) => g.category === cat);
                  if (catGroups.length === 0) return null;

                  return (
                    <div
                      key={cat}
                      className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4"
                    >
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            cat === 'ASSET'
                              ? 'bg-emerald-500'
                              : cat === 'LIABILITY'
                              ? 'bg-rose-500'
                              : cat === 'INCOME'
                              ? 'bg-brand-500'
                              : cat === 'EXPENSE'
                              ? 'bg-amber-500'
                              : 'bg-purple-500'
                          }`}
                        />
                        <h3 className="text-sm font-extrabold text-slate-100 tracking-wide uppercase">
                          {cat} CLASSIFICATION
                        </h3>
                      </div>

                      <div className="space-y-4 pl-2">
                        {catGroups.map((group) => {
                          const groupAccounts = group.accounts || [];

                          return (
                            <div key={group.id || group.code} className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                                <div className="flex items-center space-x-2">
                                  <FolderTree className="h-4 w-4 text-brand-400" />
                                  <span>{group.name}</span>
                                  <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                    {group.code}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {groupAccounts.length} Ledgers
                                </span>
                              </div>

                              <div className="pl-6 space-y-1.5 border-l border-slate-800/80">
                                {groupAccounts.length === 0 ? (
                                  <div className="text-[11px] text-slate-500 py-1 italic">
                                    No ledgers in this group.
                                  </div>
                                ) : (
                                  groupAccounts.map((acc: any) => (
                                    <div
                                      key={acc.id || acc.code}
                                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors text-xs"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <Layers className="h-3.5 w-3.5 text-brand-400/70" />
                                        <div>
                                          <span className="font-semibold text-slate-200">
                                            {acc.name}
                                          </span>
                                          <span className="ml-2 font-mono text-[10px] text-slate-500">
                                            {acc.code}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <span className="font-mono font-bold text-slate-100">
                                          ₹{Number(acc.openingBalance || 0).toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                          })}
                                        </span>
                                        <span
                                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                            acc.openingBalanceType === 'DEBIT'
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                          }`}
                                        >
                                          {acc.openingBalanceType || 'DEBIT'}
                                        </span>
                                        <Link
                                          href={`/reports?accountId=${acc.id}`}
                                          className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold underline ml-2"
                                        >
                                          Statement
                                        </Link>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </main>
      </div>

      {/* New Ledger Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-brand-400" />
                <h3 className="font-bold text-sm text-slate-100">New Ledger Account</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ledger Account Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kotak Mahindra Operating Current A/c"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Group <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.accountGroupId}
                  onChange={(e) => setFormData({ ...formData, accountGroupId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Select Master Account Group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.category} - {g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ledger Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. BANK_KOTAK_01"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Auto-generated if left blank
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Balance Classification
                  </label>
                  <select
                    value={formData.openingBalanceType}
                    onChange={(e) => setFormData({ ...formData, openingBalanceType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="DEBIT">Debit (Dr) - Assets & Expenses</option>
                    <option value="CREDIT">Credit (Cr) - Liabilities & Incomes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Creating Ledger...' : 'Save Ledger Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
