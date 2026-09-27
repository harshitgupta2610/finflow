'use client';

import React from 'react';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';

const lowStockItems = [
  { sku: 'ITEM-8041', name: 'Industrial Brass Valve 1/2"', current: 8, reorder: 25, unit: 'PCS' },
  { sku: 'ITEM-5022', name: 'Synthetic Hydraulic Fluid 5L', current: 3, reorder: 15, unit: 'CAN' },
  { sku: 'ITEM-1049', name: 'Copper Wiring Cable 1.5mm', current: 12, reorder: 50, unit: 'MTR' },
];

export function LowStockWidget() {
  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-bold text-slate-100">Low Stock Reorder Alerts</h3>
        </div>
        <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1">
          <span>Create PO</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-slate-200">{item.name}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {item.sku}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-extrabold text-orange-400">
                {item.current} {item.unit} left
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Reorder at {item.reorder} {item.unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
