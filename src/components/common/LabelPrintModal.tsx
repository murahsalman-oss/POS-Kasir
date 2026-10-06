import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Tag, X } from 'lucide-react';

interface LabelPrintModalProps {
  product?: Product;
  onClose: () => void;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({ product, onClose }) => {
  const { products, settings } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product>(product || products[0]);
  const [copies, setCopies] = useState<number>(4);

  const formatRupiah = (val: number) => 'Rp ' + Number(val).toLocaleString('id-ID');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Cetak Label Harga & Barcode Rak</h3>
              <p className="text-xs text-slate-400">Stiker Rak Minimarket & Label Barcode Produk</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Produk</label>
              <select
                value={selectedProduct.id}
                onChange={(e) => {
                  const p = products.find((prod) => prod.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatRupiah(p.sellPrice)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah Label Dicetak</label>
              <input
                type="number"
                min="1"
                max="24"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Label Preview Grid */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Preview Stiker Label Rak Toko:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1">
              {Array.from({ length: copies }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-slate-300 rounded-lg p-3 text-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="border-b border-slate-200 pb-1.5 mb-2 flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{settings.storeName}</span>
                    <span className="text-[9px] font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{selectedProduct.shelfLocation || 'Rak Utama'}</span>
                  </div>

                  <h5 className="font-bold text-xs line-clamp-2 text-slate-900 leading-tight mb-1.5">
                    {selectedProduct.name}
                  </h5>

                  <div className="text-right my-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Harga Pas</span>
                    <span className="text-base font-black text-rose-600">
                      {formatRupiah(selectedProduct.sellPrice)}
                    </span>
                  </div>

                  {/* Synthetic SVG Barcode */}
                  <div className="text-center pt-2 border-t border-dashed border-slate-200">
                    <div className="h-7 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                      {selectedProduct.barcode.split('').map((char, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-slate-900 h-6"
                          style={{
                            width: (parseInt(char) % 3) + 1 + 'px',
                            marginRight: (parseInt(char) % 2) + 'px'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 block mt-0.5">
                      {selectedProduct.barcode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Dapat dicetak pada stiker label Tom & Jerry atau kertas thermal continuous.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors min-h-[38px]"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs min-h-[38px]"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
