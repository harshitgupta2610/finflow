'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Building2,
  Calendar,
  Users,
  Lock,
  CheckCircle2,
  Save,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('FinFlow Enterprise Ltd');
  const [gstin, setGstin] = useState('27AABCF1234H1Z5');
  const [pan, setPan] = useState('AABCF1234H');
  const [address, setAddress] = useState('Plot 42, FinTech Cyber City, BKC');
  const [state, setState] = useState('Maharashtra');
  const [financialYear, setFinancialYear] = useState('FY 2026-27');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Company configuration & tax settings updated successfully!');
      setTimeout(() => setSuccess(null), 4000);
    }, 800);
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            System & Company Settings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure multi-company organization details, financial year locking, and RBAC user permissions.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-xs font-medium shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Company Profile Settings */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <Building2 className="h-5 w-5 text-brand-400" />
          <h2 className="text-sm font-bold text-slate-100">Company Legal Details & GSTIN</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Legal Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              GSTIN Registration Number
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              PAN Number
            </label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              State / Location
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Registered Office Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Financial Year Lock */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <Calendar className="h-5 w-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100">Financial Year Management & Audit Locks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">
              Active Financial Period
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="FY 2026-27">FY 2026-27 (01 Apr 2026 - 31 Mar 2027)</option>
              <option value="FY 2025-26">FY 2025-26 (Locked & Audited)</option>
            </select>
          </div>

          <div className="flex items-center pt-6 space-x-2">
            <input
              type="checkbox"
              id="lockFy"
              defaultChecked
              className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="lockFy" className="text-slate-300 font-medium cursor-pointer">
              Enforce Strict Double-Entry Balance Check (`SUM(debit) == SUM(credit)`)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
