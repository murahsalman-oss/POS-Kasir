import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { RotateCcw, Search, Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const ReturnsView: React.FC = () => {
  const { returns, sales, processSaleReturn, showToast } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);

  // New Return Modal State
  const [targetInvoice, setTargetInvoice] = useState('');
  const [searchedSale, setSearchedSale] = useState<typeof sales[0] | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: { selected: boolean; qty: number; reason: string } }>({});
  const [globalReason, setGlobalReason] = useState('Barang kemasan rusak / bocor');

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const filteredReturns = returns.filter((r) => {
    const q = searchQuery.toLowerCase();
    return !q || r.returnNumber.toLowerCase().includes(q) || r.referenceInvoice.toLowerCase().includes(q);
  });

  const handleSearchInvoice = () => {
    const sale = sales.find((s) => s.invoiceNumber.trim().toUpperCase() === targetInvoice.trim().toUpperCase());
    if (sale) {
      setSearchedSale(sale);
      const initSelection: { [productId: string]: { selected: boolean; qty: number; reason: string } } = {};
      sale.items.forEach((it) => {
        initSelection[it.productId] = { selected: false, qty: 1, reason: 'Barang rusak' };
      });
      setSelectedItems(initSelection);
    } else {
      setSearchedSale(null);
      showToast('error', 'Faktur Tidak Ditemukan', `Nomor transaksi "${targetInvoice}" tidak ada di database.`);
    }
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedSale) return;

    const itemsToReturn = searchedSale.items
      .filter((it) => selectedItems[it.productId]?.selected)
      .map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: selectedItems[it.productId].qty,
        price: it.sellPrice,
        reason: selectedItems[it.productId].reason || globalReason
      }));

    if (itemsToReturn.length === 0) {
      showToast('error', 'Pilih Barang', 'Centang minimal satu barang yang ingin diretur!');
      return;
    }

    const res = processSaleReturn({
      saleInvoice: searchedSale.invoiceNumber,
      items: itemsToReturn,
      reason: globalReason
    });

    if (res.success) {
      setShowReturnModal(false);
      setSearchedSale(null);
      setTargetInvoice('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Retur Barang & Pengembalian Dana</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proses retur barang dari pelanggan, kembalikan stok fisik otomatis, dan catat pengembalian kas toko.
          </p>
        </div>

        <button
          onClick={() => {
            setShowReturnModal(true);
            setSearchedSale(null);
            setTargetInvoice('');
          }}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Proses Retur Baru</span>
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
            placeholder="Cari nomor retur atau nomor faktur transaksi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Mobile Returns Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredReturns.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada data retur barang.
          </div>
        ) : (
          filteredReturns.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 font-mono">{r.returnNumber}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{r.date}</p>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Ref: {r.referenceInvoice}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Pihak Terkait:</span>
                  <span className="font-semibold text-slate-800">{r.partyName}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Alasan:</span>
                  <span className="text-slate-700 italic">{r.reason}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                  {r.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[180px]">{it.productName}</span>
                      <span className="font-mono">{it.quantity} unit ({formatRupiah(it.price * it.quantity)})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Petugas: {r.handledBy}</span>
                <div>
                  <span className="text-[10px] text-slate-400 block text-right">Dana Kembali</span>
                  <span className="font-black text-sm text-rose-700 font-mono">
                    -{formatRupiah(r.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Returns List Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Retur & Waktu</th>
                <th className="py-3 px-4">Ref. Transaksi (TRX)</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Barang Diretur</th>
                <th className="py-3 px-4">Total Pengembalian</th>
                <th className="py-3 px-4">Alasan Retur</th>
                <th className="py-3 px-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada data retur barang.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{r.returnNumber}</span>
                      <span className="text-[10px] text-slate-400 block">{r.date}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      {r.referenceInvoice}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.partyName}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px] text-slate-700">
                        {r.items.map((it, idx) => (
                          <div key={idx}>
                            • {it.productName} ({it.quantity} x {formatRupiah(it.price)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {formatRupiah(r.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.reason}</td>
                    <td className="py-3 px-4 text-slate-600">{r.handledBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RETUR BARANG */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Form Retur Transaksi Penjualan</h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Step 1: Input TRX Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masukkan Nomor Transaksi Penjualan (TRX)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetInvoice}
                    onChange={(e) => setTargetInvoice(e.target.value)}
                    placeholder="Contoh: TRX-20261006-000001"
                    className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearchInvoice}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    Cari Faktur
                  </button>
                </div>
              </div>

              {/* Step 2: Show items if found */}
              {searchedSale && (
                <form onSubmit={handleSubmitReturn} className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border flex justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pelanggan:</span>
                      <span className="font-bold text-slate-900">{searchedSale.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Waktu:</span>
                      <span className="font-mono text-slate-700">{searchedSale.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Belanja:</span>
                      <span className="font-bold text-emerald-700">{formatRupiah(searchedSale.grandTotal)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Pilih Item Yang Diretur:
                    </label>
                    <div className="space-y-2">
                      {searchedSale.items.map((it) => {
                        const sel = selectedItems[it.productId] || { selected: false, qty: 1, reason: '' };
                        return (
                          <div
                            key={it.productId}
                            className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                              sel.selected ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={sel.selected}
                                onChange={(e) => {
                                  setSelectedItems({
                                    ...selectedItems,
                                    [it.productId]: { ...sel, selected: e.target.checked }
                                  });
                                }}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-xs text-slate-900 block truncate">
                                  {it.productName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Beli: {it.quantity} unit @ {formatRupiah(it.sellPrice)}
                                </span>
                              </div>
                            </label>

                            {sel.selected && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-slate-500">Qty Retur:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={it.quantity}
                                  value={sel.qty}
                                  onChange={(e) => {
                                    const q = Math.min(it.quantity, Math.max(1, parseInt(e.target.value) || 1));
                                    setSelectedItems({
                                      ...selectedItems,
                                      [it.productId]: { ...sel, qty: q }
                                    });
                                  }}
                                  className="w-14 px-2 py-1 border rounded-lg text-xs font-bold text-center"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Retur</label>
                    <input
                      type="text"
                      required
                      value={globalReason}
                      onChange={(e) => setGlobalReason(e.target.value)}
                      placeholder="Contoh: Barang cacat dari pabrik / kemasan robek"
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Proses Retur & Kembalikan Stok
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
