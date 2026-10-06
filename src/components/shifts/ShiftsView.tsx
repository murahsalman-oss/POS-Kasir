import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CashierShift } from '../../types';
import {
  Clock,
  Unlock,
  Lock,
  Printer,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';

export const ShiftsView: React.FC = () => {
  const { shifts, activeShift, openShift, closeShift, settings } = useApp();
  const { currentUser } = useAuth();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [initialFloatCash, setInitialFloatCash] = useState<number>(200000);
  const [physicalCashInput, setPhysicalCashInput] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [viewingClosingShift, setViewingClosingShift] = useState<CashierShift | null>(null);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift(initialFloatCash, 'Shift dibuka');
    setShowOpenModal(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const closed = closeShift(physicalCashInput, closingNotes || 'Shift ditutup kasir');
    setShowCloseModal(false);
    setViewingClosingShift(closed);
  };

  // Expected cash on drawer calculation
  const currentExpectedCash = activeShift
    ? activeShift.initialCash + activeShift.totalSalesCash + activeShift.totalCashIn - activeShift.totalCashOut
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Shift & Closing Kasir</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buka laci kasir dengan modal awal, monitor omzet berjalan, dan lakukan rekonsiliasi kas fisik (Closing Shift).
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {activeShift ? (
            <button
              onClick={() => {
                setPhysicalCashInput(currentExpectedCash);
                setShowCloseModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[40px]"
            >
              <Lock className="w-4 h-4" />
              <span>Tutup Kasir / Closing Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors min-h-[40px]"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Shift Kasir Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE SHIFT STATUS CARD */}
      {activeShift ? (
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <div>
                <h3 className="font-bold text-base text-white">Shift Sedang Aktif</h3>
                <p className="text-xs text-slate-400">
                  Kasir: <strong className="text-emerald-400">{activeShift.cashierName}</strong> • Dibuka:{' '}
                  {activeShift.openedAt}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              STATUS: OPEN
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Modal Awal Laci
              </span>
              <span className="text-lg font-black text-white mt-1 block">
                {formatRupiah(activeShift.initialCash)}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Penjualan Tunai
              </span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">
                {formatRupiah(activeShift.totalSalesCash)}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Penjualan Non-Tunai (QRIS/Card)
              </span>
              <span className="text-lg font-black text-cyan-400 mt-1 block">
                {formatRupiah(activeShift.totalSalesNonCash)}
              </span>
            </div>

            <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                Uang Seharusnya di Laci
              </span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {formatRupiah(currentExpectedCash)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h4 className="font-bold text-sm">Tidak Ada Shift Kasir Yang Aktif</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Silakan buka shift baru dan masukkan modal awal kasir untuk mulai bertransaksi dengan rapi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOpenModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 min-h-[38px]"
          >
            Buka Shift Sekarang
          </button>
        </div>
      )}

      {/* SHIFT HISTORY SECTION */}
      <div className="space-y-3">
        {/* Mobile Shift Cards (md:hidden) */}
        <div className="md:hidden space-y-2.5">
          {shifts.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{s.cashierName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Buka: {s.openedAt}</p>
                  {s.closedAt && <p className="text-[10px] text-slate-400 font-mono">Tutup: {s.closedAt}</p>}
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    s.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Penjualan Tunai:</span>
                  <span className="text-emerald-700 font-bold">{formatRupiah(s.totalSalesCash)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Selisih Kas:</span>
                  <span className={s.difference === 0 ? 'text-emerald-700 font-bold' : s.difference && s.difference < 0 ? 'text-rose-700 font-bold' : 'text-slate-800 font-bold'}>
                    {s.difference !== undefined ? (s.difference === 0 ? 'Rp 0 (Pas)' : formatRupiah(s.difference)) : '-'}
                  </span>
                </div>
              </div>

              {s.status === 'closed' && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setViewingClosingShift(s)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 min-h-[36px]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Lihat Struk Closing</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Riwayat Laporan Closing Shift Kasir</h3>
            <span className="text-xs text-slate-400">{shifts.length} sesi shift</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Kasir & Waktu Buka</th>
                <th className="py-3 px-4">Waktu Tutup</th>
                <th className="py-3 px-4">Modal Awal</th>
                <th className="py-3 px-4">Penjualan Tunai</th>
                <th className="py-3 px-4">Kas Seharusnya</th>
                <th className="py-3 px-4">Kas Fisik Real</th>
                <th className="py-3 px-4">Selisih Kas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Struk Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans">
                    <span className="font-bold text-slate-900 block">{s.cashierName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{s.openedAt}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{s.closedAt || '-'}</td>
                  <td className="py-3 px-4 text-slate-700">{formatRupiah(s.initialCash)}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">{formatRupiah(s.totalSalesCash)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.expectedCash !== undefined ? formatRupiah(s.expectedCash) : '-'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.actualCash !== undefined ? formatRupiah(s.actualCash) : '-'}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {s.difference !== undefined ? (
                      <span
                        className={
                          s.difference === 0
                            ? 'text-emerald-700'
                            : s.difference < 0
                            ? 'text-rose-700'
                            : 'text-blue-700'
                        }
                      >
                        {s.difference === 0 ? 'Rp 0 (Pas)' : formatRupiah(s.difference)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    {s.status === 'closed' && (
                      <button
                        onClick={() => setViewingClosingShift(s)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                        title="Lihat Struk Closing"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* MODAL BUKA SHIFT */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buka Shift Kasir Baru</h3>
              <button onClick={() => setShowOpenModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleOpenShiftSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kasir Bertugas</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.fullName || 'Kasir'}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modal Awal Laci Kasir (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={initialFloatCash}
                    onChange={(e) => setInitialFloatCash(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl font-bold text-sm text-slate-900"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Uang kembalian yang disiapkan di awal shift</p>
              </div>

              <div className="bg-slate-50 -mx-5 -mb-5 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Buka Shift Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLOSING SHIFT */}
      {showCloseModal && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tutup Kasir & Rekonsiliasi Kas (Closing)</h3>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between">
                  <span>Modal Awal:</span>
                  <span>{formatRupiah(activeShift.initialCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penjualan Tunai:</span>
                  <span className="text-emerald-700 font-bold">+{formatRupiah(activeShift.totalSalesCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengeluaran Kas:</span>
                  <span className="text-rose-700 font-bold">-{formatRupiah(activeShift.totalCashOut)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-sans font-extrabold text-sm text-slate-900">
                  <span>Kas Seharusnya di Laci:</span>
                  <span>{formatRupiah(currentExpectedCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Hitung & Masukkan Uang Fisik di Laci (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={physicalCashInput || ''}
                    onChange={(e) => setPhysicalCashInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl font-black text-base text-slate-900"
                    autoFocus
                  />
                </div>
              </div>

              {/* Live difference preview */}
              <div
                className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${
                  physicalCashInput - currentExpectedCash === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : physicalCashInput - currentExpectedCash < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <span>Selisih Kas Laci:</span>
                <span className="font-extrabold text-sm">
                  {physicalCashInput - currentExpectedCash === 0
                    ? 'Rp 0 (Pas / Cocok)'
                    : formatRupiah(physicalCashInput - currentExpectedCash)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Closing</label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Catatan pergantian shift atau penjelasan selisih..."
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 -mx-5 -mb-5 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  Konfirmasi Tutup Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL STRUK CLOSING */}
      {viewingClosingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Laporan Closing Shift Kasir</h3>
              <button onClick={() => setViewingClosingShift(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] flex justify-center bg-slate-100">
              <div
                className="bg-white p-4 shadow-sm border border-slate-200 font-mono text-[11px] text-slate-800 w-[280px]"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-400">
                  <h4 className="font-bold text-xs uppercase">{settings.storeName}</h4>
                  <p className="text-[10px] text-slate-500">LAPORAN CLOSING KASIR</p>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span className="font-bold">{viewingClosingShift.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buka:</span>
                    <span>{viewingClosingShift.openedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tutup:</span>
                    <span>{viewingClosingShift.closedAt}</span>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Modal Awal:</span>
                    <span>{formatRupiah(viewingClosingShift.initialCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan Tunai:</span>
                    <span>{formatRupiah(viewingClosingShift.totalSalesCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan Non-Tunai:</span>
                    <span>{formatRupiah(viewingClosingShift.totalSalesNonCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Keluar:</span>
                    <span>{formatRupiah(viewingClosingShift.totalCashOut)}</span>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>Kas Seharusnya:</span>
                    <span>{formatRupiah(viewingClosingShift.expectedCash || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kas Fisik Laci:</span>
                    <span>{formatRupiah(viewingClosingShift.actualCash || 0)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold pt-1 border-t border-dashed border-slate-400">
                    <span>Selisih:</span>
                    <span>{formatRupiah(viewingClosingShift.difference || 0)}</span>
                  </div>
                </div>

                <div className="pt-3 text-center text-[9px] text-slate-500">
                  <p>Laporan rekonsiliasi kasir minimarket.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Struk
              </button>
              <button
                onClick={() => setViewingClosingShift(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
