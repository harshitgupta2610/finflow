'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../../../components/Header';
import { Sidebar } from '../../../components/Sidebar';
import { api, getActiveCompanyId, getActiveFinancialYearId } from '../../../lib/api';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

export default function NewVoucherPage() {
  const router = useRouter();
  const [voucherType, setVoucherType] = useState('JOURNAL');
  const [voucherNumber, setVoucherNumber] = useState(`VOUCH-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [accounts, setAccounts] = useState<any[]>([]);
  const [financialYearId, setFinancialYearId] = useState<string>('');

  const [lines, setLines] = useState<Array<{ accountId: string; debit: string; credit: string }>>([
    { accountId: '', debit: '0.00', credit: '0.00' },
    { accountId: '', debit: '0.00', credit: '0.00' },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Keyboard shortcut listener (Ctrl+Enter to post voucher, Alt+R to add row)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePostVoucher();
      }
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        addLine();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lines, isBalanced, voucherType, voucherNumber, date, narration, financialYearId]);

  const fetchMasterData = async () => {
    try {
      setInitialLoading(true);
      const companyId = await getActiveCompanyId();
      const fyId = await getActiveFinancialYearId(companyId);
      if (fyId) {
        setFinancialYearId(fyId);
      }

      // Fetch chart of accounts
      let accRes = await api.get('/accounts', { params: { companyId } });
      let loadedAccounts = accRes.data || [];

      // If company has no accounts yet, seed defaults
      if (loadedAccounts.length === 0) {
        await api.post('/accounts/seed-defaults', { companyId }).catch(() => null);
        const retryRes = await api.get('/accounts', { params: { companyId } });
        loadedAccounts = retryRes.data || [];
      }

      setAccounts(loadedAccounts);

      // Pre-populate with first two accounts
      if (loadedAccounts.length >= 2) {
        setLines([
          { accountId: loadedAccounts[0].id, debit: '1000.00', credit: '0.00' },
          { accountId: loadedAccounts[1].id, debit: '0.00', credit: '1000.00' },
        ]);
      }
    } catch (err) {
      console.error('Failed to load voucher master data', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const addLine = () => {
    const defaultAccId = accounts.length > 0 ? accounts[0].id : '';
    setLines([...lines, { accountId: defaultAccId, debit: '0.00', credit: '0.00' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: 'accountId' | 'debit' | 'credit', value: string) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const handlePostVoucher = async () => {
    if (!isBalanced) {
      setErrorMessage('Total debits must equal total credits and be greater than 0.');
      return;
    }

    const companyId = await getActiveCompanyId();
    const effectiveFyId = financialYearId || (await getActiveFinancialYearId(companyId));
    if (!effectiveFyId) {
      setErrorMessage('Active financial year not found. Please verify company financial year.');
      return;
    }

    if (lines.some((l) => !l.accountId)) {
      setErrorMessage('Please select a valid account ledger for all lines.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        companyId,
        financialYearId,
        voucherType,
        voucherNumber,
        date,
        narration: narration || `Voucher ${voucherNumber} (${voucherType})`,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
      };

      await api.post('/vouchers', payload);
      setSuccessMessage(`Voucher ${voucherNumber} successfully posted and audited in Neon DB!`);
      setTimeout(() => {
        router.push('/vouchers');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to post voucher', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to post voucher. Please check balances and accounts.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (isBalanced && !loading) {
          handlePostVoucher();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBalanced, loading, lines, voucherType, voucherNumber, date, narration, financialYearId]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/vouchers"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-brand-400" />
                  <h1 className="text-xl font-extrabold text-slate-100">
                    Keyboard-Friendly Voucher Entry
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Post transactionally balanced double-entry vouchers with real-time debit/credit validation.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePostVoucher}
                disabled={!isBalanced || loading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Posting Voucher...' : 'Post & Approve Voucher (Ctrl+Enter)'}</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage('')} className="text-slate-400 hover:text-slate-200">
                Dismiss
              </button>
            </div>
          )}

          {/* Form Meta */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Voucher Type *</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="JOURNAL">Journal Voucher</option>
                <option value="SALES">Sales Voucher</option>
                <option value="PURCHASE">Purchase Voucher</option>
                <option value="RECEIPT">Receipt Voucher</option>
                <option value="PAYMENT">Payment Voucher</option>
                <option value="CONTRA">Contra (Bank / Cash)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Voucher Number *</label>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Transaction Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Financial Year</label>
              <div className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-300 font-mono font-semibold">
                {financialYearId ? 'Active Period Set' : 'Loading FY...'}
              </div>
            </div>
          </div>

          {/* Journal Entry Lines Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">Journal Entry Lines (Min. 2 Lines)</h3>
              <button
                onClick={addLine}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-bold transition-colors flex items-center space-x-1.5 border border-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Entry Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2 w-12">#</th>
                    <th className="pb-2">Account Ledger</th>
                    <th className="pb-2 text-right w-40">Debit (₹)</th>
                    <th className="pb-2 text-right w-40">Credit (₹)</th>
                    <th className="pb-2 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 font-mono text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-2.5">
                        <select
                          value={line.accountId}
                          onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
                        >
                          <option value="">Select Account Ledger...</option>
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} ({acc.code}) - {acc.accountGroup?.name || ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={line.debit}
                          onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-right font-mono font-bold text-emerald-400 focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={line.credit}
                          onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-right font-mono font-bold text-indigo-400 focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 2}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narration Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Voucher Narration / Remarks
              </label>
              <textarea
                rows={2}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Enter description, purpose, or reference numbers for this financial entry..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Totals & Double Entry Validation Bar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-slate-400">Total Debit:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  ₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Total Credit:</span>
                <span className="text-indigo-400 font-extrabold text-sm">
                  ₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                {isBalanced ? (
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Double-Entry Balanced</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Diff: ₹ {Math.abs(totalDebit - totalCredit).toFixed(2)} (Unbalanced)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
