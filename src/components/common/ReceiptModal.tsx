import React, { useState } from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, Copy, Check, X } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { settings } = useApp();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.thermalPaperSize || '58mm');
  const [copied, setCopied] = useState(false);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReceipt = `
================================
${settings.storeName}
${settings.address}
Telp: ${settings.phone}
================================
No. Transaksi : ${sale.invoiceNumber}
Tanggal       : ${sale.date}
Kasir         : ${sale.cashierName}
Pelanggan     : ${sale.customerName}
--------------------------------
${sale.items
  .map(
    (item) =>
      `${item.productName}\n  ${item.quantity} x ${formatRupiah(item.sellPrice)} = ${formatRupiah(item.subtotal)}`
  )
  .join('\n')}
--------------------------------
Subtotal   : ${formatRupiah(sale.subtotal)}
Diskon     : ${formatRupiah(sale.discountNominal)}
Pajak      : ${formatRupiah(sale.taxAmount)}
TOTAL      : ${formatRupiah(sale.grandTotal)}
Metode     : ${sale.paymentMethod.toUpperCase()}
Bayar      : ${formatRupiah(sale.paidAmount)}
Kembali    : ${formatRupiah(sale.changeAmount)}
================================
${settings.receiptFooter}
================================
    `.trim();

    navigator.clipboard.writeText(textReceipt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Struk Transaksi Kasir</h3>
              <p className="text-xs text-slate-400">{sale.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Size Selector & Action Buttons */}
        <div className="bg-slate-100 px-3.5 sm:px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-slate-700">
            <span>Ukuran Kertas:</span>
            <div className="inline-flex rounded-lg bg-white p-1 border border-slate-300 shadow-2xs">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  paperWidth === '58mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                58mm (Kecil)
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                80mm (Standar)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs min-h-[36px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin Teks'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors min-h-[36px]"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Struk
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex justify-center bg-slate-200/70">
          <div
            id="thermal-receipt"
            className={`bg-white p-5 shadow-md border border-slate-200 font-mono text-slate-800 rounded-sm ${
              paperWidth === '58mm' ? 'w-[280px] text-[11px]' : 'w-[360px] text-xs'
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="font-extrabold text-sm tracking-wider uppercase text-slate-900">{settings.storeName}</h2>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">{settings.address}</p>
              <p className="text-[10px] text-slate-600">Telp: {settings.phone}</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] leading-tight space-y-1">
              <div className="flex justify-between">
                <span>No. TRX :</span>
                <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal :</span>
                <span>{sale.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir   :</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan :</span>
                <span>{sale.customerName}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-700 pb-1 border-b border-dotted border-slate-300">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="leading-tight">
                  <div className="font-semibold text-slate-900">{item.productName}</div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>
                      {item.quantity} x {formatRupiah(item.sellPrice)}
                      {item.discountNominal > 0 ? ` (-${formatRupiah(item.discountNominal)})` : ''}
                    </span>
                    <span className="font-medium text-slate-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(sale.subtotal)}</span>
              </div>
              {sale.discountNominal > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(sale.discountNominal)}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({sale.taxPercent}%):</span>
                  <span>{formatRupiah(sale.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-dashed border-slate-400 text-slate-900">
                <span>TOTAL:</span>
                <span>{formatRupiah(sale.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1 text-slate-700">
                <span>Metode:</span>
                <span className="uppercase font-semibold">{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>Bayar:</span>
                <span>{formatRupiah(sale.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-900">
                <span>Kembali:</span>
                <span>{formatRupiah(sale.changeAmount)}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center text-[10px] text-slate-600 space-y-2">
              <div className="font-mono tracking-widest text-slate-800 text-[11px] py-1 bg-slate-50 border border-slate-200 rounded-sm">
                * {sale.invoiceNumber} *
              </div>
              <p className="whitespace-pre-line leading-relaxed font-sans text-[9px] text-slate-500">
                {settings.receiptFooter}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Kompatibel dengan semua printer thermal USB/Bluetooth ESC/POS.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
