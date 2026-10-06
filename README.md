# POS MINIMARKET PRO - SISTEM KASIR & MANAJEMEN TOKO WEB

Aplikasi Point of Sale (POS) Minimarket berbasis web lengkap, modern, responsif, aman, dan siap dipasang pada shared hosting / cPanel (PHP 8.0+ & MySQL / MariaDB).

---

## 1. FITUR UTAMA SISTEM

* **Autentikasi & RBAC (Role-Based Access Control)**:
  * Super Admin: Akses penuh ke seluruh menu, HPP modal, laba rugi, pengguna, dan backup SQL.
  * Kasir: Akses transaksi POS, scan barcode USB, cetak struk, dan closing shift. Terproteksi dari data harga beli modal dan pengaturan sensitif.
  * Manajer: Akses transaksi, master produk, pembelian supplier, stok opname, dan laporan.
* **Point of Sale (Kasir)**:
  * Layout responsif minimarket (katalog kiri, keranjang kanan).
  * Dukungan Barcode Scanner USB (Keyboard HID auto-detect dengan audio beep).
  * Diskon per item & diskon global transaksi.
  * Hold / Suspend transaksi & resume transaksi tertahan.
  * Multi metode pembayaran: Tunai (Cash), QRIS, Transfer Bank, Debit, Kredit, E-Wallet.
  * Perhitungan uang kembalian otomatis & proteksi pembayaran kurang.
* **Cetak Struk Thermal**:
  * Format kertas 58mm & 80mm.
  * Print stylesheet ESC/POS thermal printer.
  * Nomor transaksi unik otomatis: `TRX-YYYYMMDD-XXXXXX`.
* **Manajemen Stok Otomatis**:
  * Penjualan: Stok berkurang otomatis.
  * Pembelian supplier: Stok bertambah otomatis.
  * Retur penjualan: Stok dikembalikan otomatis.
  * Retur pembelian: Stok berkurang otomatis.
  * Kartu mutasi stok lengkap (sebelum, masuk, keluar, sesudah, user, timestamp).
* **Shift Kasir & Closing**:
  * Input modal awal laci kasir saat buka shift.
  * Rekonsiliasi uang fisik vs uang sistem di laci saat closing.
  * Perhitungan selisih kas (lebih/kurang/pas) & cetak struk closing.
* **Laporan Lengkap & Laba/Rugi Sederhana**:
  * Omzet - HPP (Harga Pokok) - Diskon - Retur - Beban Biaya Operasional = Estimasi Laba Bersih.
  * Produk terlaris & valuasi aset stok.
  * Ekspor data ke CSV/Excel & format cetak print-ready.
* **Backup Database**:
  * Download instan file `.sql` database runnable.
  * Audit log aktivitas penting pengguna (login, trx, perubahan produk, closing).

---

## 2. KEBUTUHAN SISTEM SERVER (HOSTING CPANEL)

* **Web Server**: Apache dengan `mod_rewrite` aktif atau Nginx
* **PHP**: Versi 8.0 atau lebih baru
* **Ekstensi PHP**:
  * `pdo_mysql`
  * `json`
  * `mbstring`
  * `openssl`
* **Database**: MySQL 8.0+ atau MariaDB 10.4+
* **Hosting**: Shared hosting cPanel, Cloud Hosting, atau VPS

---

## 3. PANDUAN INSTALASI DI SHARED HOSTING (cPanel)

Ikuti 10 langkah berikut untuk memasang aplikasi ke hosting cPanel Anda:

### Langkah 1: Upload File ke Hosting
1. Login ke cPanel hosting Anda (`namadomain.com/cpanel`).
2. Buka menu **File Manager**.
3. Masuk ke direktori `public_html` (atau folder subdomain Anda).
4. Upload seluruh file project aplikasi ini.

### Langkah 2: Buat Database MySQL
1. Di cPanel, buka menu **MySQL Databases** atau **MySQL Database Wizard**.
2. Masukkan nama database baru, misalnya: `cpaneluser_posminimarket`.
3. Klik **Create Database**.

