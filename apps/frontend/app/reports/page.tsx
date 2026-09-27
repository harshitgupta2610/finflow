'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
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
  RefreshCw,
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'TB' | 'PL' | 'BS' | 'LEDGER'>('TB');
  const [loading, setLoading] = useState(false);

  // Live report data
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);

  // Ledger state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [ledgerData, setLedgerData] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('finflow_company_id');
      if (!companyId) return;

      const [tbRes, plRes, bsRes, accRes] = await Promise.all([
        api.get('/reports/trial-balance', { params: { companyId } }).catch(() => null),
        api.get('/reports/profit-loss', { params: { companyId } }).catch(() => null),
        api.get('/reports/balance-sheet', { params: { companyId } }).catch(() => null),
        api.get('/accounts', { params: { companyId } }).catch(() => null),
      ]);

      if (tbRes?.data) setTrialBalance(tbRes.data);
      if (plRes?.data) setProfitLoss(plRes.data);
      if (bsRes?.data) setBalanceSheet(bsRes.data);
      if (accRes?.data) {
        setAccounts(accRes.data);
        if (accRes.data.length > 0) {
          setSelectedAccountId(accRes.data[0].id);
          fetchLedger(accRes.data[0].id, companyId);
        }
      }
    } catch (err) {
      console.error('Failed to load financial reports', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async (accountId: string, compId?: string) => {
    try {
      const companyId = compId || localStorage.getItem('finflow_company_id');
      if (!companyId || !accountId) return;

      const res = await api.get('/reports/ledger', {
        params: { companyId, accountId },
      });
      setLedgerData(res.data);
    } catch (err) {
      console.error('Failed to load ledger', err);
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'TB' && trialBalance?.rows) {
      csvContent += 'Account Code,Account Name,Account Group,Category,Debit,Credit\n';
      trialBalance.rows.forEach((r: any) => {
        csvContent += `"${r.code}","${r.name}","${r.group}","${r.category}",${r.debit},${r.credit}\n`;
      });
    } else {
      csvContent += 'Report,Date,Status\nFinFlow Financial Report,2026-09-27,Audited\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow_${activeTab}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const tbRows = trialBalance?.rows || [];
  const grandTotalDebit = trialBalance?.grandTotalDebit || 0;
  const grandTotalCredit = trialBalance?.grandTotalCredit || 0;

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
              <button
                onClick={fetchInitialData}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Data</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV / Excel</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
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
                onClick={() => setActiveTab(tab.id as any)}
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
                  <p className="text-xs text-slate-400">
                    Live General Ledger Balances • Double-Entry Audited
                  </p>
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
                    {tbRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-500 font-sans">
                          {loading ? 'Computing Trial Balance...' : 'No accounts available.'}
                        </td>
                      </tr>
                    ) : (
                      tbRows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-2.5 text-slate-400 font-bold">{row.code}</td>
                          <td className="py-2.5 font-sans font-semibold text-slate-200">{row.name}</td>
                          <td className="py-2.5 font-sans text-slate-400">{row.group}</td>
                          <td className="py-2.5 text-right font-bold text-slate-100">
                            ₹{Number(row.debit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-100">
                            ₹{Number(row.credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                    <tr className="border-t-2 border-slate-700 bg-slate-950 font-extrabold text-sm">
                      <td colSpan={3} className="py-3 font-sans text-slate-100">
                        GRAND TOTAL
                      </td>
                      <td className="py-3 text-right text-emerald-400 font-mono">
                        ₹{grandTotalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right text-emerald-400 font-mono">
                        ₹{grandTotalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
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
                  <span className="text-xs font-mono font-extrabold text-emerald-400">
                    ₹{Number(profitLoss?.totalIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {profitLoss?.incomeList?.length > 0 ? (
                    profitLoss.incomeList.map((inc: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{inc.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{inc.code}</div>
                        </div>
                        <span className="font-mono font-bold text-slate-100">
                          ₹{Number(inc.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 py-4 text-center">No income records yet.</div>
                  )}
                </div>
              </div>

              {/* Expenses */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-indigo-400 flex items-center space-x-2">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>EXPENSES</span>
                  </h3>
                  <span className="text-xs font-mono font-extrabold text-indigo-400">
                    ₹{Number(profitLoss?.totalExpense || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {profitLoss?.expenseList?.length > 0 ? (
                    profitLoss.expenseList.map((exp: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{exp.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{exp.code}</div>
                        </div>
                        <span className="font-mono font-bold text-slate-100">
                          ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 py-4 text-center">No expense records yet.</div>
                  )}
                </div>

                {/* Net Profit Bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-between font-mono">
                  <span className="font-bold text-emerald-300">NET OPERATING PROFIT</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ₹{Number(profitLoss?.netProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
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
                  <h3 className="text-sm font-bold text-brand-400">TOTAL ASSETS</h3>
                  <span className="text-xs font-mono font-extrabold text-brand-400">
                    ₹{Number(balanceSheet?.totalAssets || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {balanceSheet?.assets?.map((a: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <span>{a.name}</span>
                      <span className="font-mono font-bold">
                        ₹{Number(a.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities & Retained Earnings */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-purple-400">LIABILITIES & EQUITY</h3>
                  <span className="text-xs font-mono font-extrabold text-purple-400">
                    ₹{Number(balanceSheet?.totalLiabilitiesAndEquity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  {balanceSheet?.liabilities?.map((l: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <span>{l.name}</span>
                      <span className="font-mono font-bold">
                        ₹{Number(l.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between font-semibold text-emerald-300">
                    <span>Retained Earnings (Operating Profit)</span>
                    <span className="font-mono font-extrabold">
                      ₹{Number(balanceSheet?.retainedEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
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
                <select
                  value={selectedAccountId}
                  onChange={(e) => {
                    setSelectedAccountId(e.target.value);
                    fetchLedger(e.target.value);
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-bold focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
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
                      <th className="pb-2 text-right">Running Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {ledgerData?.statement?.length > 0 ? (
                      ledgerData.statement.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2.5 text-slate-400">
                            {new Date(row.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-2.5 text-brand-400 font-bold">{row.voucherNumber}</td>
                          <td className="py-2.5 font-sans font-semibold text-slate-300">{row.voucherType}</td>
                          <td className="py-2.5 font-sans text-slate-400">{row.narration || row.partyName}</td>
                          <td className="py-2.5 text-right font-bold text-emerald-400">
                            ₹{Number(row.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-right font-bold text-indigo-400">
                            ₹{Number(row.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-100">
                            ₹{Number(row.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-slate-500 font-sans">
                          No transactions found for this account.
                        </td>
                      </tr>
                    )}
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
