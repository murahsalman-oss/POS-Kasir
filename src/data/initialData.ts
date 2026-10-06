import {
  Category,
  Unit,
  Supplier,
  Customer,
  Product,
  StoreSettings,
  User,
  CashierShift,
  Sale,
  Purchase,
  CashTransaction,
  StockMovement,
  AuditLog
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin123',
    fullName: 'Budi Santoso (Super Admin)',
    role: 'super_admin',
    email: 'admin@minimarketberkah.com',
    phone: '081234567890',
    isActive: true,
    lastLogin: '2026-10-06 08:00:00',
    createdAt: '2026-01-01 00:00:00',
  },
  {
    id: 'usr-2',
    username: 'kasir',
    fullName: 'Siti Rahmawati (Kasir Shift Pagi)',
    role: 'kasir',
    email: 'kasir@minimarketberkah.com',
    phone: '081987654321',
    isActive: true,
    lastLogin: '2026-10-06 07:45:00',
    createdAt: '2026-01-15 00:00:00',
  },
  {
    id: 'usr-3',
    username: 'manajer',
    fullName: 'Ahmad Fadillah (Manajer Toko)',
    role: 'manajer',
    email: 'manajer@minimarketberkah.com',
    phone: '081377889900',
    isActive: true,
    createdAt: '2026-02-01 00:00:00',
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'MINIMARKET BERKAH JAYA',
  tagline: 'Lengkap, Murah, dan Berkah Setiap Hari',
  address: 'Jl. Merdeka Raya No. 45, Kebayoran Baru, Jakarta Selatan',
  phone: '021-78945612 / 0812-3456-7890',
  email: 'info@minimarketberkah.com',
  website: 'www.minimarketberkah.com',
  npwp: '01.234.567.8-012.000',
  receiptHeader: 'MINIMARKET BERKAH JAYA\nJl. Merdeka Raya No. 45 Jakarta\nTelp: 021-78945612',
  receiptFooter: 'TERIMA KASIH ATAS KUNJUNGAN ANDA\nBarang yang sudah dibeli dapat ditukar 1x24 jam\nMenyertakan struk belanja asli\nKritik & Saran WA: 0812-3456-7890',
  invoicePrefix: 'TRX',
  defaultTaxPercent: 0, // Minimarket retail usually includes tax in sell price or 0%
  currency: 'IDR',
  dateFormat: 'DD/MM/YYYY HH:mm',
  lowStockThreshold: 10,
  thermalPaperSize: '58mm'
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', code: 'MK01', name: 'Makanan Instan & Mie', description: 'Mie instan, bubur instan, sup instan', icon: 'Soup' },
  { id: 'cat-2', code: 'MN01', name: 'Minuman Dingin & Hangat', description: 'Air mineral, teh, kopi, jus, susu', icon: 'Coffee' },
  { id: 'cat-3', code: 'SN01', name: 'Snack & Makanan Ringan', description: 'Keripik, biskuit, kacang, cokelat', icon: 'Cookie' },
  { id: 'cat-4', code: 'SB01', name: 'Sembako & Bumbu Dapur', description: 'Beras, minyak, gula, garam, kecap', icon: 'Wheat' },
  { id: 'cat-5', code: 'PR01', name: 'Perawatan Tubuh & Mandi', description: 'Sabun, sampo, pasta gigi, detergen', icon: 'Sparkles' },
  { id: 'cat-6', code: 'RT01', name: 'Kebutuhan Rumah Tangga', description: 'Pembersih lantai, tisu, obat nyamuk', icon: 'Home' },
  { id: 'cat-7', code: 'OB01', name: 'Obat & P3K Ringan', description: 'Minyak kayu putih, tolak angin, paracetamol', icon: 'HeartPulse' }
];

