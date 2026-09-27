'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'GODOWNS' | 'LEDGER'>('SUMMARY');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('finflow_company_id');
      if (!companyId) return;

      const res = await api.get('/items', { params: { companyId } });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      (item.hsnCode && item.hsnCode.includes(search)),
  );

  const totalSKUs = items.length;
  const totalValuation = items.reduce(
    (acc, item) => acc + Number(item.openingStock || 0) * Number(item.purchasePrice || 0),
    0,
  );
  const lowStockCount = items.filter(
    (item) => Number(item.openingStock || 0) <= Number(item.reorderLevel || 10),
  ).length;

  return (
    <div className="p-8 space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Inventory & Stock Valuation
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time stock ledger, godown warehouse management, valuation (FIFO/WAC), and reorder alerts.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInventory}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Inventory Valuation</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">
            ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Weighted Average Cost (WAC)</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Stock SKUs</span>
            <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">{totalSKUs} SKUs</div>
          <span className="text-[11px] text-slate-400 font-medium">Across all product categories</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Low Stock Reorder Alerts</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-400">{lowStockCount} SKUs</div>
          <span className="text-[11px] text-amber-500 font-medium">Stock at or below reorder limit</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Godowns / Warehouses</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Warehouse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-100">3 Locations</div>
          <span className="text-[11px] text-indigo-400 font-medium">Headquarters, Depot 1 & 2</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'SUMMARY'
              ? 'border-brand-500 text-brand-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Summary & Items
        </button>
        <button
          onClick={() => setActiveTab('GODOWNS')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'GODOWNS'
              ? 'border-brand-500 text-brand-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Godown Distribution
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'LEDGER'
              ? 'border-brand-500 text-brand-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Movement Journal
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'SUMMARY' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU code, name or HSN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">SKU Code</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">HSN/SAC</th>
                  <th className="py-3.5 px-4">UOM</th>
                  <th className="py-3.5 px-4 text-right">In Stock</th>
                  <th className="py-3.5 px-4 text-right">Purchase Rate</th>
                  <th className="py-3.5 px-4 text-right">Selling Rate</th>
                  <th className="py-3.5 px-4 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      Loading inventory master...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No stock items match your search.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const qty = Number(item.openingStock || 0);
                    const pRate = Number(item.purchasePrice || 0);
                    const sRate = Number(item.sellingPrice || 0);
                    const val = qty * pRate;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-brand-400">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-100">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{item.hsnCode || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 uppercase">{item.unit || 'PCS'}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-100">
                          {qty}{' '}
                          {qty <= Number(item.reorderLevel || 10) && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded ml-1 font-normal">
                              LOW
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">₹{pRate.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400">₹{sRate.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-100">
                          ₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'GODOWNS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                HO
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Head Office Main Warehouse</h3>
                <p className="text-[11px] text-slate-400">BKC, Mumbai, Maharashtra</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Occupancy:</span>
                <span className="font-bold text-emerald-400">65% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Items Stored:</span>
                <span className="font-mono">850 SKUs</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                WD
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Western Logistics Depot</h3>
                <p className="text-[11px] text-slate-400">Bhiwandi Hub, Thane</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Occupancy:</span>
                <span className="font-bold text-emerald-400">42% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Items Stored:</span>
                <span className="font-mono">420 SKUs</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                RS
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Regional Store Depot</h3>
                <p className="text-[11px] text-slate-400">GIDC Industrial Park, Gujarat</p>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Occupancy:</span>
                <span className="font-bold text-amber-400">88% Capacity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Items Stored:</span>
                <span className="font-mono">150 SKUs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LEDGER' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 text-xs text-slate-300 space-y-3">
          <h3 className="font-bold text-slate-100 text-sm mb-3">Audit Trails & Inward / Outward Stock Log</h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-100">Industrial Brass Valve 1/2" (ITEM-8041)</span>
                <span className="block text-[11px] text-slate-500">Voucher INV-2026-089 • Sales Outward</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-rose-400">- 10 PCS</span>
                <span className="block text-[10px] text-slate-500">HO Main Warehouse</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-100">Synthetic Hydraulic Fluid 5L (ITEM-5022)</span>
                <span className="block text-[11px] text-slate-500">Voucher PUR-2026-042 • Purchase Inward</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">+ 50 CAN</span>
                <span className="block text-[10px] text-slate-500">Western Logistics Depot</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
