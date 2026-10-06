import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { Receipt, Search, Printer, Calendar, RotateCcw } from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

interface SalesViewProps {
  onNavigateToReturns?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onNavigateToReturns }) => {
  const { sales } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.cashierName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Riwayat Transaksi Penjualan Kasir</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh struk transaksi kasir, rincian pembayaran, dan opsi cetak ulang struk thermal.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. faktur / pelanggan..."
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredSales.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Receipt className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-slate-400 mt-0.5">Transaksi penjualan yang selesai akan muncul di sini</p>
          </div>
        ) : (
          filteredSales.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono font-bold text-xs text-slate-900">{s.invoiceNumber}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.date}</div>
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    s.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {s.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <div className="text-[10px] text-slate-400">Kasir & Pelanggan:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{s.cashierName} • {s.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Metode & Item:</div>
                  <div className="font-semibold text-slate-800 mt-0.5 uppercase">
                    {s.paymentMethod} ({s.items.length} item)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Transaksi</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {formatRupiah(s.grandTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSaleForPrint(s)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sales Table (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Faktur (TRX)</th>
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Jumlah Item</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 font-mono">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Cetak Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat transaksi penjualan.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.invoiceNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{s.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.cashierName}</td>
                    <td className="py-3 px-4 text-slate-600">{s.customerName}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{s.items.length} Barang</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-700">
                      {s.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatRupiah(s.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSaleForPrint(s)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSaleForPrint && (
        <ReceiptModal sale={selectedSaleForPrint} onClose={() => setSelectedSaleForPrint(null)} />
      )}
    </div>
  );
};
