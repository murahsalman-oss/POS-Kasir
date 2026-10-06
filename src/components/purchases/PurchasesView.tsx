import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Purchase, PurchaseItem } from '../../types';
import { Truck, Plus, Search, Calendar, CheckCircle2, Trash2, X } from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { purchases, suppliers, products, addPurchase, showToast } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New PO State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [poPaymentMethod, setPoPaymentMethod] = useState('transfer');
  const [poStatus, setPoStatus] = useState<'lunas' | 'selesai' | 'draft'>('lunas');
  const [poNote, setPoNote] = useState('Restock barang toko');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; buyPrice: number }[]>([
    { productId: products[0]?.id || '', quantity: 24, buyPrice: products[0]?.buyPrice || 2500 }
  ]);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const filteredPurchases = purchases.filter((p) => {
    const q = searchQuery.toLowerCase();
    return !q || p.invoiceNumber.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q);
  });

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setPoItems([
      ...poItems,
      { productId: products[0].id, quantity: 12, buyPrice: products[0].buyPrice }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: string | number) => {
    setPoItems((prev) => {
      const copy = [...prev];
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        copy[idx] = {
          ...copy[idx],
          productId: String(value),
          buyPrice: prod ? prod.buyPrice : copy[idx].buyPrice
        };
      } else if (field === 'quantity') {
        copy[idx] = { ...copy[idx], quantity: Math.max(1, Number(value) || 1) };
      } else if (field === 'buyPrice') {
        copy[idx] = { ...copy[idx], buyPrice: Math.max(0, Number(value) || 0) };
      }
      return copy;
    });
  };

  const poTotalAmount = poItems.reduce((acc, it) => acc + it.quantity * it.buyPrice, 0);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      showToast('error', 'Gagal', 'Tambahkan minimal 1 barang dalam pesanan pembelian.');
      return;
    }

    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const itemsFormatted: PurchaseItem[] = poItems.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod?.name || 'Produk',
        quantity: it.quantity,
        buyPrice: it.buyPrice,
        subtotal: it.quantity * it.buyPrice
      };
    });

    addPurchase({
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      supplierId: sup.id,
      supplierName: sup.name,
      items: itemsFormatted,
      totalAmount: poTotalAmount,
      paidAmount: poStatus === 'lunas' ? poTotalAmount : 0,
      paymentMethod: poPaymentMethod,
      status: poStatus,
      note: poNote,
      createdBy: currentUser?.fullName || 'Admin'
    });

    setShowAddModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pembelian Barang (PO Restock)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat pesanan barang dari supplier distributor. Stok otomatis bertambah saat status diselesaikan/lunas.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Faktur Pembelian</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor PO atau nama supplier..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada riwayat pembelian barang.
          </div>
        ) : (
          filteredPurchases.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-mono">{p.invoiceNumber}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.date}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {p.status}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Supplier:</span>
                  <span className="font-semibold text-slate-800">{p.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Metode Bayar:</span>
                  <span className="font-semibold text-slate-700 uppercase">{p.paymentMethod}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                  {p.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[180px]">{it.productName}</span>
                      <span className="font-mono">{it.quantity} x {formatRupiah(it.buyPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Oleh: {p.createdBy}</span>
                <span className="font-black text-sm text-slate-900 font-mono">
                  {formatRupiah(p.totalAmount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Purchases List Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">No. PO & Tanggal</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Barang / Item</th>
                <th className="py-3 px-4">Total Biaya</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dibuat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat pembelian barang.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{p.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{p.date}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.supplierName}</td>
                    <td className="py-3 px-4">
                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        {p.items.map((it, i) => (
                          <div key={i}>
                            {it.productName} ({it.quantity} x {formatRupiah(it.buyPrice)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatRupiah(p.totalAmount)}
                    </td>
                    <td className="py-3 px-4 uppercase text-[11px] text-slate-600 font-semibold">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BUAT PEMBELIAN PO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Faktur Pembelian Supplier (PO)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Supplier</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={poPaymentMethod}
                    onChange={(e) => setPoPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium uppercase"
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="tunai">Tunai / Kas Toko</option>
                    <option value="tempo">Tempo / Kredit 30 Hari</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Daftar Barang Masuk:</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Baris Barang
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="w-16 px-2 py-1.5 border rounded-lg text-xs font-bold text-center bg-white"
                      />

                      <input
                        type="number"
                        min="0"
                        value={item.buyPrice}
                        onChange={(e) => handleItemChange(idx, 'buyPrice', e.target.value)}
                        placeholder="Harga Beli"
                        className="w-28 px-2 py-1.5 border rounded-lg text-xs font-bold bg-white"
                      />

                      <span className="w-24 text-right font-bold text-xs text-slate-900">
                        {formatRupiah(item.quantity * item.buyPrice)}
                      </span>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex justify-between items-center text-sm">
                <span className="font-bold text-emerald-900">Total Nilai Pembelian:</span>
                <span className="font-extrabold text-lg text-emerald-700">{formatRupiah(poTotalAmount)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={poNote}
                  onChange={(e) => setPoNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Simpan & Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
