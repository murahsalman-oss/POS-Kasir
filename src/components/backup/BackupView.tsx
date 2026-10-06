import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { DatabaseBackup, Download, FileText, Search, ShieldCheck, Terminal } from 'lucide-react';

export const BackupView: React.FC = () => {
  const { auditLogs, showToast } = useApp();
  const [logFilter, setLogFilter] = useState('');

  const handleDownloadBackupSql = () => {
    const sqlContent = StorageService.generateSqlDump();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `backup_pos_minimarket_${timestamp}.sql`;

    const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Backup Berhasil', `File "${filename}" berhasil di-generate dan diunduh.`);
  };

  const filteredLogs = auditLogs.filter((l) => {
    const q = logFilter.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseBackup className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Backup Database SQL & Audit Log</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor struktur & data database MySQL serta pantau jejak audit aktivitas pengguna.
          </p>
        </div>

        <button
          onClick={handleDownloadBackupSql}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all min-h-[40px]"
        >
          <Download className="w-4 h-4" />
          <span>Download Backup SQL Sekarang</span>
        </button>
      </div>

      {/* SQL Restore Instructions Guide */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          Panduan Restore Database di Shared Hosting / phpMyAdmin
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Cara 1: Melalui cPanel phpMyAdmin</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Buka cPanel hosting Anda, lalu klik menu <strong>phpMyAdmin</strong>.</li>
              <li>Pilih nama database minimarket Anda di panel sebelah kiri.</li>
              <li>Klik tab <strong>Import</strong> di bagian menu atas.</li>
              <li>Pilih file <code>.sql</code> hasil backup yang baru diunduh.</li>
              <li>Klik tombol <strong>Go / Kirim</strong> di bagian bawah untuk mengeksekusi restore.</li>
            </ol>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Cara 2: Melalui Terminal / SSH Command Line</span>
            <p className="text-slate-600">Jalankan perintah mysql restore berikut di server:</p>
            <div className="p-2.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
              mysql -u username_db -p nama_database &lt; backup_pos_minimarket_*.sql
            </div>
            <p className="text-[10px] text-slate-500">Masukkan password user MySQL saat diminta.</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Audit Log Jejak Aktivitas Sistem</h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              placeholder="Cari audit log..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Mobile Audit Log Cards (md:hidden) */}
        <div className="md:hidden p-3 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-4">Tidak ada log aktivitas.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px] shrink-0">
                    {log.module}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                  <span>{log.userName} • {log.ipAddress}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Aktivitas</th>
                <th className="py-3 px-4">Detail Keterangan</th>
                <th className="py-3 px-4 font-mono">IP Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{log.userName}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{log.action}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">{log.details}</td>
                  <td className="py-2.5 px-4 text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
