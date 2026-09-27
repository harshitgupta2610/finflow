'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const data = [
  { month: 'Apr', sales: 1850000, purchase: 1100000, profit: 750000 },
  { month: 'May', sales: 2100000, purchase: 1350000, profit: 750000 },
  { month: 'Jun', sales: 1950000, purchase: 1200000, profit: 750000 },
  { month: 'Jul', sales: 2400000, purchase: 1500000, profit: 900000 },
  { month: 'Aug', sales: 2650000, purchase: 1600000, profit: 1050000 },
  { month: 'Sep', sales: 2485400, purchase: 1420000, profit: 1065400 },
];

export function SalesTrendChart() {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Financial Revenue & Purchase Trend</h3>
          <p className="text-xs text-slate-400">Monthly breakdown of Sales, Purchases & Net Profit (INR ₹)</p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-brand-500"></span>
            <span className="text-slate-300">Sales</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Purchases</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
            <span className="text-slate-300">Gross Profit</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0c8de9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0c8de9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`₹ ${value.toLocaleString('en-IN')}`, '']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#0c8de9"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Sales Revenue"
            />
            <Area
              type="monotone"
              dataKey="purchase"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPurchase)"
              name="Purchase Expense"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Gross Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
