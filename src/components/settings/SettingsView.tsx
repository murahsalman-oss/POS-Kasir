import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Store, Printer, Percent, RotateCcw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDatabaseDemo, showToast } = useApp();

  const [form, setForm] = useState({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengaturan Toko & POS</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas toko, format nomor faktur, template struk thermal, dan tarif pajak default.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTITAS TOKO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Identitas & Informasi Toko</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap Toko</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NPWP Toko</label>
              <input
                type="text"
                value={form.npwp}
                onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* PRINTER THERMAL & STRUK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Printer className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Format Struk Kasir & Printer Thermal</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ukuran Kertas Thermal Default
              </label>
              <select
                value={form.thermalPaperSize}
                onChange={(e) => setForm({ ...form, thermalPaperSize: e.target.value as '58mm' | '80mm' })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              >
                <option value="58mm">58mm (Printer Kasir Portabel / Mini)</option>
                <option value="80mm">80mm (Printer Kasir Standar Minimarket)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Awalan Nomor Faktur (Prefix)</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Kaki Struk (Receipt Footer)
              </label>
              <textarea
                rows={3}
                value={form.receiptFooter}
                onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* PAJAK & MATA UANG */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Percent className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Tarif Pajak & Mata Uang</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Pajak Default (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.defaultTaxPercent}
                onChange={(e) => setForm({ ...form, defaultTaxPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Set 0% jika harga barang sudah termasuk pajak.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Uang</label>
              <input
                type="text"
                disabled
                value="Indonesian Rupiah (IDR - Rp)"
                className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Kembalikan seluruh data database ke awal bawaan pabrik demo minimarket?')) {
                resetDatabaseDemo();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database Demo</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all min-h-[42px]"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Toko</span>
          </button>
        </div>
      </form>
    </div>
  );
};
