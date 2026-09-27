'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getActiveCompanyId, getActiveFinancialYearId } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Sidebar } from '../../../components/Sidebar';
import {
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Calculator,
  Building,
  User,
  Calendar,
  CreditCard,
  Printer,
  X,
  Save,
  RefreshCw,
} from 'lucide-react';

interface InvoiceLineInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
}

export default function NewSalesInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [companyState, setCompanyState] = useState('Maharashtra');

  // Quick Add Customer modal state
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [creatingParty, setCreatingParty] = useState(false);
  const [newPartyForm, setNewPartyForm] = useState({
    name: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    state: 'Maharashtra',
    billingAddress: '',
    creditDays: 30,
    creditLimit: 500000,
  });

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CREDIT');
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [lines, setLines] = useState<InvoiceLineInput[]>([
    { itemId: '', quantity: 1, unitPrice: 0, discount: 0, gstRate: 18 },
  ]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Keyboard shortcut listener (Ctrl+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customerId, lines, invoiceNumber, invoiceDate, isTaxInclusive, freightCharges]);

  const fetchMasterData = async () => {
    try {
      setDataLoading(true);
      const companyId = await getActiveCompanyId();

      const [companyRes, partiesRes, itemsRes] = await Promise.all([
        api.get(`/companies/${companyId}`).catch(() => ({ data: null })),
        api.get('/parties', { params: { companyId, type: 'CUSTOMER' } }).catch(() => ({ data: [] })),
        api.get('/items', { params: { companyId } }).catch(() => ({ data: [] })),
      ]);

      if (companyRes?.data?.state) {
        setCompanyState(companyRes.data.state);
        setPlaceOfSupply(companyRes.data.state);
      }

      let partyList = partiesRes.data || [];
      if (partyList.length === 0) {
        // Fallback: fetch all parties so any registered customer/vendor can be chosen
        const allPartiesRes = await api.get('/parties', { params: { companyId } }).catch(() => ({ data: [] }));
        partyList = allPartiesRes.data || [];
      }

      setParties(partyList);
      setItems(itemsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCustomerChange = (partyId: string) => {
    setCustomerId(partyId);
    const selectedParty = parties.find((p) => p.id === partyId);
    if (selectedParty) {
      if (selectedParty.state) {
        setPlaceOfSupply(selectedParty.state);
      }
      if (selectedParty.creditDays) {
        const d = new Date(invoiceDate || new Date().toISOString().split('T')[0]);
        d.setDate(d.getDate() + Number(selectedParty.creditDays));
        setDueDate(d.toISOString().split('T')[0]);
      }
    }
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyForm.name.trim()) return;

    try {
      setCreatingParty(true);
      const companyId = await getActiveCompanyId();

      const res = await api.post('/parties', {
        companyId,
        name: newPartyForm.name.trim(),
        partyType: 'CUSTOMER',
        gstin: newPartyForm.gstin.trim() || undefined,
        pan: newPartyForm.pan.trim() || undefined,
        phone: newPartyForm.phone.trim() || undefined,
        email: newPartyForm.email.trim() || undefined,
        state: newPartyForm.state || companyState,
        billingAddress: newPartyForm.billingAddress.trim() || undefined,
        creditLimit: Number(newPartyForm.creditLimit) || 0,
        creditDays: Number(newPartyForm.creditDays) || 30,
      });

      setShowAddPartyModal(false);
      setNewPartyForm({
        name: '',
        gstin: '',
        pan: '',
        phone: '',
        email: '',
        state: companyState,
        billingAddress: '',
        creditDays: 30,
        creditLimit: 500000,
      });

      await fetchMasterData();
      if (res.data?.id) {
        setCustomerId(res.data.id);
        if (res.data.state) setPlaceOfSupply(res.data.state);
      }
    } catch (err: any) {
      console.error('Failed to quick-add customer', err);
      alert(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setCreatingParty(false);
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { itemId: '', quantity: 1, unitPrice: 0, discount: 0, gstRate: 18 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = items.find((it) => it.id === itemId);
    const updated = [...lines];
    updated[index].itemId = itemId;
    if (selectedItem) {
      updated[index].unitPrice = Number(selectedItem.sellingPrice || 0);
      updated[index].gstRate = Number(selectedItem.gstRate || 18);
    }
    setLines(updated);
  };

  const handleLineChange = (index: number, field: keyof InvoiceLineInput, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: Number(value) };
    setLines(updated);
  };

  // Tax calculations logic
  const isIntraState = placeOfSupply.trim().toLowerCase() === (companyState || 'Maharashtra').trim().toLowerCase();

  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  lines.forEach((line) => {
    const qty = line.quantity || 0;
    const price = line.unitPrice || 0;
    const disc = line.discount || 0;
    const gstRate = line.gstRate || 0;

    let gross = qty * price - disc;
    let taxable = gross;

    if (isTaxInclusive) {
      taxable = gross / (1 + gstRate / 100);
    }

    const taxAmount = (taxable * gstRate) / 100;
    if (isIntraState) {
      cgstTotal += taxAmount / 2;
      sgstTotal += taxAmount / 2;
    } else {
      igstTotal += taxAmount;
    }

    subtotal += taxable;
  });

  const grandTotalRaw = subtotal + cgstTotal + sgstTotal + igstTotal + (freightCharges || 0);
  const grandTotal = Math.round(grandTotalRaw);
  const roundOff = grandTotal - grandTotalRaw;

  const handleSubmit = async () => {
    if (!customerId) {
      setError('Please select a customer for the sales invoice');
      return;
    }
    if (lines.some((l) => !l.itemId || l.quantity <= 0)) {
      setError('Please select items and valid quantities for all line items');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const companyId = await getActiveCompanyId();
      const financialYearId = await getActiveFinancialYearId(companyId);

      const res = await api.post('/sales/invoices', {
        companyId,
        financialYearId,
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || undefined,
        customerId,
        placeOfSupply,
        isTaxInclusive,
        paymentMode,
        freightCharges,
        notes,
        lines,
      });

      router.push(`/sales/print/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create sales invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              New GST Sales Invoice
            </h1>
            <p className="text-xs text-slate-400">
              Double-entry accounting invoice voucher entry with automated tax calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-600/30 text-xs transition-all disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{loading ? 'Posting...' : 'Post & Approve Voucher (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Invoice Details Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
          Invoice & Party Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                Customer / Party <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddPartyModal(true)}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>+ Add Customer</span>
              </button>
            </div>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              disabled={dataLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-50"
            >
              <option value="">
                {dataLoading ? 'Loading customers from API...' : parties.length === 0 ? 'No customers found — Click + Add Customer' : 'Select Customer...'}
              </option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.gstin ? `(${p.gstin})` : ''} - {p.state || 'Maharashtra'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Place of Supply (State)
            </label>
            <input
              type="text"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="CREDIT">Credit (Accounts Receivable)</option>
              <option value="CASH">Cash Payment</option>
              <option value="BANK">Bank / UPI Transfer</option>
            </select>
          </div>

          <div className="flex items-center pt-6 space-x-2">
            <input
              type="checkbox"
              id="taxInclusive"
              checked={isTaxInclusive}
              onChange={(e) => setIsTaxInclusive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="taxInclusive" className="text-xs text-slate-300 font-medium cursor-pointer">
              Tax Inclusive Unit Prices
            </label>
          </div>
        </div>
      </div>

      {/* Item Line Items Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Line Items & Products
          </h2>
          <button
            onClick={handleAddLine}
            className="flex items-center space-x-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-1/3">Item SKU</th>
                <th className="py-2.5 px-3 w-24">Qty</th>
                <th className="py-2.5 px-3 w-32">Unit Price (₹)</th>
                <th className="py-2.5 px-3 w-28">Discount (₹)</th>
                <th className="py-2.5 px-3 w-28">GST Rate (%)</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {lines.map((line, idx) => {
                const gross = (line.quantity || 0) * (line.unitPrice || 0) - (line.discount || 0);
                const taxable = isTaxInclusive
                  ? gross / (1 + (line.gstRate || 0) / 100)
                  : gross;

                return (
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-2 px-3">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      >
                        <option value="">Select Item / SKU Master...</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} {it.sku ? `(SKU: ${it.sku})` : ''} - ₹{Number(it.sellingPrice || 0).toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={line.discount}
                        onChange={(e) => handleLineChange(idx, 'discount', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <select
                        value={line.gstRate}
                        onChange={(e) => handleLineChange(idx, 'gstRate', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      >
                        <option value={0}>0% GST</option>
                        <option value={5}>5% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST</option>
                        <option value={28}>28% GST</option>
                      </select>
                    </td>

                    <td className="py-2 px-3 text-right font-medium text-slate-200">
                      ₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length === 1}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Notes & Terms
          </h3>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter payment terms, bank details or internal notes..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          ></textarea>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 text-xs">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            Tax Calculation Summary
          </h3>

          <div className="flex justify-between text-slate-400 py-1">
            <span>Taxable Subtotal:</span>
            <span className="font-mono text-slate-200">
              ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {isIntraState ? (
            <>
              <div className="flex justify-between text-slate-400 py-1">
                <span>Central GST (CGST):</span>
                <span className="font-mono text-indigo-400">
                  ₹{cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 py-1">
                <span>State GST (SGST):</span>
                <span className="font-mono text-indigo-400">
                  ₹{sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-400 py-1">
              <span>Integrated GST (IGST):</span>
              <span className="font-mono text-indigo-400">
                ₹{igstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Freight & Shipping (₹):</span>
            <input
              type="number"
              min="0"
              value={freightCharges}
              onChange={(e) => setFreightCharges(Number(e.target.value))}
              className="w-28 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-between text-slate-400 py-1">
            <span>Round Off Adjustment:</span>
            <span className="font-mono text-slate-400">
              ₹{roundOff.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between font-bold text-sm text-slate-100 border-t border-slate-800 pt-3">
            <span>Grand Total:</span>
            <span className="text-emerald-400 font-mono text-base">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Add New Customer</h3>
                  <p className="text-[11px] text-slate-400">Quickly create a customer ledger account with GST details.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPartyModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  value={newPartyForm.name}
                  onChange={(e) => setNewPartyForm({ ...newPartyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27AABCU9603R1ZM"
                    value={newPartyForm.gstin}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State / Jurisdiction</label>
                  <select
                    value={newPartyForm.state}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Maharashtra">Maharashtra (27)</option>
                    <option value="Karnataka">Karnataka (29)</option>
                    <option value="Gujarat">Gujarat (24)</option>
                    <option value="Delhi">Delhi (07)</option>
                    <option value="Tamil Nadu">Tamil Nadu (33)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (09)</option>
                    <option value="Telangana">Telangana (36)</option>
                    <option value="West Bengal">West Bengal (19)</option>
                    <option value="Haryana">Haryana (06)</option>
                    <option value="Rajasthan">Rajasthan (08)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newPartyForm.phone}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="billing@company.com"
                    value={newPartyForm.email}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Billing / Shipping Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, City, Pincode"
                  value={newPartyForm.billingAddress}
                  onChange={(e) => setNewPartyForm({ ...newPartyForm, billingAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartyForm.creditLimit}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Credit Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPartyForm.creditDays}
                    onChange={(e) => setNewPartyForm({ ...newPartyForm, creditDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingParty || !newPartyForm.name.trim()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{creatingParty ? 'Saving...' : 'Save & Select Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}
