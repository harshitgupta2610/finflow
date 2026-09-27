'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import {
  Package,
  Plus,
  Search,
  Tag,
  Barcode,
  AlertTriangle,
  Layers,
  DollarSign,
  TrendingUp,
  X,
  Save,
} from 'lucide-react';

const mockItems = [
  {
    id: 'i1',
    name: 'Industrial Brass Valve 1/2"',
    sku: 'VALVE-BRASS-05',
    hsnSac: '8481.80.20',
    category: 'Hardware & Fittings',
    unit: 'PCS',
    gstRate: '18%',
    purchasePrice: '₹ 450.00',
    sellingPrice: '₹ 650.00',
    mrp: '₹ 750.00',
    currentStock: 8,
    reorderLevel: 25,
    status: 'LOW_STOCK',
  },
  {
    id: 'i2',
    name: 'Synthetic Hydraulic Fluid 5L',
    sku: 'FLUID-HYD-5L',
    hsnSac: '2710.19.80',
    category: 'Chemicals & Oils',
    unit: 'CAN',
    gstRate: '18%',
    purchasePrice: '₹ 1,200.00',
    sellingPrice: '₹ 1,650.00',
    mrp: '₹ 1,800.00',
    currentStock: 3,
    reorderLevel: 15,
    status: 'CRITICAL',
  },
  {
    id: 'i3',
    name: 'Copper Wiring Cable 1.5mm',
    sku: 'CABLE-COP-15',
    hsnSac: '8544.49.99',
    category: 'Electricals',
    unit: 'MTR',
    gstRate: '18%',
    purchasePrice: '₹ 28.00',
    sellingPrice: '₹ 42.00',
    mrp: '₹ 48.00',
    currentStock: 1200,
    reorderLevel: 200,
    status: 'OPTIMAL',
  },
  {
    id: 'i4',
    name: 'Stainless Steel Bolt M8x50',
    sku: 'BOLT-SS-M850',
    hsnSac: '7318.15.00',
    category: 'Hardware & Fittings',
    unit: 'BOX',
    gstRate: '18%',
    purchasePrice: '₹ 150.00',
    sellingPrice: '₹ 220.00',
    mrp: '₹ 250.00',
    currentStock: 450,
    reorderLevel: 50,
    status: 'OPTIMAL',
  },
];

export default function ItemMasterPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    hsnSac: '8481.80.20',
    category: 'Hardware & Fittings',
    unit: 'PCS',
    gstRate: '18',
    purchasePrice: '0.00',
    sellingPrice: '0.00',
    reorderLevel: '10',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Item SKU "${formData.sku}" saved successfully!`);
    setShowModal(false);
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
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-600/30 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Item SKU</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 glass-card">
            <div className="flex items-center space-x-2">
              {['ALL', 'Hardware & Fittings', 'Chemicals & Oils', 'Electricals'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                placeholder="Search item name, SKU, HSN, barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Items List Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 glass-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Item Name & SKU</th>
                  <th className="pb-3">HSN / SAC</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">GST Slab</th>
                  <th className="pb-3 text-right">Purchase Price</th>
                  <th className="pb-3 text-right">Selling Price</th>
                  <th className="pb-3 text-right">Current Stock</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockItems
                  .filter((i) => selectedCategory === 'ALL' || i.category === selectedCategory)
                  .filter(
                    (i) =>
                      i.name.toLowerCase().includes(search.toLowerCase()) ||
                      i.sku.toLowerCase().includes(search.toLowerCase()) ||
                      i.hsnSac.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-200">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">SKU: {item.sku}</div>
                      </td>
                      <td className="py-3 font-mono text-slate-300">{item.hsnSac}</td>
                      <td className="py-3 text-slate-400">{item.category}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.gstRate} GST
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">{item.purchasePrice}</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-100">{item.sellingPrice}</td>
                      <td className="py-3 text-right font-mono font-extrabold text-slate-200">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'OPTIMAL'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'LOW_STOCK'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Add Item SKU Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-card shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-100">Create New Item SKU</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Industrial Brass Valve 1/2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Item SKU Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="VALVE-BRASS-05"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">HSN / SAC Code</label>
                      <input
                        type="text"
                        placeholder="8481.80.20"
                        value={formData.hsnSac}
                        onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                      >
                        <option value="PCS">PCS</option>
                        <option value="KGS">KGS</option>
                        <option value="MTR">MTR</option>
                        <option value="CAN">CAN</option>
                        <option value="BOX">BOX</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">GST Rate</label>
                      <select
                        value={formData.gstRate}
                        onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500"
                      >
                        <option value="0">0% GST</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Reorder Level</label>
                      <input
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Purchase Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Item SKU</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
