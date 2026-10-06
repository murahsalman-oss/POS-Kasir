import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  AlertTriangle,
  Barcode as BarcodeIcon,
  RefreshCw
} from 'lucide-react';
import { LabelPrintModal } from '../common/LabelPrintModal';

export const ProductsView: React.FC = () => {
  const { products, categories, units, suppliers, addProduct, updateProduct, deleteProduct, showToast } = useApp();
  const { currentUser } = useAuth();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'out'>('all');

  // Modal State
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Print Label Modal
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelProduct, setLabelProduct] = useState<Product | undefined>(undefined);

  // Form Fields
  const [formData, setFormData] = useState({
    barcode: '',
    sku: '',
    name: '',
    categoryId: '',
    unitId: '',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 5,
    discount: 0,
    tax: 0,
    supplierId: '',
    shelfLocation: '',
    isActive: true,
    imageUrl: ''
  });

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q);

    const matchCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchSup = filterSupplier === 'all' || p.supplierId === filterSupplier;

    let matchStock = true;
    if (filterStockStatus === 'low') matchStock = p.stock > 0 && p.stock <= (p.minStock || 10);
    if (filterStockStatus === 'out') matchStock = p.stock <= 0;

    return matchSearch && matchCat && matchSup && matchStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      barcode: generateEan13(),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      categoryId: categories[0]?.id || '',
      unitId: units[0]?.id || '',
      buyPrice: 0,
      sellPrice: 0,
      stock: 10,
      minStock: 5,
      discount: 0,
      tax: 0,
      supplierId: suppliers[0]?.id || '',
      shelfLocation: 'Rak A-01',
      isActive: true,
      imageUrl: ''
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      barcode: p.barcode,
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId,
      unitId: p.unitId,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      minStock: p.minStock,
      discount: p.discount,
      tax: p.tax,
      supplierId: p.supplierId,
      shelfLocation: p.shelfLocation,
      isActive: p.isActive,
      imageUrl: p.imageUrl || ''
    });
    setShowAddEditModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.barcode.trim()) {
      showToast('error', 'Validasi Gagal', 'Nama dan Barcode produk wajib diisi!');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setShowAddEditModal(false);
  };

  const generateEan13 = () => {
    // Generate valid Indonesian 13-digit EAN barcode starting with 899
    const prefix = '899';
    let code = prefix;
    for (let i = 0; i < 9; i++) {
      code += Math.floor(Math.random() * 10);
    }
    // Calculate 13th checksum digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return code + checkDigit;
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Barcode', 'SKU', 'Nama Produk', 'Harga Beli', 'Harga Jual', 'Stok', 'Stok Minimum', 'Lokasi Rak', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.barcode,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.buyPrice,
      p.sellPrice,
      p.stock,
      p.minStock,
      `"${p.shelfLocation}"`,
      p.isActive ? 'Aktif' : 'Nonaktif'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `katalog_produk_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Ekspor CSV Berhasil', 'File CSV data produk telah diunduh.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Master Data Produk</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola katalog barang, barcode EAN-13, harga beli/jual, dan ambang batas stok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              setLabelProduct(filteredProducts[0]);
              setShowLabelModal(true);
            }}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cetak Label Rak</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari barcode / nama / SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier filter */}
        <div>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value as 'all' | 'low' | 'out')}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Status Stok</option>
            <option value="low">Stok Menipis (&lt;= Min)</option>
            <option value="out">Stok Habis (0)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci atau filter pencarian</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            const unt = units.find((u) => u.id === p.unitId);
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.minStock || 10);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? 'Habis' : `${p.stock} ${unt?.name || 'Pcs'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                      <span>{p.barcode}</span>
                      <span>•</span>
                      <span>{cat?.name || 'Kategori'}</span>
                      {p.shelfLocation && (
                        <>
                          <span>•</span>
                          <span>{p.shelfLocation}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    {currentUser?.role !== 'kasir' && p.buyPrice > 0 && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Beli: {formatRupiah(p.buyPrice)}
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatRupiah(p.sellPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLabelProduct(p);
                        setShowLabelModal(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Cetak Label"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {currentUser?.role === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus produk "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Products Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Produk / Nama</th>
                <th className="py-3 px-4">Barcode / SKU</th>
                <th className="py-3 px-4">Kategori & Rak</th>
                {currentUser?.role !== 'kasir' && <th className="py-3 px-4">Harga Beli</th>}
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Stok Fisik</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada produk yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const unt = units.find((u) => u.id === p.unitId);
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= (p.minStock || 10);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{unt?.name || 'Pcs'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-semibold text-slate-800 block">{p.barcode}</span>
                        <span className="text-slate-400 block text-[10px]">{p.sku}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block">{cat?.name || '-'}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{p.shelfLocation || '-'}</span>
                      </td>

                      {currentUser?.role !== 'kasir' && (
                        <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                          {formatRupiah(p.buyPrice)}
                        </td>
                      )}

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatRupiah(p.sellPrice)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.stock} (Min: {p.minStock})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            p.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={p.isActive ? 'Aktif' : 'Nonaktif'}
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setLabelProduct(p);
                              setShowLabelModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                            title="Cetak Label Barcode"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser?.role === 'super_admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus produk "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Menampilkan {filteredProducts.length} dari {products.length} total produk</span>
          <span>Sistem Minimarket Berkah Jaya</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL TAMBAH / EDIT PRODUK */}
      {/* ======================================================== */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Barcode & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Kode Barcode (EAN-13)</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, barcode: generateEan13() })}
                      className="text-[10px] text-emerald-600 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      Acak Barcode
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Indomie Mi Goreng Spesial 85g"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Row 3: Kategori, Satuan, Lokasi Rak */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi / Rak</label>
                  <input
                    type="text"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    placeholder="Contoh: Rak A-01 Makanan"
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Harga Beli & Harga Jual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Beli / Pokok (HPP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.buyPrice || ''}
                      onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Jual Kasir</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">Rp</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.sellPrice || ''}
                      onChange={(e) => setFormData({ ...formData, sellPrice: parseInt(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Stok & Stok Minimum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ambang Stok Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock || ''}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Supplier & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pemasok / Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Foto / URL Gambar</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Produk Aktif & Dijual di Kasir</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-200 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Label Print Modal */}
      {showLabelModal && (
        <LabelPrintModal product={labelProduct} onClose={() => setShowLabelModal(false)} />
      )}
    </div>
  );
};
