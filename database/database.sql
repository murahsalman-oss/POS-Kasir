-- =====================================================================
-- DATABASE: pos_minimarket
-- SISTEM POINT OF SALE & MANAJEMEN INVENTORI MINIMARKET BERBASIS WEB
-- Target Platform: PHP 8.2+ & MySQL 8.0 / MariaDB 10.4+ (cPanel / Shared Hosting)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- ---------------------------------------------------------------------
-- 1. Tabel users & roles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `role_name`, `display_name`, `description`) VALUES
(1, 'super_admin', 'Super Administrator', 'Akses penuh seluruh modul, konfigurasi, backup, dan laporan'),
(2, 'kasir', 'Kasir', 'Akses transaksi POS, scan barcode, cetak struk, dan closing kasir'),
(3, 'manajer', 'Manajer Toko', 'Akses transaksi, inventori, stok, laporan, dan supplier')
ON DUPLICATE KEY UPDATE `display_name`=VALUES(`display_name`);

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'kasir',
  `email` VARCHAR(100),
  `phone` VARCHAR(30),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password default '123456' dibcrypt dengan PASSWORD_BCRYPT
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`, `email`, `phone`, `is_active`) VALUES
(1, 'admin123', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Budi Santoso', 'super_admin', 'admin@minimarketberkah.com', '081234567890', 1),
(2, 'kasir', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Siti Rahmawati', 'kasir', 'kasir@minimarketberkah.com', '081987654321', 1),
(3, 'manajer', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Ahmad Fadillah', 'manajer', 'manajer@minimarketberkah.com', '081377889900', 1)
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- ---------------------------------------------------------------------
-- 2. Master Kategori & Satuan
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `code`, `name`, `description`) VALUES
(1, 'MK01', 'Makanan Instan & Mie', 'Mie instan, bubur instan, sup instan'),
(2, 'MN01', 'Minuman Dingin & Hangat', 'Air mineral, teh, kopi, jus, susu'),
(3, 'SN01', 'Snack & Makanan Ringan', 'Keripik, biskuit, kacang, cokelat'),
(4, 'SB01', 'Sembako & Bumbu Dapur', 'Beras, minyak, gula, garam, bumbu'),
(5, 'PR01', 'Perawatan Tubuh & Mandi', 'Sabun, sampo, pasta gigi, detergen'),
(6, 'RT01', 'Kebutuhan Rumah Tangga', 'Pembersih lantai, tisu, obat nyamuk'),
(7, 'OB01', 'Obat & P3K Ringan', 'Minyak kayu putih, tolak angin, paracetamol');

CREATE TABLE IF NOT EXISTS `units` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `units` (`id`, `code`, `name`) VALUES
(1, 'PCS', 'Pcs / Buah'),
(2, 'BKS', 'Bungkus / Pack'),
(3, 'BTL', 'Botol'),
(4, 'KRG', 'Karung / Sak'),
(5, 'KTN', 'Karton / Dus'),
(6, 'KLG', 'Kaleng');

-- ---------------------------------------------------------------------
-- 3. Master Supplier & Pelanggan
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `address` TEXT,
  `phone` VARCHAR(30),
  `email` VARCHAR(100),
  `npwp` VARCHAR(50),
  `contact_person` VARCHAR(100),
  `notes` TEXT,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `suppliers` (`id`, `code`, `name`, `address`, `phone`, `email`, `contact_person`, `status`) VALUES
(1, 'SUP-001', 'PT Indofood CBP Sukses Makmur Tbk', 'Kawasan Industri Pulogadung, Jakarta Timur', '021-4601234', 'order@indofood.co.id', 'Bpk. Hendra Gunawan', 'active'),
(2, 'SUP-002', 'PT Mayora Indah Tbk', 'Jl. Daan Mogot KM 18, Tangerang', '021-5436789', 'sales@mayora.co.id', 'Ibu Ratna Dewi', 'active'),
(3, 'SUP-003', 'PT Unilever Indonesia Tbk', 'BSD City Green Office Park, Tangerang', '021-80827000', 'distribusi@unilever.com', 'Bpk. Rahmat Santoso', 'active'),
(4, 'SUP-004', 'Distributor Sembako Nusantara Sejahtera', 'Pasar Induk Kramat Jati Blok C No. 12, Jakarta', '081298765432', 'sembakojaya@gmail.com', 'Haji Mansyur', 'active');

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30),
  `address` TEXT,
  `email` VARCHAR(100),
  `is_member` TINYINT(1) NOT NULL DEFAULT 0,
  `points` INT NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `customers` (`id`, `code`, `name`, `phone`, `address`, `is_member`, `points`, `total_spent`) VALUES
(1, 'PLG-000', 'Pelanggan Umum', '-', 'Dalam Toko', 0, 0, 4500000.00),
(2, 'PLG-001', 'Ibu Hj. Aminah (Member Gold)', '081234112233', 'Jl. Melati No. 12, Kebayoran Baru', 1, 150, 1250000.00),
(3, 'PLG-002', 'Pak Rudi Pratama (Member Silver)', '085678334455', 'Komplek Permata Indah Blok B-3', 1, 75, 680000.00);

-- ---------------------------------------------------------------------
-- 4. Master Produk
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `barcode` VARCHAR(50) NOT NULL UNIQUE,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `category_id` INT,
  `unit_id` INT,
  `buy_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `sell_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 5,
  `discount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `supplier_id` INT,
  `shelf_location` VARCHAR(100),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `image_url` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_barcode` (`barcode`),
  INDEX `idx_name` (`name`),
  INDEX `idx_category` (`category_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `barcode`, `sku`, `name`, `category_id`, `unit_id`, `buy_price`, `sell_price`, `stock`, `min_stock`, `discount`, `tax`, `supplier_id`, `shelf_location`, `is_active`) VALUES
