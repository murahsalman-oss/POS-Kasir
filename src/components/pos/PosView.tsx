import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Product, PaymentMethod } from '../../types';
import {
  Search,
  Scan,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  User,
  Clock,
  Printer,
  ChevronRight,
  PackageX,
  X,
  Package,
  ArrowLeft
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { playBeep } from '../../services/sound';

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    customers,
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    removeFromCart,
    updateQuantity,
    setItemDiscount,
    setTransactionDiscount,
    transactionDiscountNominal,
    transactionDiscountPercent,
    taxEnabled,
    setTaxEnabled,
    clearCart,
    holdCurrentCart,
    heldOrders,
    restoreHeldOrder,
    removeHeldOrder,
    checkout,
    cartSubtotal,
    cartItemDiscountTotal,
    cartTaxAmount,
    cartGrandTotal,
    lastCompletedSale,
    showToast,
    settings
  } = useApp();

  const { currentUser } = useAuth();

  // Mobile view tab toggle (catalog vs cart)
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [transactionNote, setTransactionNote] = useState('');

  // Held orders modal
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);

  // Discount modal for single item
  const [activeDiscountItem, setActiveDiscountItem] = useState<{ id: string; name: string } | null>(null);
  const [itemDiscPercent, setItemDiscPercent] = useState<number>(0);
  const [itemDiscNominal, setItemDiscNominal] = useState<number>(0);

  // Transaction discount modal
  const [showTxDiscountModal, setShowTxDiscountModal] = useState(false);
  const [txDiscPercent, setTxDiscPercent] = useState<number>(transactionDiscountPercent);
  const [txDiscNominal, setTxDiscNominal] = useState<number>(transactionDiscountNominal);

  // Thermal Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [viewingSale, setViewingSale] = useState(lastCompletedSale);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Hardware USB Barcode scanner listener buffer
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in standard text inputs (unless barcode scanner sends fast keys)
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // Function keys shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        if (cart.length > 0) {
          openPaymentModal();
        } else {
          showToast('warning', 'Keranjang Kosong', 'Tambahkan produk ke keranjang terlebih dahulu.');
        }
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) holdCurrentCart();
        return;
      }
      if (e.key === 'F5') {
        e.preventDefault();
        if (heldOrders.length > 0) setShowHeldOrdersModal(true);
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (lastCompletedSale) {
          setViewingSale(lastCompletedSale);
          setShowReceiptModal(true);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowHeldOrdersModal(false);
        setActiveDiscountItem(null);
        setShowTxDiscountModal(false);
        setShowReceiptModal(false);
        return;
      }

      // Detect hardware barcode scanner (keystrokes arriving with very short intervals < 50ms)
      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      if (!isInput) {
        if (e.key === 'Enter') {
          if (barcodeBuffer.length >= 4) {
            processScannedBarcode(barcodeBuffer);
            barcodeBuffer = '';
          }
        } else if (e.key.length === 1) {
          if (diff > 120) {
            barcodeBuffer = ''; // reset if human slow typing
          }
          barcodeBuffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldOrders, lastCompletedSale, products]);

  const processScannedBarcode = (code: string) => {
    const trimmed = code.trim();
    const matched = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) {
      addToCart(matched, 1);
      showToast('success', 'Barcode Terdeteksi', `${matched.name} dimasukkan.`);
    } else {
      playBeep('error');
      showToast('error', 'Produk Tidak Ada', `Barcode: ${trimmed} tidak terdaftar.`);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    processScannedBarcode(barcodeInput);
    setBarcodeInput('');
  };

  const openPaymentModal = () => {
    setPaymentMethod('tunai');
    setPaidAmount(cartGrandTotal);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    const result = await checkout({
      paymentMethod,
      paidAmount,
      note: transactionNote
    });

    if (result.success && result.sale) {
      setShowPaymentModal(false);
      setViewingSale(result.sale);
      setShowReceiptModal(true);
    } else {
      showToast('error', 'Pembayaran Ditolak', result.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100">
      {/* Mobile Top Segmented Tabs Switcher */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-2 flex items-center gap-2 shrink-0 z-10 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[42px] ${
            mobileTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog Produk</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative min-h-[42px] ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Keranjang Belanja</span>
          {cart.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* BAGIAN KIRI: KATALOG PRODUK, SEARCH & SCANNER */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex-col min-w-0 border-r border-slate-200 bg-slate-50/50 h-full overflow-hidden ${
          mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Top Control Bar: Search & Barcode Quick Input */}
        <div className="p-2 sm:p-4 bg-white border-b border-slate-200 space-y-2 sm:space-y-3 shadow-2xs shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input (F1) */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk / SKU / barcode... (F1)"
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50/60 focus:bg-white transition-all min-h-[40px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Direct Barcode Input (F2) */}
            <form onSubmit={handleBarcodeSubmit} className="relative sm:w-64">
              <Scan className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode (F2)..."
                className="w-full pl-9 pr-14 py-2 rounded-xl border border-emerald-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-mono bg-emerald-50/20 focus:bg-white transition-all min-h-[40px]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all min-h-[34px] ${
                selectedCategoryId === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-all flex items-center gap-1.5 min-h-[34px] ${
                    selectedCategoryId === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategoryId === cat.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <PackageX className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">Tidak ada produk ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian atau kategori lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
              {filteredProducts.map((prod) => {
                const inCartItem = cart.find((i) => i.product.id === prod.id);
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= (prod.minStock || 10);

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (!isOutOfStock) addToCart(prod, 1);
                    }}
                    className={`bg-white rounded-xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all select-none relative group ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50'
                        : inCartItem
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20 cursor-pointer hover:border-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* In-cart badge indicator */}
                    {inCartItem && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-md z-10 animate-in zoom-in-50">
                        {inCartItem.quantity}
                      </span>
                    )}

                    <div>
                      {/* Product Thumbnail / Image */}
                      <div className="w-full h-20 sm:h-24 rounded-lg bg-slate-100 overflow-hidden relative mb-1.5 sm:mb-2 flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-slate-400 text-xs font-mono font-semibold">MINIMARKET</div>
                        )}

                        {/* Shelf Location Tag */}
                        {prod.shelfLocation && (
                          <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-mono truncate max-w-[85%]">
                            {prod.shelfLocation}
                          </span>
                        )}

                        {/* Stock status pill */}
                        <span
                          className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-600 text-white'
                              : isLowStock
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600/90 text-white'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Stok: ${prod.stock}`}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {prod.name}
                      </h4>

                      {/* Barcode Snippet */}
                      <p className="font-mono text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                        {prod.barcode}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        {prod.discount > 0 && (
                          <span className="text-[9px] sm:text-[10px] text-slate-400 line-through block leading-none">
                            {formatRupiah(prod.sellPrice + prod.discount)}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                          {formatRupiah(prod.sellPrice)}
                        </span>
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(prod, 1);
                        }}
                        className={`min-h-[36px] min-w-[36px] rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shrink-0 ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                        }`}
                        aria-label="Tambah produk ke keranjang"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Sticky Cart Bar (Shown in Catalog view on mobile when items in cart) */}
        {cart.length > 0 && (
          <div className="lg:hidden p-2.5 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <button
              type="button"
              onClick={() => setMobileTab('cart')}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 text-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">Total Belanja ({cart.length} item):</div>
                <div className="text-xs font-extrabold text-emerald-400 truncate">
                  {formatRupiah(cartGrandTotal)}
                </div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMobileTab('cart')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <span>Lihat Keranjang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* BAGIAN KANAN: KERANJANG KASIR & RINGKASAN PEMBAYARAN */}
      {/* ======================================================== */}
      <div
        className={`w-full lg:w-[420px] xl:w-[460px] bg-white flex-col h-full shadow-lg border-l border-slate-200 overflow-hidden ${
          mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Customer Header */}
        <div className="p-2.5 sm:p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileTab('catalog')}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
              title="Kembali ke katalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 truncate max-w-[170px] sm:max-w-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isMember ? `(Poin: ${c.points})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Held Orders Drawer Button */}
          <div className="flex items-center gap-1.5">
            {heldOrders.length > 0 && (
              <button
                onClick={() => setShowHeldOrdersModal(true)}
                className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold flex items-center gap-1 shadow-2xs animate-pulse"
                title="Lihat antrean transaksi tertahan"
              >
                <Clock className="w-3 h-3" />
                <span>{heldOrders.length} Hold (F5)</span>
              </button>
            )}

            {lastCompletedSale && (
              <button
                onClick={() => {
                  setViewingSale(lastCompletedSale);
                  setShowReceiptModal(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                title="Cetak Struk Terakhir (F9)"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h5 className="font-bold text-slate-700 text-sm">Keranjang Masih Kosong</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Scan barcode barang atau klik produk di katalog sebelah kiri untuk memulai penjualan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-xs text-slate-900 truncate">
                      {item.product.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{item.product.barcode}</span>
                      <span>•</span>
                      <span>{formatRupiah(item.product.sellPrice)} / unit</span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity Controls & Line Item Subtotal */}
                <div className="flex items-center justify-between mt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Kurangi kuantitas"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center text-xs font-bold text-slate-800 py-1 focus:outline-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Tambah kuantitas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Discount button */}
                  <button
                    onClick={() => {
                      setActiveDiscountItem({ id: item.product.id, name: item.product.name });
                      setItemDiscPercent(item.itemDiscountPercent);
                      setItemDiscNominal(item.itemDiscountNominal);
                    }}
                    className={`px-2 py-1.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 min-h-[32px] ${
                      item.itemDiscountNominal > 0
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="w-2.5 h-2.5" />
                    {item.itemDiscountNominal > 0
                      ? `Disc -${formatRupiah(item.itemDiscountNominal)}`
                      : 'Diskon'}
                  </button>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 block font-mono">
                      {formatRupiah(item.product.sellPrice * item.quantity - item.itemDiscountNominal)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculation & Action Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-2 sm:space-y-3 shrink-0">
          {/* Summary Breakdown */}
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatRupiah(cartSubtotal)}</span>
            </div>

            {(cartItemDiscountTotal > 0 || transactionDiscountNominal > 0) && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <div className="flex items-center gap-1">
                  <span>Total Diskon:</span>
                  <button
                    onClick={() => setShowTxDiscountModal(true)}
                    className="text-[10px] underline hover:text-emerald-900"
                  >
                    (Ubah)
                  </button>
                </div>
                <span className="font-mono">-{formatRupiah(cartItemDiscountTotal + transactionDiscountNominal)}</span>
              </div>
            )}

            {/* PPN Option */}
            <div className="flex justify-between items-center text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>PPN ({settings.defaultTaxPercent || 11}%):</span>
              </label>
              <span className="font-mono">{formatRupiah(cartTaxAmount)}</span>
            </div>

            {/* Grand Total Highlight */}
            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-sm">TOTAL:</span>
              <span className="font-black text-lg sm:text-xl text-emerald-700 tracking-tight font-mono">
                {formatRupiah(cartGrandTotal)}
              </span>
            </div>
          </div>

          {/* Quick Helper Action Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              disabled={cart.length === 0}
              onClick={() => holdCurrentCart()}
              className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-2xs min-h-[38px]"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Hold (F4)</span>
            </button>

            <button
              disabled={cart.length === 0}
              onClick={clearCart}
              className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batal (ESC)</span>
            </button>
          </div>

          {/* Main Checkout Button (F3) */}
          <button
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group min-h-[46px]"
          >
            <span>BAYAR SEKARANG (F3)</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PEMBAYARAN KASIR (F3) */}
      {/* ======================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 my-auto">
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm sm:text-base">Pembayaran Transaksi</h3>
                <p className="text-xs text-slate-400">Total Tagihan: {formatRupiah(cartGrandTotal)}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {/* Grand Total Display */}
              <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 border border-emerald-200 text-center">
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Total Yang Harus Dibayar
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block font-mono">
                  {formatRupiah(cartGrandTotal)}
                </span>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'tunai', label: 'Tunai', icon: Banknote },
                      { id: 'qris', label: 'QRIS', icon: QrCode },
                      { id: 'transfer', label: 'Transfer', icon: CreditCard },
                      { id: 'debit', label: 'Debit', icon: CreditCard },
                      { id: 'kredit', label: 'Kredit', icon: CreditCard },
                      { id: 'ewallet', label: 'E-Wallet', icon: Banknote }
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id);
                          if (m.id !== 'tunai') {
                            setPaidAmount(cartGrandTotal);
                          }
                        }}
                        className={`p-2 sm:p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all min-h-[50px] justify-center ${
                          paymentMethod === m.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Quick Buttons (Only when Tunai selected) */}
              {paymentMethod === 'tunai' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Pilihan Cepat Nominal Uang:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(cartGrandTotal)}
                      className="px-2 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold"
                    >
                      [Uang Pas]
                    </button>
                    {[10000, 20000, 50000, 100000, 200000].map((nominal) => (
                      <button
                        key={nominal}
                        type="button"
                        onClick={() => setPaidAmount(nominal)}
                        className="px-2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium font-mono"
                      >
                        {formatRupiah(nominal)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jumlah Uang Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {/* Change (Kembalian) Calculation */}
              {paymentMethod === 'tunai' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                    paidAmount >= cartGrandTotal
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">
                    {paidAmount >= cartGrandTotal ? 'Kembalian:' : 'Uang Kurang:'}
                  </span>
                  <span className="font-extrabold text-base sm:text-lg font-mono">
                    {paidAmount >= cartGrandTotal
                      ? formatRupiah(paidAmount - cartGrandTotal)
                      : formatRupiah(cartGrandTotal - paidAmount)}
                  </span>
                </div>
              )}

              {/* Optional Note */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Catatan Transaksi (Opsional)
                </label>
                <input
                  type="text"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  placeholder="Contoh: Titipan, meja kasir 1, dll..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={paidAmount < cartGrandTotal}
                onClick={handleProcessPayment}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>Selesai & Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL TRANSAKSI TERTAHAN (HELD ORDERS) */}
      {/* ======================================================== */}
      {showHeldOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Antrean Transaksi Tertahan</h3>
              </div>
              <button
                onClick={() => setShowHeldOrdersModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {heldOrders.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  Tidak ada transaksi yang sedang ditahan.
                </p>
              ) : (
                heldOrders.map((ho) => (
                  <div key={ho.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{ho.customerName}</h5>
                      <p className="text-[11px] text-slate-500">
                        {ho.items.length} item • Pukul {ho.heldAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          restoreHeldOrder(ho.id);
                          setShowHeldOrdersModal(false);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        Muat ke Kasir
                      </button>
                      <button
                        onClick={() => removeHeldOrder(ho.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHeldOrdersModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DISKON ITEM */}
      {/* ======================================================== */}
      {activeDiscountItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h4 className="font-bold text-xs truncate">Diskon: {activeDiscountItem.name}</h4>
              <button
                onClick={() => setActiveDiscountItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diskon Persen (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={itemDiscPercent}
                  onChange={(e) => {
                    const p = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setItemDiscPercent(p);
                    setItemDiscNominal(0);
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau Diskon Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemDiscNominal}
                  onChange={(e) => {
                    setItemDiscNominal(Math.max(0, parseInt(e.target.value) || 0));
                    setItemDiscPercent(0);
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setActiveDiscountItem(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setItemDiscount(activeDiscountItem.id, itemDiscPercent, itemDiscNominal);
                  setActiveDiscountItem(null);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DISKON TRANSAKSI GLOBAL */}
      {/* ======================================================== */}
      {showTxDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center">
              <h4 className="font-bold text-xs">Diskon Transaksi Keranjang</h4>
              <button
                onClick={() => setShowTxDiscountModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diskon Persen Transaksi (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={txDiscPercent}
                  onChange={(e) => {
                    const p = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setTxDiscPercent(p);
                    setTxDiscNominal(Math.round((cartSubtotal * p) / 100));
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau Potongan Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={txDiscNominal}
                  onChange={(e) => {
                    setTxDiscNominal(Math.max(0, parseInt(e.target.value) || 0));
                    setTxDiscPercent(0);
                  }}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                />
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowTxDiscountModal(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setTransactionDiscount(txDiscNominal, txDiscPercent);
                  setShowTxDiscountModal(false);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Simpan Diskon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CETAK STRUK THERMAL MODAL */}
      {/* ======================================================== */}
      {showReceiptModal && viewingSale && (
        <ReceiptModal sale={viewingSale} onClose={() => setShowReceiptModal(false)} />
      )}
    </div>
  );
};
