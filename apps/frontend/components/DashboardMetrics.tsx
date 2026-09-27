'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  Package,
  AlertTriangle,
  Receipt,
  Clock,
} from 'lucide-react';

export function DashboardMetrics() {
  const metrics = [
    {
      title: "Today's Sales",
      value: '₹ 1,48,500.00',
      change: '+14.2%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Monthly Sales (Sept 2026)',
      value: '₹ 24,85,400.00',
      change: '+8.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-brand-500/20 to-blue-500/10 border-brand-500/30 text-brand-400',
    },
    {
      title: 'Monthly Purchases',
      value: '₹ 14,20,000.00',
      change: '-2.1%',
      isPositive: true,
      icon: TrendingDown,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Gross Profit Margin',
      value: '₹ 10,65,400.00',
      change: '42.8%',
      isPositive: true,
      icon: ArrowUpRight,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Accounts Receivable',
      value: '₹ 6,45,200.00',
      change: '14 Customers',
      isPositive: false,
      icon: ArrowUpRight,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Accounts Payable',
      value: '₹ 3,80,000.00',
      change: '8 Suppliers',
      isPositive: true,
      icon: ArrowDownRight,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    },
    {
      title: 'Cash & Cash Equivalents',
      value: '₹ 2,15,400.00',
      change: 'Petty + Vault',
      isPositive: true,
      icon: CreditCard,
      color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Bank Balance (HDFC / ICICI)',
      value: '₹ 18,45,900.00',
      change: 'Reconciled',
      isPositive: true,
      icon: Building,
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
    },
    {
      title: 'Total Inventory Valuation',
      value: '₹ 32,10,000.00',
      change: '1,420 SKUs',
      isPositive: true,
      icon: Package,
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    },
    {
      title: 'Low Stock Alert Items',
      value: '12 SKUs',
      change: 'Action Required',
      isPositive: false,
      icon: AlertTriangle,
      color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400',
    },
    {
      title: 'Overdue Receivables',
      value: '₹ 1,85,000.00',
      change: '>30 Days Overdue',
      isPositive: false,
      icon: Clock,
      color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400',
    },
    {
      title: 'GST Net Liability (Output - Input)',
      value: '₹ 1,92,450.00',
      change: 'GSTR-3B Due Oct 20',
      isPositive: false,
      icon: Receipt,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl bg-gradient-to-br ${m.color} border glass-card glass-card-hover flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">{m.title}</span>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-100 tracking-tight">{m.value}</div>
              <div className="flex items-center space-x-1.5 mt-1 text-[11px]">
                <span className={`font-semibold ${m.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.change}
                </span>
                <span className="text-slate-500">vs previous period</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
