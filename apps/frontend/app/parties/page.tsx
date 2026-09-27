'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  Users,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export default function PartyMasterPage() {
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'CUSTOMER',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    address: '',
    state: 'Maharashtra',
    creditLimit: '100000',
    creditDays: '30',
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const res = await api.get('/parties', {
        params: { companyId },
      });
      setParties(res.data);
    } catch (err) {
      console.error('Failed to load parties', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const companyId = await getActiveCompanyId();

      await api.post('/parties', {
        companyId,
        name: formData.name,
        partyType: formData.type,
        type: formData.type,
        gstin: formData.gstin || undefined,
        pan: formData.pan || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        billingAddress: formData.address || undefined,
        address: formData.address || undefined,
        state: formData.state || 'Maharashtra',
        creditLimit: parseFloat(formData.creditLimit) || 0,
        creditDays: parseInt(formData.creditDays, 10) || 30,
      });

      setShowModal(false);
      setFormData({
        name: '',
        type: 'CUSTOMER',
        gstin: '',
        pan: '',
        phone: '',
        email: '',
        address: '',
        state: 'Maharashtra',
        creditLimit: '100000',
        creditDays: '30',
      });
      await fetchParties();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save party');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete party "${name}"?`)) return;
    try {
      const companyId = await getActiveCompanyId();
      await api.delete(`/parties/${id}?companyId=${companyId}`);
      await fetchParties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete party');
    }
  };

  const filteredParties = parties.filter((p) => {
    const pType = (p.partyType || p.type || 'CUSTOMER').toUpperCase();
    const matchesType =
      filterType === 'ALL' ||
      pType === filterType ||
      pType === 'BOTH';
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.gstin && p.gstin.toLowerCase().includes(search.toLowerCase())) ||
      (p.phone && p.phone.includes(search));
    return matchesType && matchesSearch;
  });

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
                <Users className="h-5 w-5 text-brand-400" />
                <h1 className="text-xl font-extrabold text-slate-100">Customer & Supplier Party Master</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage accounts receivable/payable parties, GSTIN/PAN records, credit limits, and addresses.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchParties}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Customer / Supplier</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            <div className="flex items-center space-x-2">
              {['ALL', 'CUSTOMER', 'SUPPLIER'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === t
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {t}S
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search party name, GSTIN, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Parties List Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Party Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">GSTIN & PAN</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">State</th>
                  <th className="pb-3 text-right">Credit Limit</th>
                  <th className="pb-3 text-right">Credit Days</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      Loading party records...
                    </td>
                  </tr>
                ) : filteredParties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No parties found. Click "Add Customer / Supplier" to register one.
                    </td>
                  </tr>
                ) : (
                  filteredParties.map((party) => (
                    <tr key={party.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-200">{party.name}</div>
                        <div className="text-[10px] text-slate-500">{party.email || 'No email'}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (party.partyType || party.type) === 'CUSTOMER'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : (party.partyType || party.type) === 'SUPPLIER'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {party.partyType || party.type || 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        <div className="text-slate-200">{party.gstin || 'UNREGISTERED'}</div>
                        {party.pan && <div className="text-slate-500 text-[10px]">PAN: {party.pan}</div>}
                      </td>
                      <td className="py-3 text-slate-300">{party.phone || 'N/A'}</td>
                      <td className="py-3 text-slate-400">{party.state || 'Maharashtra'}</td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        ₹{Number(party.creditLimit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">
                        {party.creditDays || 30} Days
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <Link
                          href="/reports"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 text-[11px] font-medium border border-slate-700"
                        >
                          Ledger
                        </Link>
                        <button
                          onClick={() => handleDelete(party.id, party.name)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Party"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Party Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-brand-400" />
                <h3 className="font-bold text-sm text-slate-100">Add Customer / Supplier Master</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Party Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Apex Global Trading Pvt Ltd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Party Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="CUSTOMER">Customer (Debtor)</option>
                    <option value="SUPPLIER">Supplier (Creditor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State / Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-brand-500"
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PAN (10 Digits)
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-brand-500"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="accounts@apex.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Credit Period (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.creditDays}
                    onChange={(e) => setFormData({ ...formData, creditDays: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Billing / Shipping Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="Plot / Street / City / Pincode"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Party'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
