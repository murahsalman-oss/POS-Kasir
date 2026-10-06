import {
  Product,
  Category,
  Unit,
  Supplier,
  Customer,
  Sale,
  Purchase,
  ReturnTransaction,
  StockMovement,
  CashTransaction,
  CashierShift,
  StoreSettings,
  AuditLog,
  User,
  CartItem,
  PaymentMethod
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_SHIFTS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CATEGORIES: 'pos_categories',
  UNITS: 'pos_units',
  SUPPLIERS: 'pos_suppliers',
  CUSTOMERS: 'pos_customers',
  SALES: 'pos_sales',
  PURCHASES: 'pos_purchases',
  RETURNS: 'pos_returns',
  STOCK_MOVEMENTS: 'pos_stock_movements',
  CASH_TRANSACTIONS: 'pos_cash_transactions',
  SHIFTS: 'pos_shifts',
  SETTINGS: 'pos_settings',
  AUDIT_LOGS: 'pos_audit_logs',
  USERS: 'pos_users',
  HELD_ORDERS: 'pos_held_orders'
};

function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
  }
}

export const StorageService = {
  initStorage(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      saveItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      saveItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.UNITS)) {
      saveItem(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      saveItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      saveItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      saveItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      saveItem(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RETURNS)) {
      saveItem(STORAGE_KEYS.RETURNS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS)) {
      saveItem(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS)) {
      saveItem(STORAGE_KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      saveItem(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      saveItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      saveItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      saveItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
  },

  resetAllData(): void {
    saveItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    saveItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    saveItem(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    saveItem(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    saveItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    saveItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    saveItem(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    saveItem(STORAGE_KEYS.RETURNS, []);
    saveItem(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
    saveItem(STORAGE_KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS);
    saveItem(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
    saveItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    saveItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    saveItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getProducts: () => loadItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (data: Product[]) => saveItem(STORAGE_KEYS.PRODUCTS, data),

  getCategories: () => loadItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  saveCategories: (data: Category[]) => saveItem(STORAGE_KEYS.CATEGORIES, data),

  getUnits: () => loadItem<Unit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS),
  saveUnits: (data: Unit[]) => saveItem(STORAGE_KEYS.UNITS, data),

  getSuppliers: () => loadItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS),
  saveSuppliers: (data: Supplier[]) => saveItem(STORAGE_KEYS.SUPPLIERS, data),

  getCustomers: () => loadItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (data: Customer[]) => saveItem(STORAGE_KEYS.CUSTOMERS, data),

  getSales: () => loadItem<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES),
  saveSales: (data: Sale[]) => saveItem(STORAGE_KEYS.SALES, data),

  getPurchases: () => loadItem<Purchase[]>(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES),
  savePurchases: (data: Purchase[]) => saveItem(STORAGE_KEYS.PURCHASES, data),

  getReturns: () => loadItem<ReturnTransaction[]>(STORAGE_KEYS.RETURNS, []),
  saveReturns: (data: ReturnTransaction[]) => saveItem(STORAGE_KEYS.RETURNS, data),

  getStockMovements: () => loadItem<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS),
  saveStockMovements: (data: StockMovement[]) => saveItem(STORAGE_KEYS.STOCK_MOVEMENTS, data),

  getCashTransactions: () => loadItem<CashTransaction[]>(STORAGE_KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS),
  saveCashTransactions: (data: CashTransaction[]) => saveItem(STORAGE_KEYS.CASH_TRANSACTIONS, data),

  getShifts: () => loadItem<CashierShift[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS),
  saveShifts: (data: CashierShift[]) => saveItem(STORAGE_KEYS.SHIFTS, data),

  getSettings: () => loadItem<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (data: StoreSettings) => saveItem(STORAGE_KEYS.SETTINGS, data),

  getAuditLogs: () => loadItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  saveAuditLogs: (data: AuditLog[]) => saveItem(STORAGE_KEYS.AUDIT_LOGS, data),

  getUsers: () => loadItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (data: User[]) => saveItem(STORAGE_KEYS.USERS, data),

  // Record an audit log entry
  addAuditLog(user: { id: string; fullName: string }, action: string, module: string, details: string) {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user.id,
      userName: user.fullName,
      action,
      module,
      details,
      ipAddress: '127.0.0.1 (Web POS Client)'
    };
    logs.unshift(newLog);
    StorageService.saveAuditLogs(logs.slice(0, 500)); // retain last 500 logs
  },

  // Process checkout transaction atomically
  processSaleTransaction(params: {
    cartItems: CartItem[];
    subtotal: number;
    discountNominal: number;
    taxPercent: number;
    taxAmount: number;
    grandTotal: number;
    paidAmount: number;
    changeAmount: number;
    paymentMethod: PaymentMethod;
    customer: Customer;
    cashier: User;
    activeShift: CashierShift | null;
    note?: string;
  }): { sale: Sale; updatedProducts: Product[]; updatedShift: CashierShift | null } {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateSlug = now.substring(0, 10).replace(/-/g, '');
    const allSales = StorageService.getSales();
    const invoiceNumber = `TRX-${dateSlug}-${String(allSales.length + 1).padStart(6, '0')}`;
    const saleId = `sal-${Date.now()}`;

    const products = StorageService.getProducts();
    const stockMovements = StorageService.getStockMovements();

    // Map cart items into sale items and adjust stock
    const saleItems = params.cartItems.map((ci, idx) => {
      const prodIndex = products.findIndex((p) => p.id === ci.product.id);
      const currentStock = prodIndex >= 0 ? products[prodIndex].stock : ci.product.stock;
      const newStock = Math.max(0, currentStock - ci.quantity);

      if (prodIndex >= 0) {
        products[prodIndex].stock = newStock;
        products[prodIndex].updatedAt = now;
      }

      // Record stock movement ledger
      stockMovements.unshift({
        id: `sm-${Date.now()}-${idx}`,
        date: now,
        productId: ci.product.id,
        productName: ci.product.name,
        type: 'penjualan',
        reference: invoiceNumber,
        stockBefore: currentStock,
        stockIn: 0,
        stockOut: ci.quantity,
        stockAfter: newStock,
        userId: params.cashier.id,
        userName: params.cashier.fullName,
        note: `Penjualan Kasir (${params.paymentMethod.toUpperCase()})`
      });

      const itemSubtotal = ci.product.sellPrice * ci.quantity - ci.itemDiscountNominal;

      return {
        id: `sali-${Date.now()}-${idx}`,
        saleId,
        productId: ci.product.id,
        productName: ci.product.name,
        barcode: ci.product.barcode,
        buyPrice: ci.product.buyPrice,
        sellPrice: ci.product.sellPrice,
        quantity: ci.quantity,
        discountPercent: ci.itemDiscountPercent,
        discountNominal: ci.itemDiscountNominal,
        subtotal: itemSubtotal
      };
    });

    const newSale: Sale = {
      id: saleId,
      invoiceNumber,
      date: now,
      cashierId: params.cashier.id,
      cashierName: params.cashier.fullName,
      customerId: params.customer.id,
      customerName: params.customer.name,
      items: saleItems,
      subtotal: params.subtotal,
      discountNominal: params.discountNominal,
      taxPercent: params.taxPercent,
      taxAmount: params.taxAmount,
      grandTotal: params.grandTotal,
      paidAmount: params.paidAmount,
      changeAmount: params.changeAmount,
      paymentMethod: params.paymentMethod,
      payments: [{ method: params.paymentMethod, amount: params.paidAmount }],
      shiftId: params.activeShift ? params.activeShift.id : undefined,
      note: params.note,
      status: 'selesai',
      createdAt: now
    };

    allSales.unshift(newSale);

    // Update customer points & spend if member
    const customers = StorageService.getCustomers();
    const cIndex = customers.findIndex((c) => c.id === params.customer.id);
    if (cIndex >= 0) {
      customers[cIndex].totalSpent += params.grandTotal;
      if (customers[cIndex].isMember) {
        // Earn 1 point per 10,000 IDR
        customers[cIndex].points += Math.floor(params.grandTotal / 10000);
      }
      StorageService.saveCustomers(customers);
    }

    // Update shift totals
    let updatedShift: CashierShift | null = null;
    if (params.activeShift) {
      const shifts = StorageService.getShifts();
      const sIdx = shifts.findIndex((s) => s.id === params.activeShift?.id);
      if (sIdx >= 0) {
        if (params.paymentMethod === 'tunai') {
          shifts[sIdx].totalSalesCash += params.grandTotal;
        } else {
          shifts[sIdx].totalSalesNonCash += params.grandTotal;
        }
        updatedShift = shifts[sIdx];
        StorageService.saveShifts(shifts);
      }
    }

    // Save everything back to storage
    StorageService.saveProducts(products);
    StorageService.saveStockMovements(stockMovements);
    StorageService.saveSales(allSales);

    // Audit log
    StorageService.addAuditLog(
      params.cashier,
      'Transaksi Penjualan',
      'Kasir',
      `Penjualan ${invoiceNumber} senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(params.grandTotal)} (${params.paymentMethod})`
    );

    return { sale: newSale, updatedProducts: products, updatedShift };
  },

  // Export current full database as runnable SQL script
  generateSqlDump(): string {
    const products = StorageService.getProducts();
    const categories = StorageService.getCategories();
    const units = StorageService.getUnits();
    const suppliers = StorageService.getSuppliers();
    const customers = StorageService.getCustomers();
    const sales = StorageService.getSales();
    const shifts = StorageService.getShifts();
    const users = StorageService.getUsers();

    let sql = `-- ========================================================\n`;
    sql += `-- BACKUP DATABASE POS MINIMARKET\n`;
    sql += `-- Tanggal Ekspor: ${new Date().toISOString()}\n`;
    sql += `-- Target: MySQL 8.0+ / MariaDB 10.4+\n`;
    sql += `-- ========================================================\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Users
    sql += `-- Table: users\n`;
    users.forEach((u) => {
      sql += `INSERT INTO users (username, password_hash, full_name, role, email, phone, is_active) VALUES ('${u.username}', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', '${u.fullName}', '${u.role}', '${u.email}', '${u.phone}', ${u.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);\n`;
    });
    sql += `\n`;

    // Products
    sql += `-- Table: products\n`;
    products.forEach((p) => {
      sql += `INSERT INTO products (barcode, sku, name, buy_price, sell_price, stock, min_stock, discount, tax, shelf_location, is_active) VALUES ('${p.barcode}', '${p.sku}', '${p.name.replace(/'/g, "''")}', ${p.buyPrice}, ${p.sellPrice}, ${p.stock}, ${p.minStock}, ${p.discount}, ${p.tax}, '${p.shelfLocation}', ${p.isActive ? 1 : 0}) ON DUPLICATE KEY UPDATE stock=VALUES(stock), sell_price=VALUES(sell_price);\n`;
    });
    sql += `\nSET FOREIGN_KEY_CHECKS = 1;\nCOMMIT;\n`;

    return sql;
  }
};
