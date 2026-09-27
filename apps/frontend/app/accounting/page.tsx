'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

const mockAccountTree = [
  {
    category: 'ASSET',
    groups: [
      {
        name: 'Cash-in-Hand',
        code: 'CASH',
        ledgers: [
          { name: 'Main Cash Account', code: 'CASH_PRIMARY', balance: '₹ 10,000.00', type: 'DEBIT' },
          { name: 'Petty Cash Register', code: 'CASH_PETTY', balance: '₹ 2,450.00', type: 'DEBIT' },
        ],
      },
      {
        name: 'Bank Accounts',
        code: 'BANK',
        ledgers: [
          { name: 'HDFC Bank Primary A/c', code: 'BANK_HDFC_01', balance: '₹ 12,45,000.00', type: 'DEBIT' },
          { name: 'ICICI Current A/c', code: 'BANK_ICICI_01', balance: '₹ 6,00,900.00', type: 'DEBIT' },
        ],
      },
      {
        name: 'Accounts Receivable (Debtors)',
        code: 'RECEIVABLES',
        ledgers: [
          { name: 'Apex Trading Co', code: 'PARTY_CUST_01', balance: '₹ 1,85,000.00', type: 'DEBIT' },
          { name: 'Vanguard Tech', code: 'PARTY_CUST_02', balance: '₹ 85,000.00', type: 'DEBIT' },
        ],
      },
    ],
  },
  {
    category: 'LIABILITY',
    groups: [
      {
        name: 'Accounts Payable (Creditors)',
        code: 'PAYABLES',
        ledgers: [
          { name: 'Mahalaxmi Steel', code: 'PARTY_SUPP_01', balance: '₹ 2,20,000.00', type: 'CREDIT' },
          { name: 'Global Freight Lines', code: 'PARTY_SUPP_02', balance: '₹ 45,000.00', type: 'CREDIT' },
        ],
      },
      {
        name: 'GST Payable',
        code: 'GST_PAYABLE',
        ledgers: [
          { name: 'Output CGST 9%', code: 'GST_CGST_OUT', balance: '₹ 96,225.00', type: 'CREDIT' },
          { name: 'Output SGST 9%', code: 'GST_SGST_OUT', balance: '₹ 96,225.00', type: 'CREDIT' },
        ],
      },
    ],
  },
  {
    category: 'INCOME',
    groups: [
      {
        name: 'Sales Accounts',
        code: 'SALES_REV',
        ledgers: [
          { name: 'Sales Account (Domestic GST 18%)', code: 'SALES_18', balance: '₹ 24,85,400.00', type: 'CREDIT' },
          { name: 'Export Sales (Zero Rated)', code: 'SALES_EXP', balance: '₹ 0.00', type: 'CREDIT' },
        ],
      },
    ],
  },
  {
    category: 'EXPENSE',
    groups: [
      {
        name: 'Purchase Accounts',
        code: 'PURCHASE_EXP',
        ledgers: [
          { name: 'Purchase Account (Raw Material)', code: 'PURCH_RM', balance: '₹ 14,20,000.00', type: 'DEBIT' },
        ],
      },
      {
        name: 'Operating Expenses',
        code: 'INDIRECT_EXP',
        ledgers: [
          { name: 'Office Rent Expense', code: 'EXP_RENT', balance: '₹ 75,000.00', type: 'DEBIT' },
          { name: 'Staff Salaries', code: 'EXP_SALARY', balance: '₹ 3,50,000.00', type: 'DEBIT' },
        ],
      },
    ],
  },
];

export default function ChartOfAccountsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

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
                Manage account groups, sub-ledgers, opening balances, and debit/credit classifications.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Ledger Account</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((cat) => (
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
          <div className="space-y-4">
            {mockAccountTree
              .filter((c) => selectedCategory === 'ALL' || c.category === selectedCategory)
              .map((categorySection) => (
                <div key={categorySection.category} className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
                  <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-800">
                    <span className="h-3 w-3 rounded-full bg-brand-500"></span>
                    <h3 className="text-sm font-extrabold text-slate-100 tracking-wide uppercase">
                      {categorySection.category} CATEGORY
                    </h3>
                  </div>

                  <div className="space-y-4 pl-2">
                    {categorySection.groups.map((group) => (
                      <div key={group.code} className="space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <FolderTree className="h-4 w-4 text-brand-400" />
                          <span>{group.name}</span>
                          <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {group.code}
                          </span>
                        </div>

                        <div className="pl-6 space-y-1 border-l border-slate-800">
                          {group.ledgers.map((ledger) => (
                            <div
                              key={ledger.code}
                              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors text-xs"
                            >
                              <div className="flex items-center space-x-3">
                                <Layers className="h-3.5 w-3.5 text-slate-500" />
                                <div>
                                  <span className="font-semibold text-slate-200">{ledger.name}</span>
                                  <span className="ml-2 font-mono text-[10px] text-slate-500">{ledger.code}</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 font-mono">
                                <span className="font-bold text-slate-100">{ledger.balance}</span>
                                <span
                                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                    ledger.type === 'DEBIT'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                  }`}
                                >
                                  {ledger.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
