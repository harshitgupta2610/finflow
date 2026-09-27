'use client';

import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CreditCard,
  Plus,
} from 'lucide-react';

export default function BankingPage() {
  const [reconciledState, setReconciledState] = useState<{ [key: string]: boolean }>({
    'TXN-8801': true,
    'TXN-8802': true,
    'TXN-8803': false,
    'TXN-8804': false,
  });

  const toggleReconcile = (id: string) => {
    setReconciledState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Banking & Bank Reconciliation (BRS)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage multi-bank current accounts, cash vault ledgers, and automated bank statement reconciliation.
          </p>
        </div>
      </div>

      {/* Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                HDFC
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">HDFC Bank Current A/c</h2>
                <p className="text-[11px] font-mono text-slate-400">A/c: 50200012345678</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-400">Book Balance:</span>
              <div className="text-lg font-bold text-slate-100 font-mono">₹ 14,85,900.00</div>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Reconciled
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                ICICI
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">ICICI Bank OD Account</h2>
                <p className="text-[11px] font-mono text-slate-400">A/c: 001105098765</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-400">Book Balance:</span>
              <div className="text-lg font-bold text-slate-100 font-mono">₹ 3,60,000.00</div>
            </div>
            <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              2 Unmatched
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                CASH
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">Petty Cash & Vault Ledger</h2>
                <p className="text-[11px] font-mono text-slate-400">Physical Cash Box</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
            <div>
              <span className="text-[11px] text-slate-400">Physical Cash Balance:</span>
              <div className="text-lg font-bold text-slate-100 font-mono">₹ 2,15,400.00</div>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Audited
            </span>
          </div>
        </div>
      </div>

      {/* Bank Reconciliation Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Bank Statement Reconciliation (BRS)</h2>
            <p className="text-[11px] text-slate-400">Match electronic bank statement entries with voucher journal entries</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3.5 px-4">Txn Ref</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Bank Particulars</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4 text-right">Debit / Credit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {[
                {
                  id: 'TXN-8801',
                  date: '27 Sep 2026',
                  desc: 'NEFT Credit from Zenith Retailers',
                  mode: 'NEFT',
                  amount: '₹ 1,20,000.00',
                  type: 'CR',
                },
                {
                  id: 'TXN-8802',
                  date: '26 Sep 2026',
                  desc: 'IMPS Debit to Mahalaxmi Steel',
                  mode: 'IMPS',
                  amount: '₹ 88,500.00',
                  type: 'DR',
                },
                {
                  id: 'TXN-8803',
                  date: '25 Sep 2026',
                  desc: 'UPI Payment from Walk-in Customer',
                  mode: 'UPI',
                  amount: '₹ 14,200.00',
                  type: 'CR',
                },
                {
                  id: 'TXN-8804',
                  date: '24 Sep 2026',
                  desc: 'Bank Monthly Service Charge',
                  mode: 'AUTO_DEBIT',
                  amount: '₹ 590.00',
                  type: 'DR',
                },
              ].map((row) => {
                const isReconciled = reconciledState[row.id];
                return (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">{row.id}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{row.desc}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{row.mode}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold font-mono ${
                        row.type === 'CR' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.type === 'CR' ? '+' : '-'} {row.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isReconciled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isReconciled ? 'Matched & Cleared' : 'Pending Match'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleReconcile(row.id)}
                        className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                          isReconciled
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            : 'bg-brand-600 hover:bg-brand-500 text-white'
                        }`}
                      >
                        {isReconciled ? 'Unmatch' : 'Reconcile'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
