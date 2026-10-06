import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Barcode, Scan, Search, Plus, Check, X, Camera } from 'lucide-react';

interface BarcodeModalProps {
  onClose: () => void;
  onProductScanned?: (product: Product) => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ onClose, onProductScanned }) => {
  const { products, addToCart, showToast } = useApp();
  const [inputBarcode, setInputBarcode] = useState('');
  const [scannedResult, setScannedResult] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleScan = (codeToScan?: string) => {
    const code = (codeToScan || inputBarcode).trim();
    if (!code) return;

    const matched = products.find(
      (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      setScannedResult(matched);
      setNotFound(false);
      if (onProductScanned) {
        onProductScanned(matched);
      } else {
        addToCart(matched, 1);
      }
    } else {
      setScannedResult(null);
      setNotFound(true);
      showToast('error', 'Produk Tidak Ditemukan', `Barcode "${code}" belum terdaftar di sistem.`);
    }
  };

  const sampleBarcodes = products.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Barcode Scanner POS</h3>
              <p className="text-xs text-slate-400">Mendukung USB Laser Scanner & Input Manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Animated Scanner Laser Box */}
          <div className="relative bg-slate-950 rounded-xl p-6 text-center border-2 border-dashed border-emerald-500/50 overflow-hidden group">
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-pulse top-1/2"></div>
            <Barcode className="w-20 h-20 text-slate-400 mx-auto opacity-75" />
            <p className="text-xs text-emerald-400 font-medium mt-3 flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Sensor USB Scanner Aktif & Siaga
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Arahkan scanner USB atau ketik kode barcode di bawah lalu tekan Enter
            </p>
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputBarcode}
                onChange={(e) => {
                  setInputBarcode(e.target.value);
                  setNotFound(false);
                }}
                placeholder="Scan / Ketik Barcode (Contoh: 8999999999999)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 min-h-[40px]"
            >
              Cari & Masukkan
            </button>
          </form>

          {/* Not Found Alert */}
          {notFound && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
              <div>
                <p className="font-semibold">Produk tidak ditemukan!</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Barcode belum terdaftar dalam master produk.
                </p>
              </div>
            </div>
          )}

          {/* Scanned result success box */}
          {scannedResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold uppercase">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Produk Terdeteksi
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">{scannedResult.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-mono">
                  <span>Barcode: {scannedResult.barcode}</span>
                  <span>•</span>
                  <span>Stok: {scannedResult.stock}</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-700">
                    Rp {scannedResult.sellPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  addToCart(scannedResult, 1);
                  onClose();
                }}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah ke POS
              </button>
            </div>
          )}

          {/* Quick Click Samples */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Klik Contoh Barcode Produk Toko:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {sampleBarcodes.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    setInputBarcode(prod.barcode);
                    handleScan(prod.barcode);
                  }}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs"
                >
                  <p className="font-semibold text-slate-800 truncate">{prod.name}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-0.5">{prod.barcode}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
