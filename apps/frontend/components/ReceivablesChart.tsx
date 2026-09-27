'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const agingData = [
  { range: '0-15 Days', receivables: 320000, payables: 180000 },
  { range: '16-30 Days', receivables: 140000, payables: 120000 },
  { range: '31-60 Days', receivables: 110000, payables: 50000 },
  { range: '61-90 Days', receivables: 45000, payables: 20000 },
  { range: '>90 Days', receivables: 30200, payables: 10000 },
];

export function ReceivablesChart() {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Receivables & Payables Ageing Analysis</h3>
          <p className="text-xs text-slate-400">Outstanding duration analysis for working capital optimization</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Receivables</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Payables</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={agingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(val: number) => [`₹ ${val.toLocaleString('en-IN')}`, '']}
            />
            <Bar dataKey="receivables" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Receivables" />
            <Bar dataKey="payables" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Payables" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
