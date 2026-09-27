'use client';

import React from 'react';
import { Clock, Send, AlertCircle } from 'lucide-react';

const overdueList = [
  {
    customer: 'Vanguard Tech Solutions',
    invoiceNo: 'INV-2026-084',
    amount: '₹ 85,000.00',
    daysOverdue: 42,
    salesman: 'Rahul Sharma',
  },
  {
    customer: 'Shree Balaji Enterprises',
    invoiceNo: 'INV-2026-091',
    amount: '₹ 62,400.00',
    daysOverdue: 35,
    salesman: 'Amit Patel',
  },
  {
    customer: 'Kaveri Logistics',
    invoiceNo: 'INV-2026-098',
    amount: '₹ 37,600.00',
    daysOverdue: 31,
    salesman: 'Rahul Sharma',
  },
];

export function OverdueInvoicesWidget() {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100">Critical Overdue Invoices</h3>
        </div>
        <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
          Send Payment Reminders
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="pb-2">Customer</th>
              <th className="pb-2">Invoice No</th>
              <th className="pb-2 text-right">Amount</th>
              <th className="pb-2 text-center">Overdue</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {overdueList.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 font-bold text-slate-200">{item.customer}</td>
                <td className="py-2.5 font-mono text-slate-400">{item.invoiceNo}</td>
                <td className="py-2.5 text-right font-extrabold text-slate-100">{item.amount}</td>
                <td className="py-2.5 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.daysOverdue} Days
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="p-1 rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/40 inline-flex items-center space-x-1 text-[10px]">
                    <Send className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