### Langkah 3: Buat User Database & Berikan Privileges
1. Buat username database baru, misalnya: `cpaneluser_posuser`.
2. Generate password yang aman dan simpan password tersebut.
3. Hubungkan user ke database dan centang **ALL PRIVILEGES** (Semua Hak Akses).

### Langkah 4: Import database.sql
1. Di cPanel, buka menu **phpMyAdmin**.
2. Pilih nama database yang baru dibuat di kolom sebelah kiri.
3. Klik tab **Import** pada menu atas.
4. Klik **Choose File** dan pilih file `database/database.sql` dari project ini.
5. Klik tombol **Go** / **Kirim** di bagian bawah. Semua tabel dan data default akan otomatis terbuat.

### Langkah 5: Konfigurasi Koneksi Database PHP
1. Di File Manager, buka file `config/database.php`.
2. Sesuaikan baris konfigurasi berikut:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'cpaneluser_posminimarket');
   define('DB_USER', 'cpaneluser_posuser');
   define('DB_PASS', 'password_database_anda');
   define('DB_PORT', '3306');
   ```
3. Simpan perubahan file (`Save Changes`).

### Langkah 6: Atur Permission Folder Uploads
1. Pastikan folder `uploads/` memiliki permission **755** (atau **777** jika server memerlukan write access).
2. Folder ini digunakan untuk menyimpan foto produk dan file log cadangan.

### Langkah 7: Pastikan Versi PHP 8.0+
1. Buka menu **MultiPHP Manager** atau **Select PHP Version** di cPanel.
2. Pastikan domain Anda menggunakan **PHP 8.0** atau versi yang lebih tinggi.

### Langkah 8: Login Pertama Kali
Buka website Anda melalui browser (`https://namadomain.com`):

* **Akun Super Admin**:
  * Username: `admin123`
  * Password: `123456`
* **Akun Kasir**:
  * Username: `kasir`
  * Password: `123456`

### Langkah 9: Ubah Password Default
1. Masuk sebagai Super Admin.
2. Buka menu **Pengguna & Hak Akses**.
3. Ganti password default kedua akun tersebut demi keamanan sistem Anda.

### Langkah 10: Pengaturan Toko & Mulai Transaksi
1. Buka menu **Pengaturan Toko**: Atur nama toko, slogan, alamat, nomor telepon WhatsApp, dan catatan kaki struk thermal.
2. Toko Anda siap digunakan untuk operasional minimarket sehari-hari!

---

## 4. TOMBOL SHORTCUT KEYBOARD KASIR

Untuk mempercepat kecepatan pelayanan di meja kasir, gunakan shortcut berikut:

| Tombol | Fungsi |
|---|---|
| **F1** | Fokus ke kolom pencarian produk |
| **F2** | Buka dialog Scan Barcode / Input Barcode USB |
| **F3** | Buka jendela pembayaran (Checkout) |
| **F4** | Tahan transaksi saat ini (Hold Order) |
| **F5** | Buka daftar transaksi yang sedang ditahan (Resume) |
| **F9** | Cetak ulang struk belanja terakhir |
| **ESC** | Batal / Tutup modal / Kosongkan keranjang |

---

## 5. KEAMANAN SISTEM

* **Password Hashing**: Menggunakan `password_hash()` standar `PASSWORD_BCRYPT` dan diverifikasi dengan `password_verify()`.
* **SQL Injection Protection**: Menggunakan PDO dengan real Prepared Statements (`PDO::ATTR_EMULATE_PREPARES => false`) dan parameter binding.
* **XSS Protection**: Sanitasi output HTML dengan `htmlspecialchars()`.
* **CSRF Token**: Perlindungan form transaksi via token acak session.
* **Session Security**: Cookie `HttpOnly`, `SameSite=Lax`, dan `Secure` aktif pada HTTPS.
* **File Upload Validation**: Pemeriksaan tipe MIME, ekstensi gambar yang diizinkan (JPG, PNG, WebP), dan limit ukuran maksimal 10MB.
* **Audit Trail**: Setiap aktivitas login, transaksi, modifikasi harga, dan closing kasir tercatat dalam tabel `audit_logs`.
