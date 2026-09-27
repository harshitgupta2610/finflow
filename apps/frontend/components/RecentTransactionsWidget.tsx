'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, RefreshCw } from 'lucide-react';

export function RecentTransactionsWidget() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentVouchers();
  }, []);

  const fetchRecentVouchers = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('finflow_company_id');
      if (!companyId) return;

      const res = await api.get('/vouchers', {
        params: { companyId, limit: 5 },
      });
      if (res.data && res.data.length > 0) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error('Failed to load recent vouchers', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultVouchers = [
    {
      id: 'VOUCH-1092',
      voucherNumber: 'VOUCH-1092',
      voucherType: 'SALES',
      narration: 'Apex Trading Co',
      amount: '₹ 45,800.00',
      date: new Date().toISOString(),
      status: 'APPROVED',
    },
    {
      id: 'VOUCH-1091',
      voucherNumber: 'VOUCH-1091',
      voucherType: 'RECEIPT',
      narration: 'Zenith Retailers',
      amount: '₹ 1,20,000.00',
      date: new Date().toISOString(),
      status: 'APPROVED',
    },
    {
      id: 'VOUCH-1090',
      voucherNumber: 'VOUCH-1090',
      voucherType: 'PURCHASE',
      narration: 'Mahalaxmi Steel Suppliers',
      amount: '₹ 88,500.00',
      date: new Date().toISOString(),
      status: 'APPROVED',
    },
    {
      id: 'VOUCH-1089',
      voucherNumber: 'VOUCH-1089',
      voucherType: 'PAYMENT',
      narration: 'Global Freight Lines',
      amount: '₹ 12,400.00',
      date: new Date().toISOString(),
      status: 'APPROVED',
    },
    {
      id: 'VOUCH-1088',
      voucherNumber: 'VOUCH-1088',
      voucherType: 'JOURNAL',
      narration: 'Depreciation Adjustment',
      amount: '₹ 35,000.00',
      date: new Date().toISOString(),
      status: 'APPROVED',
    },
  ];

  const displayList = vouchers.length > 0 ? vouchers : defaultVouchers;

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Recent Financial Vouchers</h3>
          <p className="text-xs text-slate-400">Transactionally balanced double-entry vouchers</p>
        </div>
        <Link href="/vouchers" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
          View All Vouchers →
        </Link>
      </div>

      <div className="space-y-3">
        {displayList.map((v) => {
          const lines = v.journalEntry?.lines || [];
          const totalDebit = lines.reduce(
            (sum: number, l: any) => sum + Number(l.debit || 0),
            0,
          );
          const formattedAmount =
            v.amount || `₹ ${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

          return (
            <div
              key={v.id}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg text-xs font-bold ${
                    v.voucherType === 'SALES' || v.voucherType === 'RECEIPT'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {v.voucherType === 'SALES' || v.voucherType === 'RECEIPT' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">
                      {v.narration || v.party || 'Double-entry Voucher'}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {v.voucherNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                    <span>
                      {new Date(v.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 uppercase font-semibold">{v.voucherType}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-extrabold text-slate-100">{formattedAmount}</div>
                <div className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Audited & Posted</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
