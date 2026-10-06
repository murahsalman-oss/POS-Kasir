import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Unit,
  Supplier,
  Customer,
  CartItem,
  Sale,
  Purchase,
  ReturnTransaction,
  StockMovement,
  CashTransaction,
  CashierShift,
  StoreSettings,
  AuditLog,
  HeldOrder,
  PaymentMethod
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { playBeep } from '../services/sound';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  // Master Data
  products: Product[];
  categories: Category[];
  units: Unit[];
  suppliers: Supplier[];
  customers: Customer[];
  settings: StoreSettings;

  // Transactions & Financials
  sales: Sale[];
  purchases: Purchase[];
  returns: ReturnTransaction[];
  stockMovements: StockMovement[];
  cashTransactions: CashTransaction[];
  shifts: CashierShift[];
  activeShift: CashierShift | null;
  auditLogs: AuditLog[];

  // Cart / POS state
  cart: CartItem[];
  selectedCustomer: Customer;
  transactionDiscountNominal: number;
  transactionDiscountPercent: number;
  taxEnabled: boolean;
  heldOrders: HeldOrder[];
  lastCompletedSale: Sale | null;

  // Actions - POS Cart
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setItemDiscount: (productId: string, percent: number, nominal: number) => void;
  setTransactionDiscount: (nominal: number, percent?: number) => void;
  setTaxEnabled: (enabled: boolean) => void;
  setSelectedCustomer: (customer: Customer) => void;
  clearCart: () => void;
  holdCurrentCart: (note?: string) => void;
  restoreHeldOrder: (heldId: string) => void;
  removeHeldOrder: (heldId: string) => void;
  checkout: (params: {
    paymentMethod: PaymentMethod;
    paidAmount: number;
    note?: string;
  }) => Promise<{ success: boolean; sale?: Sale; message: string }>;

  // Master Data CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'points' | 'totalSpent'>) => void;

  // Shifts
  openShift: (initialCash: number, notes?: string) => void;
  closeShift: (actualCash: number, notes?: string) => CashierShift;

  // Purchases & Returns & Cash
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'invoiceNumber'>) => void;
  processSaleReturn: (params: {
    saleInvoice: string;
    items: { productId: string; productName: string; quantity: number; price: number; reason: string }[];
    reason: string;
  }) => { success: boolean; message: string };
  addCashTransaction: (type: 'masuk' | 'keluar', category: string, amount: number, description: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetDatabaseDemo: () => void;

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Helper Calculations
  cartSubtotal: number;
  cartItemDiscountTotal: number;
  cartTaxAmount: number;
  cartGrandTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Master Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(StorageService.getSettings());

  // Operational States
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [returns, setReturns] = useState<ReturnTransaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(StorageService.getCustomers()[0]);
  const [transactionDiscountNominal, setTransactionDiscountNominal] = useState<number>(0);
  const [transactionDiscountPercent, setTransactionDiscountPercent] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload data from local database
  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setUnits(StorageService.getUnits());
    setSuppliers(StorageService.getSuppliers());
    setCustomers(StorageService.getCustomers());
    setSales(StorageService.getSales());
    setPurchases(StorageService.getPurchases());
    setReturns(StorageService.getReturns());
    setStockMovements(StorageService.getStockMovements());
    setCashTransactions(StorageService.getCashTransactions());
    setShifts(StorageService.getShifts());
    setSettings(StorageService.getSettings());
    setAuditLogs(StorageService.getAuditLogs());
  };

  useEffect(() => {
    StorageService.initStorage();
    refreshData();
    const loadedCustomers = StorageService.getCustomers();
    if (loadedCustomers.length > 0) {
      setSelectedCustomer(loadedCustomers[0]);
    }
  }, []);

  // Compute Active Shift
  const activeShift = shifts.find((s) => s.status === 'open') || null;

  // Calculate cart totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.sellPrice * item.quantity, 0);
  const cartItemDiscountTotal = cart.reduce((acc, item) => acc + item.itemDiscountNominal, 0);
  const afterItemDiscount = Math.max(0, cartSubtotal - cartItemDiscountTotal);
  const afterTxDiscount = Math.max(0, afterItemDiscount - transactionDiscountNominal);
  const cartTaxAmount = taxEnabled ? Math.round((afterTxDiscount * (settings.defaultTaxPercent || 11)) / 100) : 0;
  const cartGrandTotal = afterTxDiscount + cartTaxAmount;

  // Add Product to Cart
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      playBeep('error');
      showToast('error', 'Stok Kosong', `Stok barang "${product.name}" habis.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          playBeep('error');
          showToast('warning', 'Batas Stok Tercapai', `Stok tersedia hanya ${product.stock} ${product.unitId}`);
          return prev;
        }
        playBeep('scan');
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty
        };
        return updated;
      } else {
        playBeep('scan');
        return [
          ...prev,
          {
            product,
            quantity,
            itemDiscountPercent: 0,
            itemDiscountNominal: product.discount > 0 ? product.discount : 0
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      playBeep('error');
      showToast('warning', 'Stok Terbatas', `Hanya tersedia ${prod.stock} unit.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const setItemDiscount = (productId: string, percent: number, nominal: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const base = item.product.sellPrice * item.quantity;
          const calculatedNominal = percent > 0 ? Math.round((base * percent) / 100) : nominal;
          return {
            ...item,
            itemDiscountPercent: percent,
            itemDiscountNominal: Math.min(base, calculatedNominal)
          };
        }
        return item;
      })
    );
  };

  const setTransactionDiscount = (nominal: number, percent = 0) => {
    setTransactionDiscountNominal(nominal);
    setTransactionDiscountPercent(percent);
  };

  const clearCart = () => {
    setCart([]);
    setTransactionDiscountNominal(0);
    setTransactionDiscountPercent(0);
    const customersList = StorageService.getCustomers();
    if (customersList.length > 0) setSelectedCustomer(customersList[0]);
  };

  const holdCurrentCart = (note = 'Transaksi Tertahan') => {
    if (cart.length === 0) return;
    const newHold: HeldOrder = {
      id: `hold-${Date.now()}`,
      heldAt: new Date().toLocaleTimeString('id-ID'),
      customerName: selectedCustomer.name,
      items: [...cart],
      note
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    showToast('info', 'Transaksi Ditahan', 'Transaksi berhasil disimpan ke antrean.');
  };

  const restoreHeldOrder = (heldId: string) => {
    const held = heldOrders.find((h) => h.id === heldId);
    if (!held) return;
    setCart(held.items);
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
    showToast('success', 'Transaksi Dimuat', 'Transaksi berhasil dikembalikan ke kasir.');
  };

  const removeHeldOrder = (heldId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Atomic Checkout
  const checkout = async (params: {
    paymentMethod: PaymentMethod;
    paidAmount: number;
    note?: string;
  }): Promise<{ success: boolean; sale?: Sale; message: string }> => {
    if (cart.length === 0) {
      playBeep('error');
      return { success: false, message: 'Keranjang belanja masih kosong!' };
    }

    if (params.paidAmount < cartGrandTotal) {
      playBeep('error');
      return {
        success: false,
        message: `Pembayaran kurang! Total: Rp ${cartGrandTotal.toLocaleString('id-ID')}, Bayar: Rp ${params.paidAmount.toLocaleString('id-ID')}`
      };
    }

    if (!currentUser) {
      return { success: false, message: 'Tidak ada kasir yang sedang login.' };
    }

    const changeAmount = params.paymentMethod === 'tunai' ? params.paidAmount - cartGrandTotal : 0;

    const result = StorageService.processSaleTransaction({
      cartItems: cart,
      subtotal: cartSubtotal,
      discountNominal: cartItemDiscountTotal + transactionDiscountNominal,
      taxPercent: taxEnabled ? (settings.defaultTaxPercent || 11) : 0,
      taxAmount: cartTaxAmount,
      grandTotal: cartGrandTotal,
      paidAmount: params.paidAmount,
      changeAmount,
      paymentMethod: params.paymentMethod,
      customer: selectedCustomer,
      cashier: currentUser,
      activeShift,
      note: params.note
    });

    playBeep('success');
    setLastCompletedSale(result.sale);
    refreshData();
    clearCart();

    showToast('success', 'Transaksi Berhasil!', `No. Faktur: ${result.sale.invoiceNumber}`);

    return { success: true, sale: result.sale, message: 'Transaksi berhasil diselesaikan.' };
  };

  // Master Data CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newProd: Product = {
      ...prodData,
      id: `prd-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);

    // Initial stock movement
    if (newProd.stock > 0 && currentUser) {
      const movements = StorageService.getStockMovements();
      movements.unshift({
        id: `sm-${Date.now()}`,
        date: now,
        productId: newProd.id,
        productName: newProd.name,
        type: 'penyesuaian',
        reference: 'PRODUK-BARU',
        stockBefore: 0,
        stockIn: newProd.stock,
        stockOut: 0,
        stockAfter: newProd.stock,
        userId: currentUser.id,
        userName: currentUser.fullName,
        note: 'Stok awal produk baru'
      });
      StorageService.saveStockMovements(movements);
      setStockMovements(movements);
    }

    if (currentUser) {
      StorageService.addAuditLog(currentUser, 'Tambah Produk', 'Produk', `Menambahkan produk "${newProd.name}" (${newProd.barcode})`);
    }
    showToast('success', 'Produk Ditambahkan', `Produk ${newProd.name} berhasil disimpan.`);
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, ...prodData, updatedAt: now };
      }
      return p;
    });
    setProducts(updated);
    StorageService.saveProducts(updated);
    if (currentUser) {
      StorageService.addAuditLog(currentUser, 'Edit Produk', 'Produk', `Memperbarui data produk ID ${id}`);
    }
    showToast('info', 'Produk Diperbarui', 'Data produk berhasil disimpan.');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    StorageService.saveProducts(updated);
    if (currentUser && target) {
      StorageService.addAuditLog(currentUser, 'Hapus Produk', 'Produk', `Menghapus produk "${target.name}"`);
    }
    showToast('warning', 'Produk Dihapus', 'Produk telah dihapus dari katalog.');
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = { ...catData, id: `cat-${Date.now()}` };
    const updated = [...categories, newCat];
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('success', 'Kategori Ditambahkan', newCat.name);
  };

  const addSupplier = (supData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supData, id: `sup-${Date.now()}` };
    const updated = [...suppliers, newSup];
    setSuppliers(updated);
    StorageService.saveSuppliers(updated);
    showToast('success', 'Supplier Ditambahkan', newSup.name);
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt' | 'points' | 'totalSpent'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cst-${Date.now()}`,
      points: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const updated = [...customers, newCust];
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    showToast('success', 'Pelanggan Ditambahkan', newCust.name);
  };

  // Shifts management
  const openShift = (initialCash: number, notes = 'Shift dibuka') => {
    if (!currentUser) return;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newShift: CashierShift = {
      id: `sft-${Date.now()}`,
      cashierId: currentUser.id,
      cashierName: currentUser.fullName,
      openedAt: now,
      initialCash,
      totalSalesCash: 0,
      totalSalesNonCash: 0,
      totalCashIn: 0,
      totalCashOut: 0,
      status: 'open',
      notes
    };
    const updated = [newShift, ...shifts];
    setShifts(updated);
    StorageService.saveShifts(updated);

    // Record cash in
    addCashTransaction('masuk', 'Modal Awal Kasir', initialCash, `Modal awal shift laci kasir: ${currentUser.fullName}`);
    StorageService.addAuditLog(currentUser, 'Buka Shift', 'Kasir', `Membuka shift kasir dengan modal awal Rp ${initialCash.toLocaleString('id-ID')}`);
    showToast('success', 'Shift Kasir Dibuka', `Modal awal: Rp ${initialCash.toLocaleString('id-ID')}`);
  };

  const closeShift = (actualCash: number, notes = 'Shift ditutup'): CashierShift => {
    if (!activeShift || !currentUser) throw new Error('Tidak ada shift terbuka');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const expected = activeShift.initialCash + activeShift.totalSalesCash + activeShift.totalCashIn - activeShift.totalCashOut;
    const difference = actualCash - expected;

    const closed: CashierShift = {
      ...activeShift,
      closedAt: now,
      expectedCash: expected,
      actualCash,
      difference,
      status: 'closed',
      notes
    };

    const updated = shifts.map((s) => (s.id === activeShift.id ? closed : s));
    setShifts(updated);
    StorageService.saveShifts(updated);

    StorageService.addAuditLog(
      currentUser,
      'Tutup Shift Kasir',
      'Kasir',
      `Menutup shift. Kas seharusnya Rp ${expected.toLocaleString('id-ID')}, Fisik Rp ${actualCash.toLocaleString('id-ID')}, Selisih Rp ${difference.toLocaleString('id-ID')}`
    );

    showToast('info', 'Shift Berhasil Ditutup', `Selisih kas laci: Rp ${difference.toLocaleString('id-ID')}`);
    return closed;
  };

  // Purchases
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateSlug = now.substring(0, 10).replace(/-/g, '');
    const poNumber = `PO-${dateSlug}-${String(purchases.length + 1).padStart(6, '0')}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `po-${Date.now()}`,
      invoiceNumber: poNumber,
      createdAt: now
    };

    // If purchase is completed/lunas, increment product stock!
    if (newPurchase.status === 'lunas' || newPurchase.status === 'selesai') {
      const allProducts = [...products];
      const allMovements = StorageService.getStockMovements();

      newPurchase.items.forEach((item) => {
        const pIndex = allProducts.findIndex((p) => p.id === item.productId);
        if (pIndex >= 0) {
          const before = allProducts[pIndex].stock;
          const after = before + item.quantity;
          allProducts[pIndex].stock = after;
          allProducts[pIndex].buyPrice = item.buyPrice;

          allMovements.unshift({
            id: `sm-${Date.now()}-${item.productId}`,
            date: now,
            productId: item.productId,
            productName: item.productName,
            type: 'pembelian',
            reference: poNumber,
            stockBefore: before,
            stockIn: item.quantity,
            stockOut: 0,
            stockAfter: after,
            userId: currentUser?.id || 'sys',
            userName: currentUser?.fullName || 'Admin',
            note: `Pembelian dari ${newPurchase.supplierName}`
          });
        }
      });

      setProducts(allProducts);
      StorageService.saveProducts(allProducts);
      setStockMovements(allMovements);
      StorageService.saveStockMovements(allMovements);
    }

    const updated = [newPurchase, ...purchases];
    setPurchases(updated);
    StorageService.savePurchases(updated);

    if (currentUser) {
      StorageService.addAuditLog(currentUser, 'Pembelian Barang', 'Pembelian', `Faktur PO ${poNumber} dari ${newPurchase.supplierName}`);
    }
    showToast('success', 'Pembelian Berhasil', `Faktur ${poNumber} tersimpan.`);
  };

  // Returns
  const processSaleReturn = (params: {
    saleInvoice: string;
    items: { productId: string; productName: string; quantity: number; price: number; reason: string }[];
    reason: string;
  }): { success: boolean; message: string } => {
    const sale = sales.find((s) => s.invoiceNumber === params.saleInvoice);
    if (!sale) return { success: false, message: 'Faktur transaksi penjualan tidak ditemukan.' };

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const returnNumber = `RET-${now.substring(0, 10).replace(/-/g, '')}-${String(returns.length + 1).padStart(6, '0')}`;
    const totalReturnAmount = params.items.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const returnTx: ReturnTransaction = {
      id: `ret-${Date.now()}`,
      returnNumber,
      type: 'penjualan',
      referenceInvoice: params.saleInvoice,
      date: now,
      partyName: sale.customerName,
      items: params.items.map((it) => ({
        ...it,
        subtotal: it.price * it.quantity
      })),
      totalAmount: totalReturnAmount,
      reason: params.reason,
      handledBy: currentUser?.fullName || 'Petugas',
      createdAt: now
    };

    // Restore stock
    const allProducts = [...products];
    const allMovements = StorageService.getStockMovements();

    params.items.forEach((item) => {
      const pIdx = allProducts.findIndex((p) => p.id === item.productId);
      if (pIdx >= 0) {
        const before = allProducts[pIdx].stock;
        const after = before + item.quantity;
        allProducts[pIdx].stock = after;

        allMovements.unshift({
          id: `sm-${Date.now()}-${item.productId}`,
          date: now,
          productId: item.productId,
          productName: item.productName,
          type: 'retur_penjualan',
          reference: returnNumber,
          stockBefore: before,
          stockIn: item.quantity,
          stockOut: 0,
          stockAfter: after,
          userId: currentUser?.id || 'sys',
          userName: currentUser?.fullName || 'Kasir',
          note: `Retur penjualan TRX: ${params.saleInvoice}`
        });
      }
    });

    setProducts(allProducts);
    StorageService.saveProducts(allProducts);
    setStockMovements(allMovements);
    StorageService.saveStockMovements(allMovements);

    const updatedReturns = [returnTx, ...returns];
    setReturns(updatedReturns);
    StorageService.saveReturns(updatedReturns);

    // Update sale status
    const updatedSales = sales.map((s) => (s.invoiceNumber === params.saleInvoice ? { ...s, status: 'retur_sebagian' as const } : s));
    setSales(updatedSales);
    StorageService.saveSales(updatedSales);

    // Record cash out refund
    addCashTransaction('keluar', 'Retur Penjualan', totalReturnAmount, `Pengembalian dana retur ${params.saleInvoice}`);

    if (currentUser) {
      StorageService.addAuditLog(currentUser, 'Retur Penjualan', 'Retur', `Retur ${returnNumber} atas transaksi ${params.saleInvoice}`);
    }

    showToast('success', 'Retur Selesai', `Retur ${returnNumber} senilai Rp ${totalReturnAmount.toLocaleString('id-ID')} dicatat.`);
    return { success: true, message: 'Retur berhasil diproses dan stok dikembalikan.' };
  };

  // Cash transactions
  const addCashTransaction = (type: 'masuk' | 'keluar', category: string, amount: number, description: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newTx: CashTransaction = {
      id: `csh-${Date.now()}`,
      date: now,
      type,
      category,
      amount,
      description,
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.fullName || 'Petugas',
      createdAt: now
    };

    const updated = [newTx, ...cashTransactions];
    setCashTransactions(updated);
    StorageService.saveCashTransactions(updated);

    // If shift is active, adjust shift totals
    if (activeShift) {
      const sIdx = shifts.findIndex((s) => s.id === activeShift.id);
      if (sIdx >= 0) {
        const shiftList = [...shifts];
        if (type === 'masuk') {
          shiftList[sIdx].totalCashIn += amount;
        } else {
          shiftList[sIdx].totalCashOut += amount;
        }
        setShifts(shiftList);
        StorageService.saveShifts(shiftList);
      }
    }
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    StorageService.saveSettings(merged);
    if (currentUser) {
      StorageService.addAuditLog(currentUser, 'Ubah Pengaturan Toko', 'Pengaturan', 'Memperbarui parameter operasional toko');
    }
    showToast('success', 'Pengaturan Tersimpan', 'Informasi toko berhasil diperbarui.');
  };

  const resetDatabaseDemo = () => {
    StorageService.resetAllData();
    refreshData();
    showToast('info', 'Database Direset', 'Semua data telah dikembalikan ke kondisi default minimarket.');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        units,
        suppliers,
        customers,
        settings,
        sales,
        purchases,
        returns,
        stockMovements,
        cashTransactions,
        shifts,
        activeShift,
        auditLogs,
        cart,
        selectedCustomer,
        transactionDiscountNominal,
        transactionDiscountPercent,
        taxEnabled,
        heldOrders,
        lastCompletedSale,
        addToCart,
        removeFromCart,
        updateQuantity,
        setItemDiscount,
        setTransactionDiscount,
        setTaxEnabled,
        setSelectedCustomer,
        clearCart,
        holdCurrentCart,
        restoreHeldOrder,
        removeHeldOrder,
        checkout,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        addSupplier,
        addCustomer,
        openShift,
        closeShift,
        addPurchase,
        processSaleReturn,
        addCashTransaction,
        updateSettings,
        resetDatabaseDemo,
        toasts,
        showToast,
        removeToast,
        cartSubtotal,
        cartItemDiscountTotal,
        cartTaxAmount,
        cartGrandTotal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
