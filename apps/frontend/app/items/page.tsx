'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api, getActiveCompanyId } from '../../lib/api';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  Package,
  Plus,
  Search,
  Tag,
  Percent,
  TrendingUp,
  AlertTriangle,
  Boxes,
  X,
  Save,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
} from 'lucide-react';

type ItemSortField = 'name' | 'code' | 'category' | 'currentStock' | 'purchasePrice' | 'sellingPrice' | 'gstRate';
type SortOrder = 'asc' | 'desc';

export default function ItemMasterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [gstFilter, setGstFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<ItemSortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    hsnSac: '8481.80.20',
    category: 'Hardware & Fittings',
    unit: 'PCS',
    gstRate: '18',
    purchasePrice: '0.00',
    sellingPrice: '0.00',
    mrp: '0.00',
    reorderLevel: '10',
    openingStock: '0',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setShowModal(true);
      }
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const companyId = await getActiveCompanyId();

      const res = await api.get('/items', {
        params: { companyId },
      });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load item records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const companyId = await getActiveCompanyId();

      await api.post('/items', {
        companyId,
        name: formData.name,
        sku: formData.sku,
        hsnSac: formData.hsnSac || undefined,
        category: formData.category || undefined,
        unit: formData.unit || 'PCS',
        gstRate: parseFloat(formData.gstRate) || 18,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        reorderLevel: parseFloat(formData.reorderLevel) || 10,
        openingStock: parseFloat(formData.openingStock) || 0,
      });

      setShowModal(false);
      setFormData({
        name: '',
        sku: '',
        hsnSac: '8481.80.20',
        category: 'Hardware & Fittings',
        unit: 'PCS',
        gstRate: '18',
        purchasePrice: '0.00',
        sellingPrice: '0.00',
        mrp: '0.00',
        reorderLevel: '10',
        openingStock: '0',
      });
      await fetchItems();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save item SKU');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete SKU "${name}"?`)) return;
    try {
      const companyId = await getActiveCompanyId();
      await api.delete(`/items/${id}?companyId=${companyId}`);
      await fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete item SKU');
    }
  };

  const handleSort = (field: ItemSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Item Name,SKU,HSN,Category,UOM,GST Rate,Purchase Price,Selling Price,Stock,Stock Value'];
    const rows = sortedItems.map(item => {
      const stock = Number(item.currentStock ?? item.openingStock ?? 0);
      const val = stock * Number(item.purchasePrice || 0);
      return `"${item.name}","${item.code || item.sku}","${item.hsnCode || item.hsnSac || ''}","${item.category || ''}","${item.unit || 'PCS'}",${item.gstRate},${item.purchasePrice},${item.sellingPrice},${stock},${val}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `FinFlow_Items_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemCat = item.category || 'General';
      const matchesCat = selectedCategory === 'ALL' || itemCat === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        ((item.sku || item.code || '').toLowerCase().includes(search.toLowerCase())) ||
        ((item.hsnSac || item.hsnCode || '').includes(search));

      const stock = Number(item.currentStock ?? item.openingStock ?? 0);
      const reorder = Number(item.reorderLevel || 10);
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') matchesStock = stock > reorder;
      else if (stockFilter === 'LOW_STOCK') matchesStock = stock <= reorder && stock > 0;
      else if (stockFilter === 'OUT_OF_STOCK') matchesStock = stock === 0;

      let matchesGst = true;
      if (gstFilter !== 'ALL') {
        matchesGst = Number(item.gstRate).toString() === gstFilter;
      }

      return matchesCat && matchesSearch && matchesStock && matchesGst;
    });
  }, [items, selectedCategory, search, stockFilter, gstFilter]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'code':
          aVal = (a.code || a.sku || '').toLowerCase();
          bVal = (b.code || b.sku || '').toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'currentStock':
          aVal = Number(a.currentStock ?? a.openingStock ?? 0);
          bVal = Number(b.currentStock ?? b.openingStock ?? 0);
          break;
        case 'purchasePrice':
          aVal = Number(a.purchasePrice || 0);
          bVal = Number(b.purchasePrice || 0);
          break;
        case 'sellingPrice':
          aVal = Number(a.sellingPrice || 0);
          bVal = Number(b.sellingPrice || 0);
          break;
        case 'gstRate':
          aVal = Number(a.gstRate || 0);
          bVal = Number(b.gstRate || 0);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortOrder]);

  const renderSortIndicator = (field: ItemSortField) => {
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
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-brand-400" />
                <h1 className="text-xl font-extrabold text-slate-100">Item Master & Inventory Catalog</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage SKUs, HSN/SAC codes, GST slab rates, units of measure, purchase/selling pricing, and reorder levels.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-800"
                title="Export catalog to CSV"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchItems}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
                title="Shortcut: Alt+N"
              >
                <Plus className="h-4 w-4" />
                <span>New Item SKU (Alt+N)</span>
              </button>
            </div>
          </div>

          {/* Filtering & Sorting Controls Bar */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            {/* Category Tabs */}
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

            {/* Sub-Filters: Search, Stock Status, GST Slab */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search item, SKU, or HSN code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
                {/* Stock Level Filter */}
                <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold">Stock:</span>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="IN_STOCK">In Stock (Healthy)</option>
                    <option value="LOW_STOCK">Low Stock (≤ Reorder)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                {/* GST Slab Filter */}
                <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                  <span className="text-[11px] text-slate-500 font-semibold">GST Slab:</span>
                  <select
                    value={gstFilter}
                    onChange={(e) => setGstFilter(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Slabs</option>
                    <option value="0">0% Exempt</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-medium ml-auto md:ml-0">
                  Showing <span className="font-bold text-slate-200">{sortedItems.length}</span> of {items.length} SKUs
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('name')}>
                    Item Name {renderSortIndicator('name')}
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('code')}>
                    SKU & HSN {renderSortIndicator('code')}
                  </th>
                  <th className="pb-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('category')}>
                    Category {renderSortIndicator('category')}
                  </th>
                  <th className="pb-3">UOM</th>
                  <th className="pb-3 text-center cursor-pointer hover:text-slate-200" onClick={() => handleSort('gstRate')}>
                    GST Slab {renderSortIndicator('gstRate')}
                  </th>
                  <th className="pb-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('purchasePrice')}>
                    Purchase (₹) {renderSortIndicator('purchasePrice')}
                  </th>
                  <th className="pb-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('sellingPrice')}>
                    Selling (₹) {renderSortIndicator('sellingPrice')}
                  </th>
                  <th className="pb-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('currentStock')}>
                    Current Stock {renderSortIndicator('currentStock')}
                  </th>
                  <th className="pb-3 text-right">Stock Valuation</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500">
                      Loading item catalog...
                    </td>
                  </tr>
                ) : sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500">
                      No SKU items match the filters. Click "New Item SKU" or reset filters.
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => {
                    const currentStock = Number(item.currentStock ?? item.openingStock ?? 0);
                    const reorderLevel = Number(item.reorderLevel || 10);
                    const isLow = currentStock <= reorderLevel && currentStock > 0;
                    const isZero = currentStock === 0;
                    const valuation = currentStock * Number(item.purchasePrice || 0);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-200">{item.name}</div>
                        </td>
                        <td className="py-3 font-mono text-[11px]">
                          <div className="text-brand-400 font-bold">{item.code || item.sku}</div>
                          <div className="text-slate-500 text-[10px]">HSN: {item.hsnCode || item.hsnSac || 'N/A'}</div>
                        </td>
                        <td className="py-3 text-slate-400">{item.category || 'General'}</td>
                        <td className="py-3 font-mono text-slate-400 uppercase">{item.unit || 'PCS'}</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {Number(item.gstRate)}% GST
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-300">
                          ₹{Number(item.purchasePrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          ₹{Number(item.sellingPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono font-extrabold text-slate-100">
                          {currentStock}{' '}
                          {isZero ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 ml-1">
                              OUT
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-1">
                              LOW
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ml-1">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-300">
                          ₹{valuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Item SKU"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-brand-400" />
                <h3 className="font-bold text-sm text-slate-100">Add New Item SKU Master</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2-Inch Brass Ball Valve"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Item SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VLV-BRS-02"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">HSN / SAC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 8481.80.20"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Hardware & Fittings"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Unit of Measure (UOM)</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono uppercase"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="NOS">NOS (Numbers)</option>
                    <option value="KGS">KGS (Kilograms)</option>
                    <option value="MTR">MTR (Meters)</option>
                    <option value="BOX">BOX (Boxes)</option>
                    <option value="SET">SET (Sets)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">GST Rate Slab (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="0">0% (Nil / Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Opening Stock Qty</label>
                  <input
                    type="number"
                    value={formData.openingStock}
                    onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save SKU Master'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
