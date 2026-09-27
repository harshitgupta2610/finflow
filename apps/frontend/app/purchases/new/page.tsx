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
} from 'lucide-react';

interface PurchaseLineInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
}

export default function NewPurchaseInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parties, setParties] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [invoiceNumber, setInvoiceNumber] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra');
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CREDIT');
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [lines, setLines] = useState<PurchaseLineInput[]>([
    { itemId: '', quantity: 1, unitPrice: 0, discount: 0, gstRate: 18 },
  ]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [supplierId, lines, invoiceNumber, invoiceDate]);

  const fetchMasterData = async () => {
    try {
      const companyId = await getActiveCompanyId();

      const [partiesRes, itemsRes] = await Promise.all([
        api.get('/parties', { params: { companyId, type: 'SUPPLIER' } }).catch(() => ({ data: [] })),
        api.get('/items', { params: { companyId } }).catch(() => ({ data: [] })),
      ]);

      let partyList = partiesRes.data || [];
      if (partyList.length === 0) {
        const allPartiesRes = await api.get('/parties', { params: { companyId } }).catch(() => ({ data: [] }));
        partyList = allPartiesRes.data || [];
      }

      setParties(partyList);
      setItems(itemsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
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
      updated[index].unitPrice = Number(selectedItem.purchasePrice || 0);
      updated[index].gstRate = Number(selectedItem.gstRate || 18);
    }
    setLines(updated);
  };

  const handleLineChange = (index: number, field: keyof PurchaseLineInput, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: Number(value) };
    setLines(updated);
  };

  const isIntraState = placeOfSupply.trim().toLowerCase() === 'maharashtra';

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
    if (!supplierId) {
      setError('Please select a supplier for the purchase bill');
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

      await api.post('/purchases/invoices', {
        companyId,
        financialYearId,
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || undefined,
        supplierId,
        placeOfSupply,
        isTaxInclusive,
        paymentMode,
        freightCharges,
        notes,
        lines,
      });

      router.push('/purchases');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create purchase bill');
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
              New GST Purchase Bill
            </h1>
            <p className="text-xs text-slate-400">
              Record supplier purchase bill and compute Input Tax Credit (ITC).
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
            <span>{loading ? 'Posting...' : 'Post Purchase Bill (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bill Header Form */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
          Vendor & Bill Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Supplier / Vendor <span className="text-rose-400">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">Select Supplier...</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.gstin ? `(${p.gstin})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Vendor Bill Number
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
              Bill Date
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
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Purchased Products & Items
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
                            {it.name} {it.sku ? `(SKU: ${it.sku})` : ''} - ₹{Number(it.purchasePrice || 0).toLocaleString('en-IN')}
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

      {/* Bill Totals Summary */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-3 text-xs max-w-md ml-auto">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
          Purchase ITC Summary
        </h3>

        <div className="flex justify-between text-slate-400 py-1">
          <span>Taxable Subtotal:</span>
          <span className="font-mono text-slate-200">
            ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-slate-400 py-1">
          <span>Input GST Credit (ITC):</span>
          <span className="font-mono text-emerald-400">
            ₹{(cgstTotal + sgstTotal + igstTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between font-bold text-sm text-slate-100 border-t border-slate-800 pt-3">
          <span>Total Purchase Payable:</span>
          <span className="text-emerald-400 font-mono text-base">
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
