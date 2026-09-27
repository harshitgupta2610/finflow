'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

const mockParties = [
  {
    id: 'p1',
    name: 'Apex Trading Co',
    type: 'CUSTOMER',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    phone: '+91 98765 43210',
    email: 'accounts@apextrading.com',
    state: 'Maharashtra',
    outstanding: '₹ 1,85,000.00',
    creditLimit: '₹ 5,00,000.00',
    creditDays: 30,
  },
  {
    id: 'p2',
    name: 'Zenith Retailers Ltd',
    type: 'CUSTOMER',
    gstin: '24XYZAB5678G1Z2',
    pan: 'XYZAB5678G',
    phone: '+91 98220 11223',
    email: 'billing@zenith.in',
    state: 'Gujarat',
    outstanding: '₹ 45,000.00',
    creditLimit: '₹ 2,00,000.00',
    creditDays: 15,
  },
  {
    id: 'p3',
    name: 'Mahalaxmi Steel Suppliers',
    type: 'SUPPLIER',
    gstin: '27MMMKL9988H1Z9',
    pan: 'MMMKL9988H',
    phone: '+91 94230 44556',
    email: 'sales@mahalaxmisteel.com',
    state: 'Maharashtra',
    outstanding: '₹ 2,20,000.00',
    creditLimit: '₹ 10,00,000.00',
    creditDays: 45,
  },
  {
    id: 'p4',
    name: 'Global Freight & Logistics',
    type: 'SUPPLIER',
    gstin: '07AAACG1122P1Z0',
    pan: 'AAACG1122P',
    phone: '+91 99100 88776',
    email: 'info@globalfreight.com',
    state: 'Delhi',
    outstanding: '₹ 12,400.00',
    creditLimit: '₹ 1,00,000.00',
    creditDays: 30,
  },
];

export default function PartyMasterPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    partyType: 'CUSTOMER',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    state: 'Maharashtra',
    creditLimit: '100000',
    creditDays: '30',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Party "${formData.name}" created successfully!`);
    setShowModal(false);
  };

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
                  <th className="pb-3 text-right">Outstanding</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockParties
                  .filter((p) => filterType === 'ALL' || p.type === filterType)
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      p.gstin.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((party) => (
                    <tr key={party.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-200">{party.name}</div>
                        <div className="text-[10px] text-slate-500">{party.email}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            party.type === 'CUSTOMER'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {party.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        <div className="text-slate-200">{party.gstin}</div>
                        <div className="text-slate-500 text-[10px]">PAN: {party.pan}</div>
                      </td>
                      <td className="py-3 text-slate-300">{party.phone}</td>
                      <td className="py-3 text-slate-400">{party.state}</td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {party.creditLimit}
                        <div className="text-[10px] text-slate-500">{party.creditDays} Days</div>
                      </td>
                      <td className="py-3 text-right font-mono font-extrabold text-slate-100">
                        {party.outstanding}
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 text-[11px] font-medium border border-slate-700">
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Party Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-card shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-100">Add New Party (Customer/Supplier)</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Party Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Trading Co"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Party Type *</label>
                      <select
                        value={formData.partyType}
                        onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SUPPLIER">SUPPLIER</option>
                        <option value="BOTH">BOTH</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">State *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">GSTIN (15 Digits)</label>
                      <input
                        type="text"
                        placeholder="27ABCDE1234F1Z5"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">PAN (10 Digits)</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Credit Limit (₹)</label>
                      <input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Party Master</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
