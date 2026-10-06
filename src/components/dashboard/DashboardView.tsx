import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Package,
  AlertTriangle,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  BarChart2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { products, sales, purchases, cashTransactions, customers, activeShift } = useApp();
  const { currentUser } = useAuth();

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Compute metrics
  const todayStr = new Date().toISOString().substring(0, 10);
  const todaySales = sales.filter((s) => s.date.startsWith(todayStr));
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);

  const monthStr = todayStr.substring(0, 7);
  const monthSales = sales.filter((s) => s.date.startsWith(monthStr));
  const monthRevenue = monthSales.reduce((acc, s) => acc + s.grandTotal, 0);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 10));
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

  // Profit estimation: Total Revenue - COGS (HPP)
  const totalCOGS = sales.reduce((acc, s) => {
    const saleCost = s.items.reduce((cAcc, it) => cAcc + (it.buyPrice || 0) * it.quantity, 0);
    return acc + saleCost;
  }, 0);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalExpenses = cashTransactions
    .filter((c) => c.type === 'keluar')
    .reduce((acc, c) => acc + c.amount, 0);
  const estimatedProfit = Math.max(0, totalSalesRevenue - totalCOGS - totalExpenses);

  const totalCashIn = cashTransactions
    .filter((c) => c.type === 'masuk')
    .reduce((acc, c) => acc + c.amount, 0);
  const totalCashOut = totalExpenses;

  // Best selling products calculation
  const productSalesMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Daily revenue mockup data for last 7 days chart
  const last7Days = [
    { day: 'Sen', amount: 450000 },
    { day: 'Sel', amount: 620000 },
    { day: 'Rab', amount: 510000 },
    { day: 'Kam', amount: 780000 },
    { day: 'Jum', amount: 920000 },
    { day: 'Sab', amount: 1250000 },
    { day: 'Min (Hari Ini)', amount: Math.max(890000, todayRevenue) }
  ];
  const maxBar = Math.max(...last7Days.map((d) => d.amount));

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 sm:space-y-6 bg-slate-50 pb-24 md:pb-6">
      {/* Welcome & Shift Alert Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Operasional Harian Minimarket
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
              Role: {currentUser?.role}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black mt-1">
            Selamat Datang, {currentUser?.fullName}!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Pantau performa penjualan kasir, ketersediaan inventori, dan arus kas secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('pos')}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all min-h-[42px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buka Meja Kasir (POS)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Penjualan Hari Ini */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Hari Ini
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 font-mono truncate">
            {formatRupiah(todayRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1 truncate">
            <Receipt className="w-3 h-3 shrink-0" />
            <span>{todaySales.length} transaksi</span>
          </div>
        </div>

        {/* Penjualan Bulan Ini */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Omzet Bulan Ini
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 font-mono truncate">
            {formatRupiah(monthRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-blue-600 font-semibold mt-1 truncate">
            <span>{monthSales.length} pesanan</span>
          </div>
        </div>

        {/* Estimasi Laba Bersih (Hidden for pure kasir) */}
        {currentUser?.role !== 'kasir' ? (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Laba Bersih
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 font-mono truncate">
              {formatRupiah(estimatedProfit)}
            </p>
            <div className="text-[10px] sm:text-[11px] text-indigo-600 font-semibold mt-1 truncate">
              <span>Margin Operasional</span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                Shift Kasir
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 sm:mt-2 truncate">
              {activeShift ? activeShift.cashierName : 'Ditutup'}
            </p>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-semibold mt-1 truncate">
              Modal: Rp {activeShift?.initialCash.toLocaleString('id-ID') || '0'}
            </div>
          </div>
        )}

        {/* Total Produk & Stok Menipis */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Produk SKU
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 font-mono truncate">
            {products.length} SKU
          </p>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold mt-1 truncate">
            {lowStockProducts.length > 0 ? (
              <span className="text-rose-600 flex items-center gap-0.5 truncate">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {lowStockProducts.length} menipis
              </span>
            ) : (
              <span className="text-emerald-600">Stok aman</span>
            )}
          </div>
        </div>

        {/* Total Pembelian */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Pembelian PO
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 font-mono truncate">
            {formatRupiah(totalPurchasesAmount)}
          </p>
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-1 truncate">
            {purchases.length} faktur restock
          </div>
        </div>

        {/* Kas Masuk */}
        {/* Kas Masuk */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Kas Masuk
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-emerald-700 mt-1.5 sm:mt-2 font-mono truncate">
            {formatRupiah(totalCashIn)}
          </p>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1 truncate">
            Penjualan + Modal
          </div>
        </div>

        {/* Kas Keluar / Pengeluaran */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Pengeluaran Kas
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-rose-700 mt-1.5 sm:mt-2 font-mono truncate">
            {formatRupiah(totalCashOut)}
          </p>
          <div className="text-[10px] sm:text-[11px] text-rose-600 font-semibold mt-1 truncate">
            Beban operasional & belanja
          </div>
        </div>

        {/* Total Pelanggan */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Pelanggan & Member
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-xl font-black text-slate-900 mt-1.5 sm:mt-2 truncate">
            {customers.length} Kontak
          </p>
          <div className="text-[10px] sm:text-[11px] text-sky-600 font-semibold mt-1 truncate">
            {customers.filter((c) => c.isMember).length} member aktif
          </div>
        </div>
      </div>

      {/* Middle Row: Graphical Charts & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Penjualan 7 Hari Terakhir (Bar Chart SVG) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Tren Penjualan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Statistik pendapatan harian kasir</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Laporan Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-4 pb-2">
            <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {last7Days.map((item, idx) => {
                const heightPercent = Math.round((item.amount / maxBar) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatRupiah(item.amount)}
                    </div>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-full">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Produk Terlaris */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Top Produk Terlaris
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Qty Terjual</span>
          </div>

          <div className="flex-1 divide-y divide-slate-100 space-y-2">
            {bestSellers.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">Belum ada data penjualan tercatat.</p>
            ) : (
              bestSellers.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">{item.qty} pcs</span>
                    <span className="text-[10px] text-slate-400 block">{formatRupiah(item.revenue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Alert: Low Stock & Out of Stock Notification Table */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Peringatan Stok Barang Menipis & Habis!</h3>
            </div>
            <button
              onClick={() => onNavigate('stock')}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Buka Manajemen Stok
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map((prod) => (
              <div
                key={prod.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs text-slate-800 truncate">{prod.name}</h5>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {prod.barcode} • Rak: {prod.shelfLocation}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.stock <= 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {prod.stock <= 0 ? 'HABIS' : `Sisa ${prod.stock}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