(1, '8999999999999', 'MIE-IND-GOR', 'Indomie Mi Goreng Spesial 85g', 1, 2, 2600.00, 3500.00, 98, 24, 0, 0, 1, 'Rak A-01 Makanan', 1),
(2, '8998866200213', 'MIE-IND-AYM', 'Indomie Kuah Rasa Ayam Bawang 69g', 1, 2, 2500.00, 3500.00, 80, 24, 0, 0, 1, 'Rak A-01 Makanan', 1),
(3, '8992761111019', 'MNM-AQU-600', 'Aqua Air Mineral Botol 600ml', 2, 3, 2800.00, 4000.00, 144, 30, 0, 0, 2, 'Chiller Depan 01', 1),
(4, '8991389220015', 'MNM-TEH-BOT', 'Teh Botol Sosro Kotak 250ml', 2, 1, 3200.00, 4500.00, 65, 20, 0, 0, 2, 'Chiller Depan 02', 1),
(5, '8998009010231', 'MNM-ULT-SUS', 'Ultra Milk Cokelat UHT 250ml', 2, 1, 5800.00, 7500.00, 52, 15, 0, 0, 2, 'Chiller Depan 03', 1),
(6, '8992775215037', 'SNK-CHI-SAP', 'Chitato Rasa Sapi Panggang 68g', 3, 2, 8900.00, 11500.00, 35, 12, 500.00, 0, 1, 'Rak B-02 Snack', 1),
(7, '8993175537554', 'SBK-MIN-BIM', 'Bimoli Minyak Goreng Pouch 2 Liter', 4, 2, 32000.00, 38000.00, 24, 10, 0, 0, 4, 'Rak C-01 Sembako', 1),
(8, '8992745330018', 'SBK-GUL-KUU', 'Gulaku Gula Pasir Tebu Putih 1kg', 4, 2, 15500.00, 18500.00, 45, 15, 0, 0, 4, 'Rak C-02 Sembako', 1),
(9, '8992772010116', 'SBK-BER-RAM', 'Beras Ramos Premium Setra Ramos 5kg', 4, 4, 65000.00, 74000.00, 18, 8, 0, 0, 4, 'Palet Bawah Sembako', 1),
(10, '8999999001128', 'PRW-LIF-RED', 'Lifebuoy Sabun Mandi Cair Total 10 450ml', 5, 2, 21000.00, 26500.00, 6, 10, 0, 0, 3, 'Rak D-01 Toiletries', 1),
(11, '8999999052144', 'PRW-SUN-SHP', 'Sunsilk Sampo Black Shine 160ml', 5, 3, 19500.00, 24000.00, 0, 8, 0, 0, 3, 'Rak D-02 Toiletries', 1),
(12, '8993005234112', 'RMT-SOK-DET', 'So Klin Pewangi Pakaian Pink 900ml', 6, 2, 12000.00, 15500.00, 22, 10, 0, 0, 3, 'Rak E-01 Kebersihan', 1);

