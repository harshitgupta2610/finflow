'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  ShieldCheck,
  Search,
  User,
  Clock,
  Activity,
  Lock,
  Building2,
  Filter,
} from 'lucide-react';

const mockAuditLogs = [
  {
    id: 'log-109',
    action: 'VOUCHER_CREATE',
    entity: 'Voucher',
    entityId: 'VOUCH-2026-101',
    user: 'System Admin (admin@finflow.com)',
    details: 'Posted balanced Journal Entry VOUCH-2026-101 (Debit ₹5,000 / Credit ₹5,000)',
    ip: '127.0.0.1',
    timestamp: 'Today, 03:15 PM',
  },
  {
    id: 'log-108',
    action: 'PARTY_CREATE',
    entity: 'Party',
    entityId: 'p1',
    user: 'System Admin (admin@finflow.com)',
    details: 'Created Customer Master "Apex Trading Co" with GSTIN 27ABCDE1234F1Z5',
    ip: '127.0.0.1',
    timestamp: 'Today, 02:40 PM',
  },
  {
    id: 'log-107',
    action: 'ITEM_CREATE',
    entity: 'Item',
    entityId: 'i1',
    user: 'System Admin (admin@finflow.com)',
    details: 'Created Item SKU "VALVE-BRASS-05" (18% GST, Selling Price ₹650.00)',
    ip: '127.0.0.1',
    timestamp: 'Today, 01:20 PM',
  },
  {
    id: 'log-106',
    action: 'AUTH_LOGIN_SUCCESS',
    entity: 'User',
    entityId: 'u1',
    user: 'System Admin (admin@finflow.com)',
    details: 'Authenticated user session and issued JWT Access & Refresh Tokens',
    ip: '127.0.0.1',
    timestamp: 'Today, 01:05 PM',
  },
];

export default function AuditLogsPage() {
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
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h1 className="text-xl font-extrabold text-slate-100">Immutable Mutation Audit Logs</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time security and financial audit trail recording user mutations, IP addresses, and state diffs.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter logs by action, user, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card space-y-3">
            {mockAuditLogs
              .filter(
                (l) =>
                  l.action.toLowerCase().includes(search.toLowerCase()) ||
                  l.details.toLowerCase().includes(search.toLowerCase()) ||
                  l.user.toLowerCase().includes(search.toLowerCase()),
              )
              .map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-brand-400 border border-slate-700 mt-0.5">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-200">{log.action}</span>
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 font-mono px-1.5 py-0.5 rounded">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">{log.details}</p>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-3 mt-1 font-mono">
                        <span>User: {log.user}</span>
                        <span>•</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                    {log.timestamp}
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
