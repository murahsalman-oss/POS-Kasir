import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FolderTree, Plus, X, Layers } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, units, addCategory, showToast } = useApp();

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory({
      code: code || `CAT${categories.length + 1}`,
      name,
      description: desc
    });
    setShowAddCatModal(false);
    setCode('');
    setName('');
    setDesc('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Master Kategori & Satuan Produk</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelompokan jenis barang dan satuan unit minimarket (Pcs, Bungkus, Botol, Karung).
          </p>
        </div>

        <button
          onClick={() => setShowAddCatModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kategori Grid */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Daftar Kategori Barang ({categories.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{c.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{c.description || 'Tidak ada deskripsi'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Satuan Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Daftar Satuan Unit ({units.length})</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {units.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-700">{u.code}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-900">{u.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Kategori Produk</h3>
              <button onClick={() => setShowAddCatModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: MK02"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Biskuit & Wafer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div className="bg-slate-50 -mx-5 -mb-5 p-4 border-t flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
