'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  FileCheck2,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Building,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function GSTCompliancePage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleJSONExport = (type: string) => {
    setDownloadSuccess(`GST portal compliant ${type} JSON return generated successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            GST & E-Invoicing Compliance Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            GSTR-1, GSTR-3B return computation, HSN/SAC summary, and E-Way Bill JSON portal export.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={() => handleJSONExport('GSTR-1 & GSTR-3B')}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-brand-600/30"
          >
            <Download className="h-4 w-4" />
            <span>Download GST JSON Payload</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* GSTR-3B Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              3B
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">GSTR-3B Tax Computation Sheet</h2>
              <p className="text-xs text-slate-400">Monthly summary of output tax liability vs eligible input tax credit (ITC)</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Due Date: 20th Oct 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium">1. Gross Output Tax (Sales)</span>
            <div className="text-xl font-bold text-rose-400 font-mono">₹ 3,45,200.00</div>
            <p className="text-[11px] text-slate-500">CGST ₹1,72,600 + SGST ₹1,72,600</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium">2. Less Eligible ITC (Purchases)</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">₹ 1,52,750.00</div>
            <p className="text-[11px] text-slate-500">Claimable GSTR-2B Input Credit</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium">3. Net GST Cash Liability</span>
            <div className="text-xl font-bold text-indigo-400 font-mono">₹ 1,92,450.00</div>
            <p className="text-[11px] text-indigo-400 font-medium">Payable via Electronic Cash Ledger</p>
          </div>
        </div>
      </div>

      {/* GSTR-1 Section Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/80">
          <h2 className="text-sm font-bold text-slate-100">GSTR-1 Outward Supplies Table Summary</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3.5 px-4">GSTR-1 Table</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">No of Invoices</th>
                <th className="py-3.5 px-4 text-right">Taxable Amount</th>
                <th className="py-3.5 px-4 text-right">Integrated Tax</th>
                <th className="py-3.5 px-4 text-right">Central Tax</th>
                <th className="py-3.5 px-4 text-right">State Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-100">4A, 4B (B2B)</td>
                <td className="py-3.5 px-4">Registered Business Supplies</td>
                <td className="py-3.5 px-4 text-right font-mono">24</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 18,40,000.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 45,000.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 1,43,100.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 1,43,100.00</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-100">5A, 5B (B2C Large)</td>
                <td className="py-3.5 px-4">Unregistered Out-of-State Invoices &gt; ₹2.5L</td>
                <td className="py-3.5 px-4 text-right font-mono">4</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 3,20,000.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 57,600.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 0.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 0.00</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-100">7 (B2C Small)</td>
                <td className="py-3.5 px-4">Intra-state Consumer Sales</td>
                <td className="py-3.5 px-4 text-right font-mono">112</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 3,25,400.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 0.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 29,500.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 29,500.00</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors font-bold bg-slate-950/80 text-slate-100">
                <td className="py-3.5 px-4">12 (HSN Summary)</td>
                <td className="py-3.5 px-4">HSN-wise Consolidated Summary</td>
                <td className="py-3.5 px-4 text-right font-mono">140</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 24,85,400.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 1,02,600.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 1,72,600.00</td>
                <td className="py-3.5 px-4 text-right font-mono">₹ 1,72,600.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
