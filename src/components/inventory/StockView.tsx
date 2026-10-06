import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import {
  Boxes,
  ArrowLeftRight,
  AlertTriangle,
  Search,
  PlusCircle,
  SlidersHorizontal,
  FileSpreadsheet,
  X
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, stockMovements, updateProduct, showToast } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'status' | 'movements'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [selectedProductForOpname, setSelectedProductForOpname] = useState(products[0]);
  const [opnamePhysicalStock, setOpnamePhysicalStock] = useState<number>(0);
  const [opnameReason, setOpnameReason] = useState('Stock opname bulanan');

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 10));
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.sku.toLowerCase().includes(q);
  });

  const filteredMovements = stockMovements.filter((m) => {
    const q = searchQuery.toLowerCase();
    return !q || m.productName.toLowerCase().includes(q) || m.reference.toLowerCase().includes(q);
  });

  const handleProcessOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOpname || !currentUser) return;

    const before = selectedProductForOpname.stock;
    const diff = opnamePhysicalStock - before;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    updateProduct(selectedProductForOpname.id, { stock: opnamePhysicalStock });

    // Record stock movement ledger
    const movements = StorageService.getStockMovements();
    movements.unshift({
      id: `sm-${Date.now()}`,
      date: now,
      productId: selectedProductForOpname.id,
      productName: selectedProductForOpname.name,
      type: 'penyesuaian',
      reference: 'OPNAME-MANUAL',
      stockBefore: before,
      stockIn: diff > 0 ? diff : 0,
      stockOut: diff < 0 ? Math.abs(diff) : 0,
      stockAfter: opnamePhysicalStock,
      userId: currentUser.id,
      userName: currentUser.fullName,
      note: opnameReason
    });
    StorageService.saveStockMovements(movements);

    StorageService.addAuditLog(
      currentUser,
      'Stock Opname',
      'Inventori',
      `Penyesuaian stok "${selectedProductForOpname.name}" dari ${before} menjadi ${opnamePhysicalStock} (${opnameReason})`
    );

    showToast('success', 'Stok Diperbarui', `Stok ${selectedProductForOpname.name} disesuaikan ke ${opnamePhysicalStock}.`);
    setShowOpnameModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Manajemen Stok & Kartu Inventori</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau saldo stok fisik barang, rekam mutasi kartu stok, dan lakukan stock opname berkala.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProductForOpname(products[0]);
                setOpnamePhysicalStock(products[0].stock);
              }
              setShowOpnameModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Stock Opname / Penyesuaian</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 min-h-[38px] ${
            activeTab === 'status'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Status Stok Fisik ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 min-h-[38px] ${
            activeTab === 'movements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Buku Mutasi Stok (Kartu Stok)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang / barcode / faktur..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* TAB 1: STATUS STOK FISIK */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* Warning Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Stok Menipis (&lt;= Batas Minimum)
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-900 mt-1 block">
                  {lowStockProducts.length} Produk
                </span>
              </div>
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 opacity-70 shrink-0" />
            </div>

            <div className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                  Stok Habis (0 Unit)
                </span>
                <span className="text-xl sm:text-2xl font-black text-rose-900 mt-1 block">
                  {outOfStockProducts.length} Produk
                </span>
              </div>
              <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500 opacity-70 shrink-0" />
            </div>
          </div>

          {/* Mobile Stock Status Cards (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{p.name}</h4>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">{p.barcode}</p>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                      p.stock <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : p.stock <= (p.minStock || 10)
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="text-[11px]">
                    <span>Rak: <strong className="text-slate-700">{p.shelfLocation || '-'}</strong></span>
                    <span className="mx-1.5">•</span>
                    <span>Min: <strong className="text-slate-700">{p.minStock}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductForOpname(p);
                      setOpnamePhysicalStock(p.stock);
                      setShowOpnameModal(true);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200"
                  >
                    Sesuaikan
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table (Desktop md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4">Lokasi Rak</th>
                  <th className="py-3 px-4 text-center">Stok Minimum</th>
                  <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.barcode}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{p.shelfLocation || '-'}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{p.minStock}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : p.stock <= (p.minStock || 10)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProductForOpname(p);
                          setOpnamePhysicalStock(p.stock);
                          setShowOpnameModal(true);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        Penyesuaian
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BUKU MUTASI STOK LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-3">
          {/* Mobile Movements Cards (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {filteredMovements.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
                Belum ada mutasi stok tercatat.
              </div>
            ) : (
              filteredMovements.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{m.productName}</h4>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">{m.date} • {m.reference}</p>
                    </div>

                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        m.type === 'penjualan'
                          ? 'bg-blue-50 text-blue-700'
                          : m.type === 'pembelian'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.type === 'retur_penjualan'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {m.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-xl text-center font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Awal</span>
                      <span className="text-slate-600 font-semibold">{m.stockBefore}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Masuk</span>
                      <span className="text-emerald-700 font-bold">{m.stockIn > 0 ? `+${m.stockIn}` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Keluar</span>
                      <span className="text-rose-700 font-bold">{m.stockOut > 0 ? `-${m.stockOut}` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Akhir</span>
                      <span className="text-slate-900 font-extrabold">{m.stockAfter}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tanggal & Waktu</th>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-4">Jenis Transaksi</th>
                    <th className="py-3 px-4">Referensi</th>
                    <th className="py-3 px-4 text-center">Sebelum</th>
                    <th className="py-3 px-4 text-center">Masuk (+)</th>
                    <th className="py-3 px-4 text-center">Keluar (-)</th>
                    <th className="py-3 px-4 text-center">Sesudah</th>
                    <th className="py-3 px-4">User / Kasir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                        Belum ada mutasi stok tercatat.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-500">{m.date}</td>
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{m.productName}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.type === 'penjualan'
                                ? 'bg-blue-50 text-blue-700'
                                : m.type === 'pembelian'
                                ? 'bg-emerald-50 text-emerald-700'
                                : m.type === 'retur_penjualan'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {m.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-semibold">{m.reference}</td>
                        <td className="py-2.5 px-4 text-center text-slate-500">{m.stockBefore}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">
                          {m.stockIn > 0 ? `+${m.stockIn}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-rose-700">
                          {m.stockOut > 0 ? `-${m.stockOut}` : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-extrabold text-slate-900">{m.stockAfter}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-600">{m.userName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stock Opname Modal */}
      {showOpnameModal && selectedProductForOpname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h4 className="font-bold text-sm">Stock Opname / Penyesuaian Fisik</h4>
              <button onClick={() => setShowOpnameModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProcessOpname} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Produk</label>
                <select
                  value={selectedProductForOpname.id}
                  onChange={(e) => {
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) {
                      setSelectedProductForOpname(p);
                      setOpnamePhysicalStock(p.stock);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Sistem: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <span className="text-[10px] text-slate-500 block">Stok di Sistem:</span>
                  <span className="font-bold text-base text-slate-800">{selectedProductForOpname.stock}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 block">Stok Fisik Real:</label>
                  <input
                    type="number"
                    min="0"
                    value={opnamePhysicalStock}
                    onChange={(e) => setOpnamePhysicalStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-1 border rounded-lg font-bold text-sm bg-white"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Penyesuaian</label>
                <input
                  type="text"
                  required
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  placeholder="Contoh: Barang rusak, opname bulanan, selisih hitung"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 -mx-5 -mb-5 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