export const INITIAL_UNITS: Unit[] = [
  { id: 'unt-1', code: 'PCS', name: 'Pcs / Buah' },
  { id: 'unt-2', code: 'BKS', name: 'Bungkus / Pack' },
  { id: 'unt-3', code: 'BTL', name: 'Botol' },
  { id: 'unt-4', code: 'KRG', name: 'Karung / Sak' },
  { id: 'unt-5', code: 'KTN', name: 'Karton / Dus' },
  { id: 'unt-6', code: 'KLG', name: 'Kaleng' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'PT Indofood CBP Sukses Makmur Tbk',
    address: 'Kawasan Industri Pulogadung, Jakarta Timur',
    phone: '021-4601234',
    email: 'order@indofood.co.id',
    contactPerson: 'Bpk. Hendra Gunawan',
    status: 'active'
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'PT Mayora Indah Tbk',
    address: 'Jl. Daan Mogot KM 18, Tangerang',
    phone: '021-5436789',
    email: 'sales@mayora.co.id',
    contactPerson: 'Ibu Ratna Dewi',
    status: 'active'
  },
  {
    id: 'sup-3',
    code: 'SUP-003',
    name: 'PT Unilever Indonesia Tbk',
    address: 'BSD City Green Office Park, Tangerang',
    phone: '021-80827000',
    email: 'distribusi@unilever.com',
    contactPerson: 'Bpk. Rahmat Santoso',
    status: 'active'
  },
  {
    id: 'sup-4',
    code: 'SUP-004',
    name: 'Distributor Sembako Nusantara Sejahtera',
    address: 'Pasar Induk Kramat Jati Blok C No. 12, Jakarta',
    phone: '081298765432',
    email: 'sembakojaya@gmail.com',
    contactPerson: 'Haji Mansyur',
    status: 'active'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst-1',
    code: 'PLG-000',
    name: 'Pelanggan Umum',
    phone: '-',
    address: 'Alamat Toko',
    isMember: false,
    points: 0,
    totalSpent: 4500000,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'cst-2',
    code: 'PLG-001',
    name: 'Ibu Hj. Aminah (Member Gold)',
    phone: '081234112233',
    address: 'Jl. Melati No. 12, Kebayoran Baru',
    email: 'aminah@gmail.com',
    isMember: true,
    points: 150,
    totalSpent: 1250000,
    createdAt: '2026-01-10 10:00:00'
  },
  {
    id: 'cst-3',
    code: 'PLG-002',
    name: 'Pak Rudi Pratama (Member Silver)',
    phone: '085678334455',
    address: 'Komplek Permata Indah Blok B-3',
    email: 'rudi.pratama@yahoo.com',
    isMember: true,
    points: 75,
    totalSpent: 680000,
    createdAt: '2026-02-15 14:20:00'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    barcode: '8999999999999',
    sku: 'MIE-IND-GOR',
    name: 'Indomie Mi Goreng Spesial 85g',
    categoryId: 'cat-1',
    unitId: 'unt-2',
    buyPrice: 2600,
    sellPrice: 3500,
    stock: 98,
    minStock: 24,
    discount: 0,
    tax: 0,
    supplierId: 'sup-1',
    shelfLocation: 'Rak A-01 Makanan',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-2',
    barcode: '8998866200213',
    sku: 'MIE-IND-AYM',
    name: 'Indomie Kuah Rasa Ayam Bawang 69g',
    categoryId: 'cat-1',
    unitId: 'unt-2',
    buyPrice: 2500,
    sellPrice: 3500,
    stock: 80,
    minStock: 24,
    discount: 0,
    tax: 0,
    supplierId: 'sup-1',
    shelfLocation: 'Rak A-01 Makanan',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01 08:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-3',
    barcode: '8992761111019',
    sku: 'MNM-AQU-600',
    name: 'Aqua Air Mineral Botol 600ml',
    categoryId: 'cat-2',
    unitId: 'unt-3',
    buyPrice: 2800,
    sellPrice: 4000,
    stock: 144,
    minStock: 30,
    discount: 0,
    tax: 0,
    supplierId: 'sup-2',
    shelfLocation: 'Chiller Depan 01',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-02 09:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-4',
    barcode: '8991389220015',
    sku: 'MNM-TEH-BOT',
    name: 'Teh Botol Sosro Kotak 250ml',
    categoryId: 'cat-2',
    unitId: 'unt-1',
    buyPrice: 3200,
    sellPrice: 4500,
    stock: 65,
    minStock: 20,
    discount: 0,
    tax: 0,
    supplierId: 'sup-2',
    shelfLocation: 'Chiller Depan 02',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-02 09:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-5',
    barcode: '8998009010231',
    sku: 'MNM-ULT-SUS',
    name: 'Ultra Milk Cokelat UHT 250ml',
    categoryId: 'cat-2',
    unitId: 'unt-1',
    buyPrice: 5800,
    sellPrice: 7500,
    stock: 52,
    minStock: 15,
    discount: 0,
    tax: 0,
    supplierId: 'sup-2',
    shelfLocation: 'Chiller Depan 03',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-03 10:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-6',
    barcode: '8992775215037',
    sku: 'SNK-CHI-SAP',
    name: 'Chitato Rasa Sapi Panggang 68g',
    categoryId: 'cat-3',
    unitId: 'unt-2',
    buyPrice: 8900,
    sellPrice: 11500,
    stock: 35,
    minStock: 12,
    discount: 500, // promo nominal Rp 500
    tax: 0,
    supplierId: 'sup-1',
    shelfLocation: 'Rak B-02 Snack',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-03 10:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-7',
    barcode: '8993175537554',
    sku: 'SBK-MIN-BIM',
    name: 'Bimoli Minyak Goreng Pouch 2 Liter',
    categoryId: 'cat-4',
    unitId: 'unt-2',
    buyPrice: 32000,
    sellPrice: 38000,
    stock: 24,
    minStock: 10,
    discount: 0,
    tax: 0,
    supplierId: 'sup-4',
    shelfLocation: 'Rak C-01 Sembako',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-04 11:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-8',
    barcode: '8992745330018',
    sku: 'SBK-GUL-KUU',
    name: 'Gulaku Gula Pasir Tebu Putih 1kg',
    categoryId: 'cat-4',
    unitId: 'unt-2',
    buyPrice: 15500,
    sellPrice: 18500,
    stock: 45,
    minStock: 15,
    discount: 0,
    tax: 0,
    supplierId: 'sup-4',
    shelfLocation: 'Rak C-02 Sembako',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-04 11:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-9',
    barcode: '8992772010116',
    sku: 'SBK-BER-RAM',
    name: 'Beras Ramos Premium Setra Ramos 5kg',
    categoryId: 'cat-4',
    unitId: 'unt-4',
    buyPrice: 65000,
    sellPrice: 74000,
    stock: 18,
    minStock: 8,
    discount: 0,
    tax: 0,
    supplierId: 'sup-4',
    shelfLocation: 'Palet Bawah Sembako',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05 12:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-10',
    barcode: '8999999001128',
    sku: 'PRW-LIF-RED',
    name: 'Lifebuoy Sabun Mandi Cair Total 10 450ml',
    categoryId: 'cat-5',
    unitId: 'unt-2',
    buyPrice: 21000,
    sellPrice: 26500,
    stock: 6, // Stock menipis (< 10)
    minStock: 10,
    discount: 0,
    tax: 0,
    supplierId: 'sup-3',
    shelfLocation: 'Rak D-01 Toiletries',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-05 12:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-11',
    barcode: '8999999052144',
    sku: 'PRW-SUN-SHP',
    name: 'Sunsilk Sampo Black Shine 160ml',
    categoryId: 'cat-5',
    unitId: 'unt-3',
    buyPrice: 19500,
    sellPrice: 24000,
    stock: 0, // Stock habis!
    minStock: 8,
    discount: 0,
    tax: 0,
    supplierId: 'sup-3',
    shelfLocation: 'Rak D-02 Toiletries',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-06 13:00:00',
    updatedAt: '2026-10-06 08:00:00'
  },
  {
    id: 'prd-12',
    barcode: '8993005234112',
    sku: 'RMT-SOK-DET',
    name: 'So Klin Pewangi Pakaian Pink 900ml',
    categoryId: 'cat-6',
    unitId: 'unt-2',
    buyPrice: 12000,
    sellPrice: 15500,
    stock: 22,
    minStock: 10,
    discount: 0,
    tax: 0,
    supplierId: 'sup-3',
    shelfLocation: 'Rak E-01 Kebersihan',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-01-06 13:00:00',
    updatedAt: '2026-10-06 08:00:00'
  }
];