-- ---------------------------------------------------------------------
-- 5. Shift Kasir
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cashier_shifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cashier_id` INT NOT NULL,
  `opened_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` DATETIME NULL,
  `initial_cash` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `expected_cash` DECIMAL(15,2) NULL,
  `actual_cash` DECIMAL(15,2) NULL,
  `difference` DECIMAL(15,2) NULL,
  `total_sales_cash` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_sales_non_cash` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_cash_in` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_cash_out` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('open','closed') NOT NULL DEFAULT 'open',
  `notes` TEXT,
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cashier_shifts` (`id`, `cashier_id`, `opened_at`, `initial_cash`, `total_sales_cash`, `total_sales_non_cash`, `total_cash_out`, `status`, `notes`) VALUES
(1, 2, '2026-10-06 07:00:00', 250000.00, 128500.00, 95500.00, 25000.00, 'open', 'Shift Pagi Operasional Aktif');

-- ---------------------------------------------------------------------
-- 6. Transaksi Penjualan & Items & Payments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `sale_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cashier_id` INT NOT NULL,
  `customer_id` INT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `discount_nominal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tax_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'tunai',
  `shift_id` INT NULL,
  `note` TEXT,
  `status` ENUM('selesai','retur_sebagian','retur_total','batal') NOT NULL DEFAULT 'selesai',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sale_date` (`sale_date`),
  INDEX `idx_invoice` (`invoice_number`),
  FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`),
  FOREIGN KEY (`shift_id`) REFERENCES `cashier_shifts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sale_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `buy_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `sell_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `discount_nominal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  INDEX `idx_sale_item_sale` (`sale_id`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sale_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sale_id` INT NOT NULL,
  `method` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `reference_number` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sales` (`id`, `invoice_number`, `sale_date`, `cashier_id`, `customer_id`, `subtotal`, `discount_nominal`, `tax_percent`, `tax_amount`, `grand_total`, `paid_amount`, `change_amount`, `payment_method`, `shift_id`, `status`) VALUES
(1, 'TRX-20261006-000001', '2026-10-06 07:15:22', 2, 1, 11000.00, 0.00, 0.00, 0.00, 11000.00, 20000.00, 9000.00, 'tunai', 1, 'selesai'),
(2, 'TRX-20261006-000002', '2026-10-06 07:42:10', 2, 2, 56500.00, 2000.00, 0.00, 0.00, 54500.00, 54500.00, 0.00, 'qris', 1, 'selesai');

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `buy_price`, `sell_price`, `quantity`, `discount_nominal`, `subtotal`) VALUES
(1, 1, 1, 2600.00, 3500.00, 2, 0.00, 7000.00),
(2, 1, 3, 2800.00, 4000.00, 1, 0.00, 4000.00),
(3, 2, 7, 32000.00, 38000.00, 1, 0.00, 38000.00),
(4, 2, 8, 15500.00, 18500.00, 1, 0.00, 18500.00);

INSERT INTO `sale_payments` (`id`, `sale_id`, `method`, `amount`, `reference_number`) VALUES
(1, 1, 'tunai', 20000.00, NULL),
(2, 2, 'qris', 54500.00, 'QRIS-77491823');

