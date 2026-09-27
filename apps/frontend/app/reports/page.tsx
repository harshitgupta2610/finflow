'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
} from 'lucide-react';

const mockTrialBalance = [
  { code: 'CASH_PRIMARY', name: 'Main Cash Account', group: 'Cash-in-Hand', category: 'ASSET', debit: '₹ 10,000.00', credit: '₹ 0.00' },
  { code: 'BANK_HDFC_01', name: 'HDFC Bank Primary A/c', group: 'Bank Accounts', category: 'ASSET', debit: '₹ 12,45,000.00', credit: '₹ 0.00' },
  { code: 'PARTY_CUST_01', name: 'Apex Trading Co', group: 'Accounts Receivable', category: 'ASSET', debit: '₹ 1,85,000.00', credit: '₹ 0.00' },
  { code: 'PARTY_SUPP_01', name: 'Mahalaxmi Steel', group: 'Accounts Payable', category: 'LIABILITY', debit: '₹ 0.00', credit: '₹ 2,20,000.00' },
  { code: 'GST_CGST_OUT', name: 'Output CGST 9%', group: 'GST Payable', category: 'LIABILITY', debit: '₹ 0.00', credit: '₹ 96,225.00' },
  { code: 'GST_SGST_OUT', name: 'Output SGST 9%', group: 'GST Payable', category: 'LIABILITY', debit: '₹ 0.00', credit: '₹ 96,225.00' },
  { code: 'SALES_18', name: 'Sales Account (Domestic)', group: 'Sales Accounts', category: 'INCOME', debit: '₹ 0.00', credit: '₹ 24,85,400.00' },
  { code: 'PURCH_RM', name: 'Purchase Account (Raw Material)', group: 'Purchase Accounts', category: 'EXPENSE', debit: '₹ 14,25,050.00', credit: '₹ 0.00' },
  { code: 'EXP_RENT', name: 'Office Rent Expense', group: 'Indirect Expenses', category: 'EXPENSE', debit: '₹ 75,000.00', credit: '₹ 0.00' },
  { code: 'EXP_SALARY', name: 'Staff Salaries', group: 'Indirect Expenses', category: 'EXPENSE', debit: '₹ 3,57,800.00', credit: '₹ 0.00' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('TB'); // TB, PL, BS, LEDGER

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
                <BarChart3 className="h-5 w-5 text-brand-400" />
                <h1 className="text-xl font-extrabold text-slate-100">Financial Reporting & Statements</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Audited Trial Balance, Profit & Loss Statement, Balance Sheet, and Account Ledgers.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700">
                <Download className="h-4 w-4" />
                <span>Export CSV / Excel</span>
              </button>
              <button className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700">
                <Printer className="h-4 w-4" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Report Tab Switcher */}
          <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            {[
              { id: 'TB', name: 'Trial Balance' },
              { id: 'PL', name: 'Profit & Loss Statement' },
              { id: 'BS', name: 'Balance Sheet' },
              { id: 'LEDGER', name: 'Account Ledger Statement' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 1. Trial Balance Tab */}
          {activeTab === 'TB' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Trial Balance Statement</h3>
                  <p className="text-xs text-slate-400">As of September 27, 2026 • Financial Year 2024-25</p>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Balanced: SUM(Debit) === SUM(Credit)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="pb-2">Account Code</th>
                      <th className="pb-2">Ledger Name</th>
                      <th className="pb-2">Account Group</th>
                      <th className="pb-2 text-right">Debit (₹)</th>
                      <th className="pb-2 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {mockTrialBalance.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 text-slate-400 font-bold">{row.code}</td>
                        <td className="py-2.5 font-sans font-semibold text-slate-200">{row.name}</td>
                        <td className="py-2.5 font-sans text-slate-400">{row.group}</td>
                        <td className="py-2.5 text-right font-bold text-slate-100">{row.debit}</td>
                        <td className="py-2.5 text-right font-bold text-slate-100">{row.credit}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-slate-700 bg-slate-950 font-extrabold text-sm">
                      <td colSpan={3} className="py-3 font-sans text-slate-100">
                        GRAND TOTAL
                      </td>
                      <td className="py-3 text-right text-emerald-400">₹ 28,97,850.00</td>
                      <td className="py-3 text-right text-emerald-400">₹ 28,97,850.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Profit & Loss Tab */}
          {activeTab === 'PL' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>INCOME & REVENUE</span>
                  </h3>
                  <span className="text-xs font-mono font-extrabold text-emerald-400">₹ 24,85,400.00</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Sales Account (Domestic GST 18%)</div>
                      <div className="text-[10px] text-slate-500 font-mono">SALES_18</div>
                    </div>
                    <span className="font-mono font-bold text-slate-100">₹ 24,85,400.00</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center space-x-2">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>EXPENSES</span>
                  </h3>
                  <span className="text-xs font-mono font-extrabold text-indigo-400">₹ 18,57,850.00</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Purchase Account (Raw Material)</div>
                      <div className="text-[10px] text-slate-500 font-mono">PURCH_RM</div>
                    </div>
                    <span className="font-mono font-bold text-slate-100">₹ 14,25,050.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Staff Salaries</div>
                      <div className="text-[10px] text-slate-500 font-mono">EXP_SALARY</div>
                    </div>
                    <span className="font-mono font-bold text-slate-100">₹ 3,57,800.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Office Rent Expense</div>
                      <div className="text-[10px] text-slate-500 font-mono">EXP_RENT</div>
                    </div>
                    <span className="font-mono font-bold text-slate-100">₹ 75,000.00</span>
                  </div>
                </div>

                {/* Net Profit Bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-between font-mono">
                  <span className="font-bold text-emerald-300">NET OPERATING PROFIT</span>
                  <span className="text-base font-extrabold text-emerald-400">₹ 6,27,550.00</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Balance Sheet Tab */}
          {activeTab === 'BS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-brand-400">ASSETS</h3>
                  <span className="text-xs font-mono font-extrabold text-brand-400">₹ 14,40,000.00</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span>HDFC Bank Primary A/c</span>
                    <span className="font-mono font-bold">₹ 12,45,000.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span>Apex Trading Co (Receivables)</span>
                    <span className="font-mono font-bold">₹ 1,85,000.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span>Main Cash Account</span>
                    <span className="font-mono font-bold">₹ 10,000.00</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Retained Earnings */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-purple-400">LIABILITIES & RETAINED EARNINGS</h3>
                  <span className="text-xs font-mono font-extrabold text-purple-400">₹ 14,40,000.00</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span>Mahalaxmi Steel (Payables)</span>
                    <span className="font-mono font-bold">₹ 2,20,000.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span>Output CGST + SGST Payable</span>
                    <span className="font-mono font-bold">₹ 1,92,450.00</span>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-semibold text-emerald-300">
                    <span>Retained Earnings (Current Net Profit)</span>
                    <span className="font-mono font-extrabold">₹ 6,27,550.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Ledger Tab */}
          {activeTab === 'LEDGER' && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Account Ledger Statement</h3>
                  <p className="text-xs text-slate-400">Detailed transaction statement with running debit/credit balance</p>
                </div>
                <select className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-bold focus:outline-none">
                  <option>Apex Trading Co (PARTY_CUST_01)</option>
                  <option>HDFC Bank Primary A/c (BANK_HDFC_01)</option>
                  <option>Main Cash Account (CASH_PRIMARY)</option>
                  <option>Sales Account (Domestic) (SALES_18)</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Voucher No</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Narration / Particulars</th>
                      <th className="pb-2 text-right">Debit (₹)</th>
                      <th className="pb-2 text-right">Credit (₹)</th>
                      <th className="pb-2 text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2.5 text-slate-400">01 Apr 2026</td>
                      <td className="py-2.5 text-brand-400 font-bold">OP-BAL</td>
                      <td className="py-2.5 font-sans font-semibold text-slate-300">OPENING</td>
                      <td className="py-2.5 font-sans text-slate-400">Opening Balance Brought Forward</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">₹ 50,000.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-500">₹ 0.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-100">₹ 50,000.00 Dr</td>
                    </tr>
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2.5 text-slate-400">15 Apr 2026</td>
                      <td className="py-2.5 text-brand-400 font-bold">INV-1092</td>
                      <td className="py-2.5 font-sans font-semibold text-emerald-400">SALES</td>
                      <td className="py-2.5 font-sans text-slate-400">Sales Invoice INV-1092 (GST 18%)</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">₹ 1,80,000.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-500">₹ 0.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-100">₹ 2,30,000.00 Dr</td>
                    </tr>
                    <tr className="hover:bg-slate-800/20">
                      <td className="py-2.5 text-slate-400">20 May 2026</td>
                      <td className="py-2.5 text-brand-400 font-bold">REC-045</td>
                      <td className="py-2.5 font-sans font-semibold text-brand-400">RECEIPT</td>
                      <td className="py-2.5 font-sans text-slate-400">Cheque Received HDFC #401928</td>
                      <td className="py-2.5 text-right font-bold text-slate-500">₹ 0.00</td>
                      <td className="py-2.5 text-right font-bold text-indigo-400">₹ 45,000.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-100">₹ 1,85,000.00 Dr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
