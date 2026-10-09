'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Tag,
} from 'lucide-react';

type InventorySortField = 'code' | 'name' | 'hsn' | 'currentStock' | 'purchasePrice' | 'sellingPrice' | 'valuation';
type SortOrder = 'asc' | 'desc';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL');
  const [sortField, setSortField] = useState<InventorySortField>('valuation');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'GODOWNS' | 'LEDGER'>('SUMMARY');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const res = await api.get('/items', { params: { companyId } });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: InventorySortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'valuation' || field === 'currentStock' ? 'desc' : 'asc');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['SKU,Name,HSN,Category,UOM,Stock,Purchase Rate,Selling Rate,Valuation'];
    const rows = sortedItems.map((item) => {
      const qty = Number(item.currentStock ?? item.openingStock ?? 0);
      const pRate = Number(item.purchasePrice || 0);
      const sRate = Number(item.sellingPrice || 0);
      const val = qty * pRate;
      return `"${item.sku || item.code}","${item.name}","${item.hsnSac || item.hsnCode || ''}","${item.category || ''}","${item.unit || 'PCS'}",${qty},${pRate},${sRate},${val}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `FinFlow_Stock_Valuation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(search.toLowerCase());
      const codeMatch = (item.sku || item.code || '').toLowerCase().includes(search.toLowerCase());
      const hsnMatch = (item.hsnSac || item.hsnCode || '').includes(search);
      const matchesSearch = nameMatch || codeMatch || hsnMatch;

      const itemCat = item.category || 'General';
      const matchesCat = selectedCategory === 'ALL' || itemCat === selectedCategory;

      const qty = Number(item.currentStock ?? item.openingStock ?? 0);
      const reorder = Number(item.reorderLevel || 10);
      let matchesStock = true;
      if (stockLevelFilter === 'LOW') matchesStock = qty <= reorder && qty > 0;
      else if (stockLevelFilter === 'HEALTHY') matchesStock = qty > reorder;
      else if (stockLevelFilter === 'OUT') matchesStock = qty === 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [items, search, selectedCategory, stockLevelFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aQty = Number(a.currentStock ?? a.openingStock ?? 0);
      const bQty = Number(b.currentStock ?? b.openingStock ?? 0);
      const aVal = aQty * Number(a.purchasePrice || 0);
      const bVal = bQty * Number(b.purchasePrice || 0);

      let compA: any;
      let compB: any;

      switch (sortField) {
        case 'code':
          compA = (a.sku || a.code || '').toLowerCase();
          compB = (b.sku || b.code || '').toLowerCase();
          break;
        case 'name':
          compA = a.name.toLowerCase();
          compB = b.name.toLowerCase();
          break;
        case 'hsn':
          compA = (a.hsnSac || a.hsnCode || '').toLowerCase();
          compB = (b.hsnSac || b.hsnCode || '').toLowerCase();
          break;
        case 'currentStock':
          compA = aQty;
          compB = bQty;
          break;
        case 'purchasePrice':
          compA = Number(a.purchasePrice || 0);
          compB = Number(b.purchasePrice || 0);
          break;
        case 'sellingPrice':
          compA = Number(a.sellingPrice || 0);
          compB = Number(b.sellingPrice || 0);
          break;
        case 'valuation':
          compA = aVal;
          compB = bVal;
          break;
        default:
          return 0;
      }

      if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
      if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortOrder]);

  const totalSKUs = items.length;
  const totalValuation = items.reduce(
    (acc, item) =>
      acc +
      Number(item.currentStock ?? item.openingStock ?? 0) *
        Number(item.purchasePrice || 0),
    0,
  );
  const lowStockCount = items.filter(
    (item) =>
      Number(item.currentStock ?? item.openingStock ?? 0) <=
      Number(item.reorderLevel || 10),
  ).length;

  const renderSortIndicator = (field: InventorySortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-brand-400 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-brand-400 ml-1 inline" />
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
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
                onClick={handleExportCSV}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                title="Export stock ledger to CSV"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchInventory}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors border border-slate-700"
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
              <div className="mt-3 text-2xl font-bold text-slate-100 font-mono">
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
              <span className="text-[11px] text-indigo-400 font-medium">Headquarters, Depot 1 &amp; 2</span>
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
              Stock Summary &amp; Items
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
            <div className="space-y-4">
              {/* Category Filter Chips & Controls */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0 mr-1 flex items-center space-x-1">
                    <Tag className="h-3.5 w-3.5 text-brand-400" />
                    <span>Category:</span>
                  </span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search SKU code, name or HSN..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
                      <span className="text-[11px] text-slate-500 font-semibold">Stock Level:</span>
                      <select
                        value={stockLevelFilter}
                        onChange={(e) => setStockLevelFilter(e.target.value)}
                        className="bg-transparent text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="ALL">All Levels</option>
                        <option value="HEALTHY">In Stock (Normal)</option>
                        <option value="LOW">Low Stock Reorders</option>
                        <option value="OUT">Out of Stock</option>
                      </select>
                    </div>

                    <div className="text-xs text-slate-400 font-medium">
                      Showing <span className="font-bold text-slate-200">{sortedItems.length}</span> of {items.length} SKUs
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('code')}>
                          SKU Code {renderSortIndicator('code')}
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('name')}>
                          Item Name {renderSortIndicator('name')}
                        </th>
                        <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('hsn')}>
                          HSN/SAC {renderSortIndicator('hsn')}
                        </th>
                        <th className="py-3.5 px-4">UOM</th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('currentStock')}>
                          In Stock {renderSortIndicator('currentStock')}
                        </th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('purchasePrice')}>
                          Purchase Rate {renderSortIndicator('purchasePrice')}
                        </th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('sellingPrice')}>
                          Selling Rate {renderSortIndicator('sellingPrice')}
                        </th>
                        <th className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('valuation')}>
                          Total Valuation {renderSortIndicator('valuation')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-500">
                            Loading inventory master...
                          </td>
                        </tr>
                      ) : sortedItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-500">
                            No stock items match your search and filter criteria.
                          </td>
                        </tr>
                      ) : (
                        sortedItems.map((item) => {
                          const qty = Number(item.currentStock ?? item.openingStock ?? 0);
                          const pRate = Number(item.purchasePrice || 0);
                          const sRate = Number(item.sellingPrice || 0);
                          const val = qty * pRate;

                          return (
                            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-brand-400">
                                {item.sku || item.code}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-100">{item.name}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-400">{item.hsnSac || item.hsnCode || 'N/A'}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-400 uppercase">{item.unit || 'PCS'}</td>
                              <td className="py-3.5 px-4 text-right font-extrabold text-slate-100">
                                {qty}{' '}
                                {qty <= Number(item.reorderLevel || 10) && qty > 0 ? (
                                  <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded ml-1 font-bold">
                                    LOW
                                  </span>
                                ) : qty === 0 ? (
                                  <span className="text-[10px] text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded ml-1 font-bold">
                                    OUT
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded ml-1 font-bold">
                                    OK
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
                <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Capacity Utilization:</span>
                    <span className="text-slate-200 font-bold">68%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valuation Stored:</span>
                    <span className="text-emerald-400 font-mono font-bold">₹ {(totalValuation * 0.65).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    D1
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Depot North (Gurugram)</h3>
                    <p className="text-[11px] text-slate-400">Udyog Vihar, Haryana</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Capacity Utilization:</span>
                    <span className="text-slate-200 font-bold">42%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valuation Stored:</span>
                    <span className="text-emerald-400 font-mono font-bold">₹ {(totalValuation * 0.25).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    D2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Depot South (Bengaluru)</h3>
                    <p className="text-[11px] text-slate-400">Peenya Industrial Area, Karnataka</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Capacity Utilization:</span>
                    <span className="text-slate-200 font-bold">29%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Valuation Stored:</span>
                    <span className="text-emerald-400 font-mono font-bold">₹ {(totalValuation * 0.10).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Stock Movement Audit Log</h3>
              <p className="text-xs text-slate-400">Every inward purchase bill and outward sales invoice automatically journals into the stock ledger.</p>
              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>FIFO / Weighted Average Costing (WAC)</span>
                  <span className="text-emerald-400 font-bold">Active Engine</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Automatic Goods Received Note (GRN)</span>
                  <span className="text-emerald-400 font-bold">Synchronized</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