-- ---------------------------------------------------------------------
-- 7. Pembelian Barang (Purchases)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `purchase_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `supplier_id` INT NOT NULL,
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'transfer',
  `status` ENUM('draft','selesai','dibayar_sebagian','lunas','batal') NOT NULL DEFAULT 'lunas',
  `note` TEXT,
  `created_by` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `buy_price` DECIMAL(15,2) NOT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `purchases` (`id`, `invoice_number`, `purchase_date`, `supplier_id`, `total_amount`, `paid_amount`, `payment_method`, `status`, `note`, `created_by`) VALUES
(1, 'PO-20261001-000001', '2026-10-01 10:00:00', 1, 562000.00, 562000.00, 'transfer', 'lunas', 'Restock mingguan mie instan', 'Budi Santoso');

INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `quantity`, `buy_price`, `subtotal`) VALUES
(1, 1, 1, 120, 2600.00, 312000.00),
(2, 1, 2, 100, 2500.00, 250000.00);

-- ---------------------------------------------------------------------
-- 8. Retur Penjualan & Retur Pembelian
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `returns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `return_number` VARCHAR(50) NOT NULL UNIQUE,
  `return_type` ENUM('penjualan','pembelian') NOT NULL,
  `reference_invoice` VARCHAR(50) NOT NULL,
  `return_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `party_name` VARCHAR(150),
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `reason` TEXT,
  `handled_by` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `return_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `return_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(15,2) NOT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL,
  `reason` VARCHAR(255),
  FOREIGN KEY (`return_id`) REFERENCES `returns`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Mutasi Stok (Stock Movement Ledger)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `movement_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `product_id` INT NOT NULL,
  `type` ENUM('penjualan','pembelian','retur_penjualan','retur_pembelian','penyesuaian') NOT NULL,
  `reference` VARCHAR(50) NOT NULL,
  `stock_before` INT NOT NULL,
  `stock_in` INT NOT NULL DEFAULT 0,
  `stock_out` INT NOT NULL DEFAULT 0,
  `stock_after` INT NOT NULL,
  `user_id` INT,
  `user_name` VARCHAR(100),
  `note` TEXT,
  INDEX `idx_stock_prod_date` (`product_id`, `movement_date`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `stock_movements` (`id`, `movement_date`, `product_id`, `type`, `reference`, `stock_before`, `stock_in`, `stock_out`, `stock_after`, `user_id`, `user_name`, `note`) VALUES
(1, '2026-10-06 07:15:22', 1, 'penjualan', 'TRX-20261006-000001', 100, 0, 2, 98, 2, 'Siti Rahmawati', 'Penjualan Kasir'),
(2, '2026-10-06 07:15:22', 3, 'penjualan', 'TRX-20261006-000001', 145, 0, 1, 144, 2, 'Siti Rahmawati', 'Penjualan Kasir');

-- ---------------------------------------------------------------------
-- 10. Kas Masuk, Kas Keluar & Pengeluaran (Expenses)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cash_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` ENUM('masuk','keluar') NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` TEXT,
  `user_id` INT,
  `user_name` VARCHAR(100),
  `reference` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cash_date` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expense_date` DATE NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `recipient` VARCHAR(150),
  `note` TEXT,
  `user_id` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cash_transactions` (`id`, `transaction_date`, `type`, `category`, `amount`, `description`, `user_id`, `user_name`, `reference`) VALUES
(1, '2026-10-06 07:00:00', 'masuk', 'Modal Awal Kasir', 250000.00, 'Modal awal laci kasir shift pagi', 2, 'Siti Rahmawati', 'SHIFT-101'),
(2, '2026-10-06 07:30:00', 'keluar', 'Operasional Toko', 25000.00, 'Beli air galon & kantong kresek darurat', 2, 'Siti Rahmawati', 'BIAYA-001');

-- ---------------------------------------------------------------------
-- 11. Pengaturan Toko (Settings)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'MINIMARKET BERKAH JAYA'),
('tagline', 'Lengkap, Murah, dan Berkah Setiap Hari'),
('address', 'Jl. Merdeka Raya No. 45, Kebayoran Baru, Jakarta Selatan'),
('phone', '021-78945612 / 0812-3456-7890'),
('email', 'info@minimarketberkah.com'),
('website', 'www.minimarketberkah.com'),
('npwp', '01.234.567.8-012.000'),
('receipt_header', 'MINIMARKET BERKAH JAYA\nJl. Merdeka Raya No. 45 Jakarta\nTelp: 021-78945612'),
('receipt_footer', 'TERIMA KASIH ATAS KUNJUNGAN ANDA\nBarang yang sudah dibeli dapat ditukar 1x24 jam\nMenyertakan struk belanja asli'),
('invoice_prefix', 'TRX'),
('default_tax_percent', '0'),
('currency', 'IDR'),
('date_format', 'DD/MM/YYYY HH:mm'),
('low_stock_threshold', '10'),
('thermal_paper_size', '58mm')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- ---------------------------------------------------------------------
-- 12. Audit Log Aktivitas Pengguna
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT,
  `user_name` VARCHAR(150),
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  INDEX `idx_log_timestamp` (`timestamp`),
  INDEX `idx_log_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `timestamp`, `user_id`, `user_name`, `action`, `module`, `details`, `ip_address`) VALUES
(1, '2026-10-06 07:00:00', 2, 'Siti Rahmawati', 'Buka Shift Kasir', 'Kasir', 'Membuka shift kasir dengan modal awal Rp 250.000', '192.168.1.102'),
(2, '2026-10-06 07:15:22', 2, 'Siti Rahmawati', 'Transaksi Penjualan', 'Kasir', 'Transaksi TRX-20261006-000001 senilai Rp 11.000 (Tunai)', '192.168.1.102'),
(3, '2026-10-06 08:00:00', 1, 'Budi Santoso', 'Login Super Admin', 'Autentikasi', 'Berhasil login ke sistem Super Admin', '192.168.1.100');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
