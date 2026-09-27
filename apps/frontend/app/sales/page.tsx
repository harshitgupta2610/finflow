'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
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
} from 'lucide-react';

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('finflow_company_id');
      if (!companyId) return;

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

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Sales & Invoicing Module
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Generate GST tax invoices, track receivables, apply discounts, and manage customer orders.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/sales/new"
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-brand-600/30 text-xs transition-all"
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

      {/* Invoices List Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Invoice No or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Invoices</option>
              <option value="UNPAID">Unpaid Credit</option>
              <option value="PAID">Paid In Full</option>
              <option value="PARTIAL">Partially Paid</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">GST Tax</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4">Status</th>
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
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No sales invoices found. Create your first invoice by pressing "New Sales Invoice".
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const gstTax =
                    Number(inv.cgstTotal || 0) +
                    Number(inv.sgstTotal || 0) +
                    Number(inv.igstTotal || 0);

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
    </div>
  );
}
