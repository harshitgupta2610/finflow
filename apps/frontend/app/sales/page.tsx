'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  Plus,
  Search,
  FileText,
  Printer,
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Eye,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Truck,
  RefreshCw,
} from 'lucide-react';

type SalesSortField = 'invoiceNumber' | 'invoiceDate' | 'customer' | 'subtotal' | 'tax' | 'totalAmount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SalesSortField>('invoiceDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const res = await api.get('/sales/invoices', {
        params: { companyId },
      });
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to load sales invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SalesSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'totalAmount' || field === 'invoiceDate' ? 'desc' : 'asc');
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    const headers = ['Invoice Number,Date,Customer Name,Customer GSTIN,Subtotal,Tax Amount,Total Amount,Status'];
    const rows = sortedInvoices.map((inv) => {
      const tax = Number(inv.cgstTotal || 0) + Number(inv.sgstTotal || 0) + Number(inv.igstTotal || 0);
      return `"${inv.invoiceNumber}","${inv.invoiceDate?.slice(0, 10)}","${inv.customer?.name || 'Walk-in'}","${inv.customer?.gstin || ''}",${inv.subtotal || 0},${tax},${inv.totalAmount || 0},"${inv.status}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `FinFlow_Sales_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        (inv.customer?.gstin && inv.customer.gstin.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

      let matchesDate = true;
      if (startDate && inv.invoiceDate) {
        matchesDate = matchesDate && new Date(inv.invoiceDate) >= new Date(startDate);
      }
      if (endDate && inv.invoiceDate) {
        matchesDate = matchesDate && new Date(inv.invoiceDate) <= new Date(endDate + 'T23:59:59');
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, search, statusFilter, startDate, endDate]);

  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'invoiceNumber':
          aVal = a.invoiceNumber.toLowerCase();
          bVal = b.invoiceNumber.toLowerCase();
          break;
        case 'invoiceDate':
          aVal = new Date(a.invoiceDate).getTime();
          bVal = new Date(b.invoiceDate).getTime();
          break;
        case 'customer':
          aVal = (a.customer?.name || '').toLowerCase();
          bVal = (b.customer?.name || '').toLowerCase();
          break;
        case 'subtotal':
          aVal = Number(a.subtotal || 0);
          bVal = Number(b.subtotal || 0);
          break;
        case 'tax':
          aVal = Number(a.cgstTotal || 0) + Number(a.sgstTotal || 0) + Number(a.igstTotal || 0);
          bVal = Number(b.cgstTotal || 0) + Number(b.sgstTotal || 0) + Number(b.igstTotal || 0);
          break;
        case 'totalAmount':
          aVal = Number(a.totalAmount || 0);
          bVal = Number(b.totalAmount || 0);
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInvoices, sortField, sortOrder]);

  const totalSalesAmount = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  const totalTaxAmount = invoices.reduce(
    (acc, inv) =>
      acc +
      Number(inv.cgstTotal || 0) +
      Number(inv.sgstTotal || 0) +
      Number(inv.igstTotal || 0),
    0,
  );
  const totalPaidAmount = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  const totalUnpaidAmount = invoices
    .filter((inv) => inv.status === 'UNPAID')
    .reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);

  const renderSortIndicator = (field: SalesSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-brand-400 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-brand-400 ml-1 inline" />
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                Sales & Invoicing Module
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Generate GST tax invoices, track receivables, apply discounts, and generate E-Way Bills for consignments.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors"
                title="Export filtered sales register to CSV"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchInvoices}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <Link
                href="/sales/new"
                className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/30 text-xs transition-all"
                title="Keyboard Shortcut: Alt+S"
              >
                <Plus className="h-4 w-4" />
                <span>New Sales Invoice (Alt+S)</span>
              </Link>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Sales Revenue</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-100">
                ₹{totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Auto Journal Posted</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total GST Liability</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-100">
                ₹{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">CGST + SGST + IGST</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Paid Collections</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-100">
                ₹{totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-blue-400 font-medium">Realized Bank Cash</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Outstanding Receivables</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-amber-400">
                ₹{totalUnpaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-amber-500 font-medium">Pending Customer Credit</span>
            </div>
          </div>

          {/* Filtering & Search Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Invoice No, Customer, or GSTIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                {/* Date Filter */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
                  <span className="text-slate-500 text-[11px]">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                  />
                  <span className="text-slate-500 text-[11px]">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                  <Filter className="h-3.5 w-3.5 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="UNPAID">Unpaid Credit</option>
                    <option value="PAID">Paid In Full</option>
                    <option value="PARTIAL">Partially Paid</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Showing <span className="font-bold text-slate-200">{sortedInvoices.length}</span> of {invoices.length} Invoices
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('invoiceNumber')}>
                      Invoice No {renderSortIndicator('invoiceNumber')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('invoiceDate')}>
                      Date {renderSortIndicator('invoiceDate')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('customer')}>
                      Customer Name {renderSortIndicator('customer')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('subtotal')}>
                      Subtotal {renderSortIndicator('subtotal')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('tax')}>
                      GST Tax {renderSortIndicator('tax')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('totalAmount')}>
                      Grand Total {renderSortIndicator('totalAmount')}
                    </th>
                    <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('status')}>
                      Status {renderSortIndicator('status')}
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        Loading sales records...
                      </td>
                    </tr>
                  ) : sortedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        No sales invoices match the current filter.
                      </td>
                    </tr>
                  ) : (
                    sortedInvoices.map((inv) => {
                      const gstTax =
                        Number(inv.cgstTotal || 0) +
                        Number(inv.sgstTotal || 0) +
                        Number(inv.igstTotal || 0);

                      const isEwbEligible = Number(inv.totalAmount || 0) >= 50000;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-100">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-200">
                            {inv.customer?.name || 'Walk-in Customer'}
                            {inv.customer?.gstin && (
                              <span className="block text-[10px] text-slate-500 font-mono">
                                GSTIN: {inv.customer.gstin}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            ₹{Number(inv.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 text-indigo-400">
                            ₹{gstTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-100">
                            ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'PAID'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : inv.status === 'UNPAID'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {isEwbEligible && (
                              <Link
                                href={`/gst`}
                                className="inline-flex items-center space-x-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                title="Consignment value &gt; ₹50,000 — eligible for NIC E-Way Bill"
                              >
                                <Truck className="h-3 w-3" />
                                <span>E-Way Bill</span>
                              </Link>
                            )}
                            <Link
                              href={`/sales/print/${inv.id}`}
                              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Tax Invoice</span>
                            </Link>
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
