import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { User, UserRole } from '../../types';
import { UserCog, Plus, ShieldCheck, Check, X, ShieldAlert, KeyRound } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { showToast } = useApp();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('kasir');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      showToast('error', 'Validasi Gagal', 'Username dan Nama Lengkap wajib diisi.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName,
      role,
      email: email || `${username}@minimarketberkah.com`,
      phone: phone || '08123456789',
      isActive: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);

    if (currentUser) {
      StorageService.addAuditLog(
        currentUser,
        'Tambah Pengguna',
        'Pengguna',
        `Membuat akun pengguna "${newUser.fullName}" (@${newUser.username}) dengan role ${newUser.role}`
      );
    }

    showToast('success', 'User Dibuat', `Akun ${newUser.fullName} berhasil ditambahkan. Password default: 123456`);
    setShowAddModal(false);
    setUsername('');
    setFullName('');
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser?.id) {
      showToast('error', 'Ditolak', 'Tidak dapat menonaktifkan akun yang sedang digunakan.');
      return;
    }
    const updated = users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updated);
    StorageService.saveUsers(updated);
    showToast('info', 'Status Diubah', `Akun @${user.username} ${!user.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengguna & Hak Akses (RBAC)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun petugas kasir, supervisor manajer, dan administrator sistem toko.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Mobile Users Card List (md:hidden) */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{u.fullName}</h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">@{u.username}</p>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                  u.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-800'
                    : u.role === 'manajer'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {u.role.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-700 truncate max-w-[180px]">{u.email}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Login Terakhir:</span>
                <span className="font-mono text-slate-500">{u.lastLogin || '-'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {u.isActive ? 'Status Aktif' : 'Nonaktif'}
              </span>

              <button
                type="button"
                onClick={() => handleToggleActive(u)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Users List (Desktop md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            <tr>
              <th className="py-3 px-4">Nama Lengkap & Username</th>
              <th className="py-3 px-4">Hak Akses (Role)</th>
              <th className="py-3 px-4">Kontak / Email</th>
              <th className="py-3 px-4">Login Terakhir</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{u.fullName}</div>
                  <div className="text-[10px] font-mono text-slate-400">@{u.username}</div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'manajer'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{u.lastLogin || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {u.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Matriks Hak Akses Pengguna (Security Policy)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
            <h4 className="font-bold text-purple-950">Super Administrator</h4>
            <p className="text-[11px] text-purple-800 mt-1">
              Akses tanpa batas: Kasir, Master Data, Stok, HPP modal, Laporan Laba/Rugi, Backup database SQL, dan Pengaturan.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
            <h4 className="font-bold text-blue-950">Manajer Toko</h4>
            <p className="text-[11px] text-blue-800 mt-1">
              Akses operasional: Pembelian PO supplier, inventori stok opname, laporan penjualan, dan pengeluaran kas.
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
            <h4 className="font-bold text-emerald-950">Kasir Toko (Restricted)</h4>
            <p className="text-[11px] text-emerald-800 mt-1">
              Hanya kasir POS, barcode scan, closing shift, dan retur penjualan. Dilarang melihat harga beli modal (HPP), backup SQL, dan master user.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username (Login)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: kasir2"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Rina Wahyuni"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
                >
                  <option value="kasir">Kasir (Hanya Transaksi & Closing)</option>
                  <option value="manajer">Manajer (Stok, Pembelian & Laporan)</option>
                  <option value="super_admin">Super Administrator (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@minimarketberkah.com"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Password awal default: <strong>123456</strong> (User dapat mengubahnya nanti).</span>
              </div>

              <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
