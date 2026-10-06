export type UserRole = 'super_admin' | 'kasir' | 'manajer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  npwp?: string;
  contactPerson: string;
  notes?: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  isMember: boolean;
  points: number;
  totalSpent: number;
  createdAt: string;
}

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  categoryId: string;
  unitId: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  discount: number; // percentage or nominal
  tax: number; // percentage
  supplierId: string;
  shelfLocation: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  itemDiscountPercent: number;
  itemDiscountNominal: number;
  note?: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  barcode: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  discountPercent: number;
  discountNominal: number;
  subtotal: number;
}

export type PaymentMethod = 'tunai' | 'qris' | 'transfer' | 'debit' | 'kredit' | 'ewallet';

export interface SalePayment {
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string; // TRX-YYYYMMDD-XXXXXX
  date: string;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discountNominal: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  payments: SalePayment[];
  shiftId?: string;
  note?: string;
  status: 'selesai' | 'retur_sebagian' | 'retur_total' | 'batal';
  createdAt: string;
}

export interface HeldOrder {
  id: string;
  heldAt: string;
  customerName: string;
  items: CartItem[];
  note?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  buyPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string; // PO-YYYYMMDD-XXXXXX
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  status: 'draft' | 'selesai' | 'dibayar_sebagian' | 'lunas' | 'batal';
  note?: string;
  createdBy: string;
  createdAt: string;
}

export type ReturnType = 'penjualan' | 'pembelian';

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  reason: string;
}

export interface ReturnTransaction {
  id: string;
  returnNumber: string; // RET-YYYYMMDD-XXXXXX
  type: ReturnType;
  referenceInvoice: string; // TRX or PO number
  date: string;
  partyName: string; // Customer or Supplier
  items: ReturnItem[];
  totalAmount: number;
  reason: string;
  handledBy: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'penjualan' | 'pembelian' | 'retur_penjualan' | 'retur_pembelian' | 'penyesuaian';
  reference: string;
  stockBefore: number;
  stockIn: number;
  stockOut: number;
  stockAfter: number;
  userId: string;
  userName: string;
  note?: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string; // Penjualan, Modal, Listrik, Air, Gaji, dll
  amount: number;
  description: string;
  userId: string;
  userName: string;
  reference?: string;
  createdAt: string;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number; // Modal awal
  expectedCash?: number;
  actualCash?: number; // Kas fisik
  difference?: number; // Selisih
  totalSalesCash: number;
  totalSalesNonCash: number;
  totalCashIn: number;
  totalCashOut: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  npwp: string;
  receiptHeader: string;
  receiptFooter: string;
  invoicePrefix: string;
  defaultTaxPercent: number;
  currency: string;
  dateFormat: string;
  lowStockThreshold: number;
  thermalPaperSize: '58mm' | '80mm';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
}
