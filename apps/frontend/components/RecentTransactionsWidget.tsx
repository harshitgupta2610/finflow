'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const recentVouchers = [
  {
    id: 'VOUCH-1092',
    type: 'SALES',
    party: 'Apex Trading Co',
    amount: '₹ 45,800.00',
    date: 'Today, 02:45 PM',
    status: 'APPROVED',
  },
  {
    id: 'VOUCH-1091',
    type: 'RECEIPT',
    party: 'Zenith Retailers',
    amount: '₹ 1,20,000.00',
    date: 'Today, 11:30 AM',
    status: 'APPROVED',
  },
  {
    id: 'VOUCH-1090',
    type: 'PURCHASE',
    party: 'Mahalaxmi Steel Suppliers',
    amount: '₹ 88,500.00',
    date: 'Yesterday, 05:15 PM',
    status: 'APPROVED',
  },
  {
    id: 'VOUCH-1089',
    type: 'PAYMENT',
    party: 'Global Freight Lines',
    amount: '₹ 12,400.00',
    date: 'Yesterday, 03:00 PM',
    status: 'APPROVED',
  },
  {
    id: 'VOUCH-1088',
    type: 'JOURNAL',
    party: 'Depreciation Adjustment',
    amount: '₹ 35,000.00',
    date: '25 Sep 2026',
    status: 'APPROVED',
  },
];

export function RecentTransactionsWidget() {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Recent Financial Vouchers</h3>
          <p className="text-xs text-slate-400">Transactionally balanced double-entry vouchers</p>
        </div>
        <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
          View All Vouchers →
        </button>
      </div>

      <div className="space-y-3">
        {recentVouchers.map((v) => (
          <div
            key={v.id}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg text-xs font-bold ${
                  v.type === 'SALES' || v.type === 'RECEIPT'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                {v.type === 'SALES' || v.type === 'RECEIPT' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">{v.party}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {v.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                  <span>{v.date}</span>
                  <span>•</span>
                  <span className="text-slate-400 uppercase font-semibold">{v.type}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-100">{v.amount}</div>
              <div className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>Audited & Posted</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
