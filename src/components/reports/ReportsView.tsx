import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Receipt,
  ShoppingBag,
  DollarSign,
  PieChart,
  ArrowRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, purchases, returns, cashTransactions, products, categories, showToast } = useApp();

  const [reportTab, setReportTab] = useState<'sales' | 'profit_loss' | 'top_products' | 'stock_valuation'>('sales');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  // Filter Sales based on date
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const monthStr = now.toISOString().substring(0, 7);

  const filteredSales = sales.filter((s) => {
    if (dateFilter === 'today') return s.date.startsWith(todayStr);
    if (dateFilter === 'month') return s.date.startsWith(monthStr);
    return true;
  });

  // Calculate Profit & Loss
  const totalOmzet = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalHPP = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((iAcc, it) => iAcc + (it.buyPrice || 0) * it.quantity, 0);
  }, 0);
  const grossProfit = totalOmzet - totalHPP;
  const totalDiskon = filteredSales.reduce((acc, s) => acc + s.discountNominal, 0);
  const totalRetur = returns.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalBiayaOperasional = cashTransactions
    .filter((c) => c.type === 'keluar')
    .reduce((acc, c) => acc + c.amount, 0);

  const netProfit = totalOmzet - totalHPP - totalBiayaOperasional;

  // Best Sellers
  const productSalesMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });
  const bestSellers = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Stock valuation
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockModalValue = products.reduce((acc, p) => acc + p.buyPrice * p.stock, 0);
  const totalStockPotentialSales = products.reduce((acc, p) => acc + p.sellPrice * p.stock, 0);
  const potentialProfitFromStock = totalStockPotentialSales - totalStockModalValue;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvData = '';
    if (reportTab === 'sales') {
      csvData = 'Faktur,Tanggal,Pelanggan,Kasir,Metode,Total\n';
      filteredSales.forEach((s) => {
        csvData += `${s.invoiceNumber},${s.date},"${s.customerName}","${s.cashierName}",${s.paymentMethod},${s.grandTotal}\n`;
      });
    } else if (reportTab === 'top_products') {
      csvData = 'Nama Produk,Qty Terjual,Omzet\n';
      bestSellers.forEach((b) => {
        csvData += `"${b.name}",${b.qty},${b.revenue}\n`;
      });
    } else {
      csvData = `Omzet,${totalOmzet}\nHPP,${totalHPP}\nBiaya Operasional,${totalBiayaOperasional}\nLaba Bersih,${netProfit}\n`;
    }

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_${reportTab}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Ekspor CSV Berhasil', 'Laporan telah diunduh.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 bg-slate-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Laporan Keuangan & Inventori</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analisis penjualan kasir, perhitungan laba/rugi bersih, produk terlaris, dan nilai aset toko.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs min-h-[38px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setReportTab('sales')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              reportTab === 'sales' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Laporan Penjualan
          </button>
          <button
            onClick={() => setReportTab('profit_loss')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              reportTab === 'profit_loss' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Laba / Rugi Sederhana
          </button>
          <button
            onClick={() => setReportTab('top_products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              reportTab === 'top_products' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Produk Terlaris
          </button>
          <button
            onClick={() => setReportTab('stock_valuation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              reportTab === 'stock_valuation' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Valuasi Nilai Stok
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs overflow-x-auto">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              dateFilter === 'today' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              dateFilter === 'month' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium ${
              dateFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* TAB 1: PENJUALAN */}
      {reportTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Omzet Penjualan
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{formatRupiah(totalOmzet)}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Jumlah Transaksi Selesai
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{filteredSales.length} Transaksi</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rata-Rata Nilai Struk
              </span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {filteredSales.length > 0 ? formatRupiah(totalOmzet / filteredSales.length) : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Mobile Sales Report Cards (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {filteredSales.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{s.invoiceNumber}</span>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{s.date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {s.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-xl">
                  <span>Kasir: <strong className="text-slate-800">{s.cashierName}</strong></span>
                  <span className="text-slate-500">{s.customerName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Total Transaksi</span>
                  <span className="font-black text-sm font-mono text-slate-900">{formatRupiah(s.grandTotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No. Transaksi (Faktur)</th>
                    <th className="py-3 px-4">Tanggal & Waktu</th>
                    <th className="py-3 px-4">Kasir</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4 font-mono text-right">Total Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.invoiceNumber}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{s.date}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{s.cashierName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{s.customerName}</td>
                      <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-slate-700">
                        {s.paymentMethod}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900 text-right">
                        {formatRupiah(s.grandTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LABA / RUGI SEDERHANA */}
      {reportTab === 'profit_loss' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Laporan Laba / Rugi Operasional</h3>
            <p className="text-xs text-slate-500">Perhitungan pendapatan bersih toko minimarket</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold text-slate-700">Omzet Penjualan Kotor (Gross Revenue):</span>
              <span className="font-bold font-mono text-slate-900">{formatRupiah(totalOmzet)}</span>
            </div>

            <div className="flex justify-between py-2 border-b text-rose-700">
              <span>(-) Harga Pokok Penjualan (HPP / Biaya Beli Modal Barang):</span>
              <span className="font-bold font-mono">-{formatRupiah(totalHPP)}</span>
            </div>

            <div className="flex justify-between py-2 border-b bg-emerald-50 px-3 rounded-lg font-semibold text-emerald-900">
              <span>(=) Laba Kotor Penjualan:</span>
              <span className="font-mono font-bold">{formatRupiah(grossProfit)}</span>
            </div>

            <div className="flex justify-between py-2 border-b text-slate-600">
              <span>(-) Total Diskon Diberikan:</span>
              <span className="font-mono">-{formatRupiah(totalDiskon)}</span>
            </div>

            <div className="flex justify-between py-2 border-b text-rose-700">
              <span>(-) Beban Biaya & Pengeluaran Operasional (Listrik, Air, Gaji, dll):</span>
              <span className="font-bold font-mono">-{formatRupiah(totalBiayaOperasional)}</span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-900 bg-slate-900 text-white px-4 rounded-xl text-sm font-bold">
              <span>(=) ESTIMASI LABA BERSIH (NET PROFIT):</span>
              <span className="font-mono text-base text-emerald-400 font-black">{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOP PRODUK TERLARIS */}
      {reportTab === 'top_products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-sm text-slate-900">Peringkat Produk Paling Banyak Terjual</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4 text-center">Jumlah Terjual (Qty)</th>
                <th className="py-3 px-4 text-right">Total Nilai Penjualan (Omzet)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bestSellers.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-500">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">{item.qty} Unit</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                    {formatRupiah(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: VALUASI NILAI STOK */}
      {reportTab === 'stock_valuation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Jumlah Fisik Barang
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{totalStockItems} Pcs</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Nilai Aset Modal (HPP)
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {formatRupiah(totalStockModalValue)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Potensi Omzet Jika Habis Terjual
              </span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {formatRupiah(totalStockPotentialSales)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
