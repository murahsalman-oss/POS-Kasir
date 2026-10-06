import React, { useState } from 'react';
import {
  Server,
  FolderTree,
  Database,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Download,
  BookOpen
} from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const projectTree = `pos-minimarket/
│
├── config/
│   ├── database.php      # Koneksi PDO MySQL & parameter binding
│   ├── app.php           # Inisialisasi session aman, CSRF token, helper rupiah
│   └── auth.php          # Middleware RBAC & proteksi hak akses kasir/admin
│
├── public/
│   ├── index.php         # Entry point aplikasi web
│   └── assets/
│       ├── css/          # Bootstrap 5 & thermal print stylesheet
│       ├── js/           # Handler fetch API, scanner USB, audio synth
│       └── images/       # Foto produk & logo toko
│
├── admin/
│   ├── dashboard.php     # Ringkasan KPI omzet & grafik penjualan
│   ├── produk/           # CRUD produk, generate EAN-13, cetak label rak
│   ├── kategori/         # Master kategori & satuan barang
│   ├── supplier/         # Data distributor & pemasok
│   ├── pelanggan/        # Data pelanggan & member poin
│   ├── pengguna/         # Manajemen user & role permission
│   ├── pembelian/        # Faktur restock supplier & auto-stok
│   ├── stok/             # Kartu mutasi stok & stock opname
│   ├── laporan/          # Laporan penjualan, laba/rugi, valuasi stok
│   └── pengaturan/       # Setting toko, receipt footer, printer 58mm/80mm
│
├── kasir/
│   ├── index.php         # Antarmuka utama kasir minimarket (POS)
│   ├── transaksi.php     # Logika checkout transaksi tunai & non-tunai
│   ├── riwayat.php       # Riwayat transaksi shift kasir
│   └── closing.php       # Rekonsiliasi kas fisik & closing shift
│
├── api/
│   ├── produk.php        # API pencarian produk & barcode scanner
│   ├── transaksi.php     # Endpoint transaksi penjualan kasir (atomic)
│   └── closing.php       # Simpan closing kasir
│
├── database/
│   └── database.sql      # DDL 20+ tabel relasional & sample minimarket data
│
├── uploads/              # Folder foto produk (chmod 755 / 777)
├── .htaccess             # Proteksi direktori config, database & backup
├── .env.example          # Template environment variabel database
└── README.md             # Dokumentasi panduan instalasi cPanel lengkap`;

  const dbConfigCode = `<?php
/**
 * config/database.php - PDO Connection untuk MySQL / MariaDB
 */
declare(strict_types=1);

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'pos_minimarket');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Mencegah SQL Injection
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
        }
        return self::$instance;
    }
}`;

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Server className="w-4 h-4" />
          <span>Panduan Deployment Production & Shared Hosting</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black mt-1">Paket Hosting cPanel & Source Code PHP MySQL</h2>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Aplikasi ini dirancang khusus untuk berjalan dengan performa tinggi pada hosting biasa (shared hosting / cPanel) dengan PHP 8.0+ dan MySQL / MariaDB tanpa memerlukan runtime server Node.js khusus di production!
        </p>
      </div>

      {/* AKUN LOGIN DEFAULT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-600" />
          Akun Login Default (Sesuai Spesifikasi)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-950 uppercase">Akun Super Admin</span>
              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 font-bold text-[10px]">super_admin</span>
            </div>
            <div className="font-mono space-y-1 text-slate-700">
              <div>Username : <strong className="text-purple-900">admin123</strong></div>
              <div>Password : <strong className="text-purple-900">123456</strong></div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Memiliki akses penuh ke seluruh modul, HPP, laba rugi, dan backup database.</div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-950 uppercase">Akun Kasir Toko</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold text-[10px]">kasir</span>
            </div>
            <div className="font-mono space-y-1 text-slate-700">
              <div>Username : <strong className="text-emerald-900">kasir</strong></div>
              <div>Password : <strong className="text-emerald-900">123456</strong></div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Hanya dapat mengakses transaksi penjualan kasir, scan barcode, dan closing shift.</div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP CPANEL HOSTING GUIDE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Langkah Mudah Instalasi di cPanel Shared Hosting (10 Langkah)
        </h3>

        <div className="space-y-3 text-xs text-slate-700">
          {[
            {
              step: 'Langkah 1',
              title: 'Login ke cPanel',
              desc: 'Buka browser dan login ke cPanel hosting Anda (misal: namadomain.com/cpanel).'
            },
            {
              step: 'Langkah 2',
              title: 'Buat Database MySQL',
              desc: 'Masuk ke menu "MySQL Database Wizard", buat database baru misalnya "pos_minimarket".'
            },
            {
              step: 'Langkah 3',
              title: 'Buat User Database',
              desc: 'Buat user database baru dan berikan hak akses "ALL PRIVILEGES" ke database tersebut.'
            },
            {
              step: 'Langkah 4',
              title: 'Import database.sql melalui phpMyAdmin',
              desc: 'Buka menu "phpMyAdmin", pilih database yang baru dibuat, klik tab "Import", lalu upload file "database/database.sql" yang ada di project ini.'
            },
            {
              step: 'Langkah 5',
              title: 'Upload Source Code ke File Manager',
              desc: 'Buka File Manager cPanel, masuk ke direktori public_html (atau subdomain), lalu upload seluruh file project ini.'
            },
            {
              step: 'Langkah 6',
              title: 'Atur Konfigurasi Database',
              desc: 'Buka file "config/database.php", masukkan DB_NAME, DB_USER, dan DB_PASS sesuai yang Anda buat pada Langkah 2 & 3.'
            },
            {
              step: 'Langkah 7',
              title: 'Atur Permission Folder Uploads',
              desc: 'Pastikan direktori "uploads/" memiliki hak akses permission 755 agar dapat menyimpan foto produk.'
            },
            {
              step: 'Langkah 8',
              title: 'Pastikan PHP Version 8.0+',
              desc: 'Di menu cPanel "Select PHP Version" atau "MultiPHP Manager", pastikan versi PHP diset minimal PHP 8.0 (atau lebih baru) dengan ekstensi pdo_mysql, json, mbstring, dan openssl aktif.'
            },
            {
              step: 'Langkah 9',
              title: 'Buka Website & Login',
              desc: 'Akses domain Anda di browser. Login menggunakan user "admin123" dan password "123456".'
            },
            {
              step: 'Langkah 10',
              title: 'Konfigurasi Toko & Siap Digunakan',
              desc: 'Buka menu Pengaturan Toko untuk menyesuaikan Nama Toko, Alamat, Footer Struk, lalu mulai bertransaksi di Kasir!'
            }
          ].map((s, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h5 className="font-bold text-slate-900">{s.title}</h5>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STRUKTUR FOLDER PROJECT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            Struktur Folder Aplikasi (Modular & Standar cPanel)
          </h3>
          <button
            onClick={() => copyToClipboard(projectTree, 'tree')}
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
          >
            {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Salin Struktur</span>
          </button>
        </div>
        <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
          {projectTree}
        </pre>
      </div>

      {/* KONFIGURASI DATABASE PHP */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            Source Code config/database.php
          </h3>
          <button
            onClick={() => copyToClipboard(dbConfigCode, 'config')}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {copiedSection === 'config' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Salin Kode</span>
          </button>
        </div>
        <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
          {dbConfigCode}
        </pre>
      </div>

      {/* CHECKLIST PENGUJIAN SEBELUM GO-LIVE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Checklist Pengujian Operasional Minimarket
        </h3>
        <div className="space-y-2 text-xs">
          {[
            'Login Admin (admin123 / 123456) berhasil masuk ke semua modul',
            'Login Kasir (kasir / 123456) terproteksi dari menu user, settings & laba rugi',
            'Tambah produk Indomie Goreng (Barcode: 8999999999999, Jual: Rp 3.500, Stok: 100)',
            'Buka shift kasir dengan input modal awal Rp 250.000',
            'Scan barcode di kasir (F2) & jual Indomie 2 pcs (Total Rp 7.000)',
            'Pembayaran uang pas / uang lebih (Rp 10.000, kembalian Rp 3.000)',
            'Stok otomatis berkurang dari 100 menjadi 98 dan tercatat di kartu mutasi stok',
            'Cetak struk belanja format thermal 58mm / 80mm',
            'Tutup kasir (Closing shift) mencatat selisih fisik vs sistem',
            'Laporan laba/rugi menghitung omzet dikurangi HPP dan pengeluaran'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 text-emerald-950 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
