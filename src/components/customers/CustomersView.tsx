import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus, Award, Phone, MapPin, X } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, showToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isMember, setIsMember] = useState(true);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustomer({
      code: `PLG-${String(customers.length + 1).padStart(3, '0')}`,
      name,
      phone: phone || '-',
      address: address || '-',
      email: email || '-',
      isMember
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Data Pelanggan & Member Loyalitas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Catat pelanggan tetap, akumulasi poin reward belanja, dan total transaksi seumur hidup.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan / Member</span>
        </button>
      </div>

      {/* Mobile Customer Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {customers.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{c.code}</p>
              </div>
              {c.isMember ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                  <Award className="w-3 h-3 text-amber-600" />
                  Member Aktif
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium shrink-0">
                  Umum
                </span>
              )}
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">No. HP / WA:</span>
                <span className="font-mono text-slate-700">{c.phone}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Alamat:</span>
                <span className="text-slate-700 truncate max-w-[180px]">{c.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Poin Reward</span>
                <span className="font-bold text-emerald-700 font-mono">{c.points} Pts</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Belanja</span>
                <span className="font-black text-slate-900 font-mono">{formatRupiah(c.totalSpent)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Nama Pelanggan</th>
              <th className="py-3 px-4">Status Loyalitas</th>
              <th className="py-3 px-4">No. Handphone / WhatsApp</th>
              <th className="py-3 px-4">Alamat Domisili</th>
              <th className="py-3 px-4 text-center">Poin Terkumpul</th>
              <th className="py-3 px-4 text-right">Total Akumulasi Belanja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-900 block">{c.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 block">{c.code}</span>
                </td>
                <td className="py-3 px-4">
                  {c.isMember ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Award className="w-3 h-3 text-amber-600" />
                      Member Aktif
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Pelanggan Umum</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">{c.phone}</td>
                <td className="py-3 px-4 text-slate-600">{c.address}</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700 font-mono">
                  {c.points} Pts
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                  {formatRupiah(c.totalSpent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Pelanggan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Rina Melati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="0812..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input
                  type="text"
                  placeholder="Jl..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={isMember}
                    onChange={(e) => setIsMember(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Daftarkan Sebagai Member Toko (Dapat Poin)</span>
                </label>
              </div>
              <div className="bg-slate-50 -mx-5 -mb-5 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
