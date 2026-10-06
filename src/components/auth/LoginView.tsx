import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Lock, User, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin123');
  const [password, setPassword] = useState('123456');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const res = await login(username, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleQuickFill = (user: string) => {
    setUsername(user);
    setPassword('123456');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            MINIMARKET BERKAH JAYA
          </h2>
          <p className="text-xs text-slate-400">
            Sistem Point of Sale & Manajemen Toko Lengkap
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username Pengguna
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin123 atau kasir"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{isLoading ? 'Memproses...' : 'Masuk ke Sistem POS'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Pilih Akun Demo Default:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin123')}
              className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Super Admin</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5">admin123 / 123456</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('kasir')}
              className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kasir Shift</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 mt-0.5">kasir / 123456</p>
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
          <KeyRound className="w-3 h-3 text-emerald-400" />
          <span>Password di-hash dengan bcrypt & terlindungi proteksi CSRF</span>
        </div>
      </div>
    </div>
  );
};