export const INITIAL_SHIFTS: CashierShift[] = [
  {
    id: 'sft-101',
    cashierId: 'usr-2',
    cashierName: 'Siti Rahmawati',
    openedAt: '2026-10-06 07:00:00',
    initialCash: 250000,
    totalSalesCash: 128500,
    totalSalesNonCash: 95500,
    totalCashIn: 0,
    totalCashOut: 25000, // beli air galon
    status: 'open',
    notes: 'Shift Pagi Mulai Jam 07:00'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sal-1',
    invoiceNumber: 'TRX-20261006-000001',
    date: '2026-10-06 07:15:22',
    cashierId: 'usr-2',
    cashierName: 'Siti Rahmawati',
    customerId: 'cst-1',
    customerName: 'Pelanggan Umum',
    items: [
      {
        id: 'sali-1',
        saleId: 'sal-1',
        productId: 'prd-1',
        productName: 'Indomie Mi Goreng Spesial 85g',
        barcode: '8999999999999',
        buyPrice: 2600,
        sellPrice: 3500,
        quantity: 2,
        discountPercent: 0,
        discountNominal: 0,
        subtotal: 7000
      },
      {
        id: 'sali-2',
        saleId: 'sal-1',
        productId: 'prd-3',
        productName: 'Aqua Air Mineral Botol 600ml',
        barcode: '8992761111019',
        buyPrice: 2800,
        sellPrice: 4000,
        quantity: 1,
        discountPercent: 0,
        discountNominal: 0,
        subtotal: 4000
      }
    ],
    subtotal: 11000,
    discountNominal: 0,
    taxPercent: 0,
    taxAmount: 0,
    grandTotal: 11000,
    paidAmount: 20000,
    changeAmount: 9000,
    paymentMethod: 'tunai',
    payments: [{ method: 'tunai', amount: 20000 }],
    shiftId: 'sft-101',
    status: 'selesai',
    createdAt: '2026-10-06 07:15:22'
  },
  {
    id: 'sal-2',
    invoiceNumber: 'TRX-20261006-000002',
    date: '2026-10-06 07:42:10',
    cashierId: 'usr-2',
    cashierName: 'Siti Rahmawati',
    customerId: 'cst-2',
    customerName: 'Ibu Hj. Aminah (Member Gold)',
    items: [
      {
        id: 'sali-3',
        saleId: 'sal-2',
        productId: 'prd-7',
        productName: 'Bimoli Minyak Goreng Pouch 2 Liter',
        barcode: '8993175537554',
        buyPrice: 32000,
        sellPrice: 38000,
        quantity: 1,
        discountPercent: 0,
        discountNominal: 0,
        subtotal: 38000
      },
      {
        id: 'sali-4',
        saleId: 'sal-2',
        productId: 'prd-8',
        productName: 'Gulaku Gula Pasir Tebu Putih 1kg',
        barcode: '8992745330018',
        buyPrice: 15500,
        sellPrice: 18500,
        quantity: 1,
        discountPercent: 0,
        discountNominal: 0,
        subtotal: 18500
      }
    ],
    subtotal: 56500,
    discountNominal: 2000, // Member discount
    taxPercent: 0,
    taxAmount: 0,
    grandTotal: 54500,
    paidAmount: 54500,
    changeAmount: 0,
    paymentMethod: 'qris',
    payments: [{ method: 'qris', amount: 54500, referenceNumber: 'QRIS-77491823' }],
    shiftId: 'sft-101',
    status: 'selesai',
    createdAt: '2026-10-06 07:42:10'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    date: '2026-10-06 07:15:22',
    productId: 'prd-1',
    productName: 'Indomie Mi Goreng Spesial 85g',
    type: 'penjualan',
    reference: 'TRX-20261006-000001',
    stockBefore: 100,
    stockIn: 0,
    stockOut: 2,
    stockAfter: 98,
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    note: 'Penjualan Kasir'
  },
  {
    id: 'sm-2',
    date: '2026-10-06 07:15:22',
    productId: 'prd-3',
    productName: 'Aqua Air Mineral Botol 600ml',
    type: 'penjualan',
    reference: 'TRX-20261006-000001',
    stockBefore: 145,
    stockIn: 0,
    stockOut: 1,
    stockAfter: 144,
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    note: 'Penjualan Kasir'
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'po-1',
    invoiceNumber: 'PO-20261001-000001',
    date: '2026-10-01 10:00:00',
    supplierId: 'sup-1',
    supplierName: 'PT Indofood CBP Sukses Makmur Tbk',
    items: [
      {
        productId: 'prd-1',
        productName: 'Indomie Mi Goreng Spesial 85g',
        quantity: 120,
        buyPrice: 2600,
        subtotal: 312000
      },
      {
        productId: 'prd-2',
        productName: 'Indomie Kuah Rasa Ayam Bawang 69g',
        quantity: 100,
        buyPrice: 2500,
        subtotal: 250000
      }
    ],
    totalAmount: 562000,
    paidAmount: 562000,
    paymentMethod: 'transfer',
    status: 'lunas',
    note: 'Restock mingguan mie instan',
    createdBy: 'Budi Santoso',
    createdAt: '2026-10-01 10:00:00'
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'csh-1',
    date: '2026-10-06 07:00:00',
    type: 'masuk',
    category: 'Modal Awal Kasir',
    amount: 250000,
    description: 'Modal awal laci kasir shift pagi',
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    reference: 'SHIFT-101',
    createdAt: '2026-10-06 07:00:00'
  },
  {
    id: 'csh-2',
    date: '2026-10-06 07:30:00',
    type: 'keluar',
    category: 'Operasional Toko',
    amount: 25000,
    description: 'Beli air galon & kantong kresek darurat',
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    reference: 'BIAYA-001',
    createdAt: '2026-10-06 07:30:00'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-06 07:00:00',
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    action: 'Buka Shift Kasir',
    module: 'Kasir',
    details: 'Membuka shift kasir dengan modal awal Rp 250.000',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-06 07:15:22',
    userId: 'usr-2',
    userName: 'Siti Rahmawati',
    action: 'Transaksi Penjualan',
    module: 'Kasir',
    details: 'Transaksi TRX-20261006-000001 senilai Rp 11.000 (Tunai)',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-06 08:00:00',
    userId: 'usr-1',
    userName: 'Budi Santoso',
    action: 'Login Super Admin',
    module: 'Autentikasi',
    details: 'Berhasil login ke sistem Super Admin',
    ipAddress: '192.168.1.100'
  }
];
