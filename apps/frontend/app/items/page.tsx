'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function ItemMasterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
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

  const categories = ['ALL', ...Array.from(new Set(items.map((i) => i.category || 'General')))];

  const filteredItems = items.filter((item) => {
    const itemCat = item.category || 'General';
    const matchesCat = selectedCategory === 'ALL' || itemCat === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
      (item.hsnCode && item.hsnCode.includes(search));
    return matchesCat && matchesSearch;
  });

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
                onClick={fetchItems}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2 border border-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Item SKU</span>
              </button>
            </div>
          </div>

          {/* Category Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search item, SKU, or HSN code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Item Name</th>
                  <th className="pb-3">SKU & HSN</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">UOM</th>
                  <th className="pb-3 text-center">GST Slab</th>
                  <th className="pb-3 text-right">Purchase (₹)</th>
                  <th className="pb-3 text-right">Selling (₹)</th>
                  <th className="pb-3 text-right">Current Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Loading item catalog...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      No SKU items found. Click "New Item SKU" to register one.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const currentStock = Number(item.openingStock || 0);
                    const reorderLevel = Number(item.reorderLevel || 10);
                    const isLow = currentStock <= reorderLevel;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-200">{item.name}</div>
                        </td>
                        <td className="py-3 font-mono text-[11px]">
                          <div className="text-brand-400 font-bold">{item.code}</div>
                          <div className="text-slate-500 text-[10px]">HSN: {item.hsnCode || 'N/A'}</div>
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
                          {isLow ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-1">
                              LOW
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ml-1">
                              OK
                            </span>
                          )}
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
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 mx-4 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Item Description / Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Industrial Brass Valve 1/2-inch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SKU Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-brand-500"
                    placeholder="VALVE-BRASS-05"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                    placeholder="8481.80.20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="Hardware & Fittings"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unit of Measure (UOM)
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="PCS">Pieces (PCS)</option>
                    <option value="BOX">Boxes (BOX)</option>
                    <option value="KGS">Kilograms (KGS)</option>
                    <option value="MTR">Meters (MTR)</option>
                    <option value="CAN">Cans (CAN)</option>
                    <option value="LTR">Liters (LTR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GST Slab Rate (%)
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="0">0% GST (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reorder Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Item SKU'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
