'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  CalendarDays, Search, Filter, RefreshCw, Download, ChevronDown,
  ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, BookOpen,
  Eye, Printer, FileText, TrendingUp, TrendingDown, Hash,
} from 'lucide-react';

interface DaybookLine {
  id: string;
  account: { id: string; name: string; code: string };
  party: { id: string; name: string; partyType: string } | null;
  debit: number;
  credit: number;
}

interface DaybookEntry {
  id: string;
  voucherNumber: string;
  voucherType: string;
  date: string;
  narration: string;
  status: string;
  createdBy: { firstName: string; lastName: string };
  totalDebit: number;
  totalCredit: number;
  lines: DaybookLine[];
}

interface DaybookResponse {
  entries: DaybookEntry[];
  summary: {
    totalEntries: number;
    totalDebit: number;
    totalCredit: number;
  };
}

type SortField = 'date' | 'voucherNumber' | 'voucherType' | 'totalDebit' | 'totalCredit';
type SortOrder = 'asc' | 'desc';

export default function DaybookPage() {
  const [data, setData] = useState<DaybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchDaybook();
  }, []);

  const fetchDaybook = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();
      const params: any = { companyId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (typeFilter !== 'ALL') params.voucherType = typeFilter;

      const res = await api.get('/reports/daybook', { params });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load daybook', err);
      setData({ entries: [], summary: { totalEntries: 0, totalDebit: 0, totalCredit: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    if (data) setExpandedRows(new Set(data.entries.map(e => e.id)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort
  const filteredEntries = useMemo(() => {
    if (!data) return [];
    let entries = data.entries;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(e =>
        e.voucherNumber.toLowerCase().includes(q) ||
        (e.narration && e.narration.toLowerCase().includes(q)) ||
        e.lines.some(l =>
          l.account.name.toLowerCase().includes(q) ||
          l.account.code.toLowerCase().includes(q) ||
          (l.party && l.party.name.toLowerCase().includes(q))
        )
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      entries = entries.filter(e => e.status === statusFilter);
    }

    // Sort
    entries = [...entries].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
        case 'voucherNumber': cmp = a.voucherNumber.localeCompare(b.voucherNumber); break;
        case 'voucherType': cmp = a.voucherType.localeCompare(b.voucherType); break;
        case 'totalDebit': cmp = a.totalDebit - b.totalDebit; break;
        case 'totalCredit': cmp = a.totalCredit - b.totalCredit; break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return entries;
  }, [data, search, statusFilter, sortField, sortOrder]);

  // Group entries by date for visual separation
  const groupedByDate = useMemo(() => {
    const groups: Record<string, DaybookEntry[]> = {};
    for (const entry of filteredEntries) {
      const dateKey = new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  // Summary from filtered entries
  const filteredSummary = useMemo(() => {
    return filteredEntries.reduce(
      (acc, e) => ({
        totalDebit: acc.totalDebit + e.totalDebit,
        totalCredit: acc.totalCredit + e.totalCredit,
        count: acc.count + 1,
      }),
      { totalDebit: 0, totalCredit: 0, count: 0 }
    );
  }, [filteredEntries]);

  const voucherTypeColor = (type: string) => {
    switch (type) {
      case 'SALES': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PURCHASE': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'RECEIPT': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'PAYMENT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'JOURNAL': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CONTRA': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'DEBIT_NOTE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'CREDIT_NOTE': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-600 ml-1" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="h-3 w-3 text-brand-400 ml-1" />
      : <ArrowDown className="h-3 w-3 text-brand-400 ml-1" />;
  };

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Keyboard shortcut: F5 = Refresh, Ctrl+E = Expand All, Ctrl+Shift+E = Collapse All
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        fetchDaybook();
      }
      if (e.ctrlKey && e.key === 'e' && !e.shiftKey) {
        e.preventDefault();
        expandAll();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        collapseAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-100">Day Book</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological register of all financial transactions with double-entry journal details
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700 flex items-center space-x-1.5"
                title="Expand All (Ctrl+E)"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700 flex items-center space-x-1.5"
              >
                <span>Collapse</span>
              </button>
              <button
                onClick={fetchDaybook}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
                title="Refresh (F5)"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Entries</span>
                <Hash className="h-4 w-4 text-brand-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-100 mt-1">{filteredSummary.count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Filtered transactions</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Debits</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{formatCurrency(filteredSummary.totalDebit)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Credits</span>
                <TrendingDown className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-400 mt-1 font-mono">{formatCurrency(filteredSummary.totalCredit)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Balance Check</span>
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <p className={`text-2xl font-extrabold mt-1 font-mono ${Math.abs(filteredSummary.totalDebit - filteredSummary.totalCredit) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.abs(filteredSummary.totalDebit - filteredSummary.totalCredit) < 0.01 ? '✓ Balanced' : formatCurrency(Math.abs(filteredSummary.totalDebit - filteredSummary.totalCredit))}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Dr = Cr Validation</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl glass-card">
            <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search voucher no., narration, account, party..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
                <span className="text-xs text-slate-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="SALES">Sales</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="JOURNAL">Journal</option>
                  <option value="CONTRA">Contra</option>
                  <option value="DEBIT_NOTE">Debit Note</option>
                  <option value="CREDIT_NOTE">Credit Note</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DRAFT">Draft</option>
              </select>

              {/* Apply Button */}
              <button
                onClick={fetchDaybook}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Daybook Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3.5 px-4 w-8"></th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">Date <SortIcon field="date" /></div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors select-none"
                      onClick={() => handleSort('voucherNumber')}
                    >
                      <div className="flex items-center">Voucher No <SortIcon field="voucherNumber" /></div>
                    </th>
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors select-none"
                      onClick={() => handleSort('voucherType')}
                    >
                      <div className="flex items-center">Type <SortIcon field="voucherType" /></div>
                    </th>
                    <th className="py-3.5 px-4">Narration</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200 transition-colors select-none"
                      onClick={() => handleSort('totalDebit')}
                    >
                      <div className="flex items-center justify-end">Debit (₹) <SortIcon field="totalDebit" /></div>
                    </th>
                    <th
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200 transition-colors select-none"
                      onClick={() => handleSort('totalCredit')}
                    >
                      <div className="flex items-center justify-end">Credit (₹) <SortIcon field="totalCredit" /></div>
                    </th>
                    <th className="py-3.5 px-4 text-right">Posted By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-slate-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-400" />
                        Loading daybook entries...
                      </td>
                    </tr>
                  ) : filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-slate-500">
                        <CalendarDays className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm font-medium">No daybook entries found</p>
                        <p className="text-[11px] mt-1">Adjust filters or create vouchers to populate the daybook.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => {
                      const isExpanded = expandedRows.has(entry.id);
                      return (
                        <React.Fragment key={entry.id}>
                          {/* Main Row */}
                          <tr
                            className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                            onClick={() => toggleRow(entry.id)}
                          >
                            <td className="py-3.5 px-4">
                              <button className="text-slate-500 hover:text-brand-400 transition-colors">
                                {isExpanded
                                  ? <ChevronDown className="h-4 w-4" />
                                  : <ChevronRight className="h-4 w-4" />
                                }
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                              {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                              {entry.voucherNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${voucherTypeColor(entry.voucherType)}`}>
                                {entry.voucherType.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                              {entry.narration || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                                entry.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                              {entry.totalDebit > 0 ? formatCurrency(entry.totalDebit) : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-400">
                              {entry.totalCredit > 0 ? formatCurrency(entry.totalCredit) : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[11px] text-slate-400">
                              {entry.createdBy?.firstName} {entry.createdBy?.lastName?.[0]}.
                            </td>
                          </tr>

                          {/* Expanded Journal Lines */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} className="p-0">
                                <div className="bg-slate-950/80 border-l-4 border-brand-500/50 mx-4 my-1 rounded-lg overflow-hidden">
                                  <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                                      Journal Entry Lines — Double Entry Detail
                                    </span>
                                  </div>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-800/40">
                                        <th className="py-2 px-4 text-left">Account Code</th>
                                        <th className="py-2 px-4 text-left">Account Name</th>
                                        <th className="py-2 px-4 text-left">Party</th>
                                        <th className="py-2 px-4 text-right">Debit (₹)</th>
                                        <th className="py-2 px-4 text-right">Credit (₹)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                      {entry.lines.map((line) => (
                                        <tr key={line.id} className="hover:bg-slate-800/30 transition-colors">
                                          <td className="py-2 px-4 font-mono text-[11px] text-slate-400">
                                            {line.account.code}
                                          </td>
                                          <td className="py-2 px-4 text-slate-200 font-medium">
                                            {line.account.name}
                                          </td>
                                          <td className="py-2 px-4 text-slate-400">
                                            {line.party ? (
                                              <span className="flex items-center space-x-1">
                                                <span>{line.party.name}</span>
                                                <span className="text-[9px] bg-slate-800 px-1 rounded">{line.party.partyType}</span>
                                              </span>
                                            ) : '—'}
                                          </td>
                                          <td className="py-2 px-4 text-right font-mono font-semibold text-emerald-400">
                                            {line.debit > 0 ? formatCurrency(line.debit) : ''}
                                          </td>
                                          <td className="py-2 px-4 text-right font-mono font-semibold text-indigo-400">
                                            {line.credit > 0 ? formatCurrency(line.credit) : ''}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>

                {/* Table Footer Totals */}
                {!loading && filteredEntries.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-brand-500/30 bg-slate-950/80 font-bold">
                      <td colSpan={6} className="py-3.5 px-4 text-right text-xs text-slate-300 uppercase tracking-wider">
                        Grand Totals ({filteredSummary.count} entries)
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-400">
                        {formatCurrency(filteredSummary.totalDebit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-indigo-400">
                        {formatCurrency(filteredSummary.totalCredit)}
                      </td>
                      <td className="py-3.5 px-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Keyboard Shortcut Hint Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2.5">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 mr-1">F5</kbd> Refresh
              <span className="mx-2">•</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 mr-1">Ctrl+E</kbd> Expand All
              <span className="mx-2">•</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 mr-1">Ctrl+Shift+E</kbd> Collapse
              <span className="mx-2">•</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 mr-1">?</kbd> All Shortcuts
            </span>
            <span className="font-mono">FinFlow Day Book Register</span>
          </div>
        </main>
      </div>
    </div>
  );
}
