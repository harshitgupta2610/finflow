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
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function VouchersListPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const res = await api.get('/vouchers', {
        params: { companyId },
      });
      setVouchers(res.data);
    } catch (err) {
      console.error('Failed to load vouchers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVoucher = async (voucherId: string) => {
    const reason = prompt('Please enter the cancellation / reversal reason:');
    if (!reason) return;

    try {
      setCancellingId(voucherId);
      const companyId = await getActiveCompanyId();
      await api.post(`/vouchers/${voucherId}/cancel?companyId=${companyId}`, { reason });
      await fetchVouchers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel voucher');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.narration && v.narration.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || v.voucherType === typeFilter;
    return matchesSearch && matchesType;
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
                <h1 className="text-xl font-extrabold text-slate-100">Audited Financial Vouchers</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Transactionally balanced double-entry vouchers with immutable audit trails and reversal logs.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchVouchers}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <Link
                href="/vouchers/new"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Voucher (Alt+V)</span>
              </Link>
            </div>
          </div>

          {/* Vouchers Table Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden glass-card">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search voucher number or narration..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Type:</span>
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Voucher Types</option>
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="JOURNAL">Journal</option>
                  <option value="CONTRA">Contra</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3.5 px-4">Voucher No</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Narration</th>
                    <th className="py-3.5 px-4 text-right">Debit (₹)</th>
                    <th className="py-3.5 px-4 text-right">Credit (₹)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        Loading financial vouchers...
                      </td>
                    </tr>
                  ) : filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        No vouchers found. Create your first voucher using "New Voucher".
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((v) => {
                      const lines = v.journalEntry?.lines || [];
                      const totalDebit = lines.reduce(
                        (sum: number, l: any) => sum + Number(l.debit || 0),
                        0,
                      );
                      const totalCredit = lines.reduce(
                        (sum: number, l: any) => sum + Number(l.credit || 0),
                        0,
                      );

                      return (
                        <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                            {v.voucherNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(v.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.voucherType === 'SALES' || v.voucherType === 'RECEIPT'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : v.voucherType === 'PURCHASE' || v.voucherType === 'PAYMENT'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}
                            >
                              {v.voucherType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                            {v.narration || 'General double-entry voucher'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                            ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                            ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {v.status === 'APPROVED' ? (
                              <button
                                onClick={() => handleCancelVoucher(v.id)}
                                disabled={cancellingId === v.id}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
                              >
                                {cancellingId === v.id ? 'Reversing...' : 'Cancel (Reverse)'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">Reversed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
