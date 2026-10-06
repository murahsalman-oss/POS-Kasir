import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, Search, Filter, X } from 'lucide-react';

export const CashView: React.FC = () => {
  const { cashTransactions, addCashTransaction, showToast } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [txType, setTxType] = useState<'masuk' | 'keluar'>('keluar');
  const [category, setCategory] = useState('Listrik & Air');
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState('');

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const totalMasuk = cashTransactions
    .filter((c) => c.type === 'masuk')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalKeluar = cashTransactions
    .filter((c) => c.type === 'keluar')
    .reduce((acc, c) => acc + c.amount, 0);

  const saldoKas = totalMasuk - totalKeluar;

  const filteredTransactions = cashTransactions.filter((c) => {
    const matchType = filterType === 'all' || c.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) {
      showToast('error', 'Validasi Gagal', 'Nominal dan keterangan harus diisi.');
      return;
    }

    addCashTransaction(txType, category, amount, description);
    showToast('success', 'Transaksi Kas Dicatat', `${txType === 'masuk' ? 'Kas Masuk' : 'Pengeluaran'} ${formatRupiah(amount)}`);
    setShowModal(false);
    setDescription('');
  };

  const expenseCategories = [
    'Biaya Listrik, Air & Internet',
    'Gaji Karyawan',
    'ATK & Kantong Kresek',
    'Kebersihan & Keamanan Toko',
    'Konsumsi Karyawan',
    'Transportasi & Pengiriman',
    'Pemeliharaan / Servis AC & Rak',
    'Pengeluaran Lain-Lain'
  ];

  const incomeCategories = [
    'Modal Awal Kasir',
    'Penambahan Modal Pemilik',
    'Pendapatan Parkir',
    'Pemasukan Lain-Lain'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Buku Kas & Pengeluaran Toko</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat arus kas masuk operasional dan beban pengeluaran toko minimarket.
          </p>
        </div>

        <button
          onClick={() => {
            setTxType('keluar');
            setCategory(expenseCategories[0]);
            setShowModal(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi Kas</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saldo Kas Saat Ini</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block font-mono">{formatRupiah(saldoKas)}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Arus kas bersih tercatat</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Kas Masuk</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block font-mono">{formatRupiah(totalMasuk)}</span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Modal & setoran penerimaan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Pengeluaran Kas</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-700 mt-1 block font-mono">{formatRupiah(totalKeluar)}</span>
          <span className="text-[11px] text-rose-600 mt-1 block">Biaya operasional & belanja</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 min-h-[34px] ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('masuk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 min-h-[34px] ${
              filterType === 'masuk' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kas Masuk
          </button>
          <button
            onClick={() => setFilterType('keluar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 min-h-[34px] ${
              filterType === 'keluar' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kas Keluar
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Mobile Transactions Card List (md:hidden) */}
      <div className="md:hidden space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada riwayat transaksi kas.
          </div>
        ) : (
          filteredTransactions.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{c.category}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.date}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    c.type === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {c.type === 'masuk' ? '+' : '-'} {c.type}
                </span>
              </div>

              {c.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                  {c.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Oleh: {c.userName}</span>
                <span
                  className={`font-black text-sm font-mono ${
                    c.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {c.type === 'masuk' ? '+' : '-'}
                  {formatRupiah(c.amount)}
                </span>
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
                <th className="py-3 px-4">Jenis Transaksi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 font-mono">Nominal</th>
                <th className="py-3 px-4">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat transaksi kas.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{c.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.type === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.type === 'masuk' ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        )}
                        Kas {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.category}</td>
                    <td className="py-3 px-4 text-slate-600">{c.description}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={c.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'}>
                        {c.type === 'masuk' ? '+' : '-'}
                        {formatRupiah(c.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.userName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Transaksi Kas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Transaksi Kas Toko</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('masuk');
                      setCategory(incomeCategories[0]);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      txType === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Kas Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('keluar');
                      setCategory(expenseCategories[0]);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      txType === 'keluar'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Kas Keluar (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Transaksi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                >
                  {(txType === 'masuk' ? incomeCategories : expenseCategories).map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl font-bold text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Keperluan</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembayaran token listrik PLN bulan ini"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
