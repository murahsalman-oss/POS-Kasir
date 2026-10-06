import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Clock,
  Keyboard,
  Scan,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  Menu
} from 'lucide-react';
import { BarcodeModal } from '../common/BarcodeModal';

interface NavbarProps {
  onOpenShiftModal?: () => void;
  onNavigate?: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShiftModal, onNavigate, onToggleSidebar }) => {
  const { currentUser, logout, switchAccount } = useAuth();
  const { settings, activeShift, toasts, removeToast } = useApp();
  const [currentTime, setCurrentTime] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) +
          ' ' +
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Store Name + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-xs sm:text-base tracking-tight leading-none text-white truncate max-w-[130px] sm:max-w-none">
                  {settings.storeName}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  POS v1.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight hidden sm:block mt-0.5 truncate">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Center Info: Shift & Time (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Shift Pill */}
            {activeShift ? (
              <button
                onClick={onOpenShiftModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-900/60 transition-colors shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>
                  Shift Aktif: <strong className="text-white">{activeShift.cashierName}</strong> (Modal: Rp{' '}
                  {activeShift.initialCash.toLocaleString('id-ID')})
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenShiftModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-900/60 transition-colors shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Shift Belum Dibuka — Klik untuk Buka Shift</span>
              </button>
            )}

            {/* Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Shift Quick Pill */}
            <div className="md:hidden">
              {activeShift ? (
                <button
                  type="button"
                  onClick={onOpenShiftModal}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                  title="Shift Aktif - Klik untuk detail"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Shift ON</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenShiftModal}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-bold"
                  title="Shift Belum Dibuka - Klik untuk buka"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Buka Shift</span>
                </button>
              )}
            </div>

            {/* Barcode Quick Trigger */}
            <button
              onClick={() => setShowScanner(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs min-h-[38px] min-w-[38px]"
              title="Buka Scanner Barcode (F2)"
            >
              <Scan className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Scan (F2)</span>
            </button>

            {/* Shortcut Keys Modal Trigger (Desktop/Tablet only) */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium items-center gap-1.5 transition-colors shadow-2xs min-h-[38px]"
              title="Panduan Tombol Shortcut Kasir"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Shortcut</span>
            </button>

            {/* User Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors min-h-[38px]"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  {currentUser?.fullName.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    <span>{currentUser?.fullName.split(' ')[0]}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">
                    {currentUser?.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-slate-800">
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-400 font-medium">Login sebagai:</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentUser?.fullName}</p>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      Username: @{currentUser?.username} ({currentUser?.role})
                    </p>
                  </div>

                  {/* Switch Account Quick Demo */}
                  <div className="px-2 py-2">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Beralih Akun (Role Switcher):
                    </p>
                    <button
                      onClick={() => {
                        switchAccount('super_admin');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                    >
                      <span>Super Admin (admin123)</span>
                      {currentUser?.role === 'super_admin' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        switchAccount('kasir');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                    >
                      <span>Kasir (kasir)</span>
                      {currentUser?.role === 'kasir' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        switchAccount('manajer');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 flex items-center justify-between"
                    >
                      <span>Manajer Toko (manajer)</span>
                      {currentUser?.role === 'manajer' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </button>
                  </div>

                  <div className="px-2 py-1.5">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar / Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-500/40 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 border-amber-500/40 text-amber-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs">{toast.title}</h5>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white shrink-0 p-0.5 rounded-md hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeModal
          onClose={() => setShowScanner(false)}
          onProductScanned={() => {
            if (onNavigate) onNavigate('pos');
          }}
        />
      )}

      {/* Keyboard Shortcut Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">Shortcut Keyboard Kasir</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Gunakan tombol keyboard berikut untuk mempercepat proses transaksi di meja kasir:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Fokus Pencarian Produk</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 shadow-2xs">
                    F1
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Barcode Scanner / Scan</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 shadow-2xs">
                    F2
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Buka Modal Pembayaran / Bayar</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-emerald-700 shadow-2xs">
                    F3
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Tahan Transaksi (Hold Order)</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 shadow-2xs">
                    F4
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Transaksi Baru / Muat Tertahan</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 shadow-2xs">
                    F5
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Cetak Ulang Struk Terakhir</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-800 shadow-2xs">
                    F9
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-medium text-slate-700">Batal / Tutup Modal / Kosongkan</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-rose-700 shadow-2xs">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
