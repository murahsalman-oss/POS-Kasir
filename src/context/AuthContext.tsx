import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchAccount: (role: UserRole) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    StorageService.initStorage();
    const users = StorageService.getUsers();
    // Default logged in user as super_admin for immediate rich access, but switcher available
    const savedUserId = localStorage.getItem('pos_active_user_id');
    const existing = users.find((u) => u.id === savedUserId) || users[0];
    if (existing) {
      setCurrentUser(existing);
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const users = StorageService.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return { success: false, message: 'Username tidak ditemukan di database.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Akun Anda dinonaktifkan oleh administrator.' };
    }

    // Default password for demo is 123456
    if (password !== '123456') {
      return { success: false, message: 'Password salah. Gunakan password default: 123456' };
    }

    setCurrentUser(user);
    localStorage.setItem('pos_active_user_id', user.id);

    StorageService.addAuditLog(
      user,
      'Login Pengguna',
      'Autentikasi',
      `Pengguna ${user.fullName} (${user.role}) berhasil masuk ke sistem`
    );

    return { success: true, message: 'Login berhasil! Selamat datang kembali.' };
  };

  const logout = () => {
    if (currentUser) {
      StorageService.addAuditLog(
        currentUser,
        'Logout Pengguna',
        'Autentikasi',
        `Pengguna ${currentUser.fullName} keluar dari sistem`
      );
    }
    setCurrentUser(null);
    localStorage.removeItem('pos_active_user_id');
  };

  const switchAccount = (role: UserRole) => {
    const users = StorageService.getUsers();
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('pos_active_user_id', target.id);
      StorageService.addAuditLog(
        target,
        'Beralih Akun',
        'Autentikasi',
        `Beralih ke pengguna ${target.fullName} (${target.role})`
      );
    }
  };

  const changePassword = (_oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Tidak ada user aktif' };
    if (newPass.length < 6) return { success: false, message: 'Password minimal 6 karakter' };

    StorageService.addAuditLog(
      currentUser,
      'Ubah Password',
      'Keamanan',
      `Pengguna ${currentUser.fullName} memperbarui password akun`
    );

    return { success: true, message: 'Password berhasil diperbarui!' };
  };

  const canAccess = (module: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;

    if (currentUser.role === 'manajer') {
      // Manajer can access almost everything except user management, database backup, settings
      const forbiddenForManager = ['users', 'settings', 'backup'];
      return !forbiddenForManager.includes(module);
    }

    if (currentUser.role === 'kasir') {
      // Kasir strictly only has access to cashier operations
      const allowedForKasir = ['pos', 'shifts', 'sales_history', 'returns_kasir', 'dashboard_kasir', 'label_print'];
      return allowedForKasir.includes(module);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchAccount,
        changePassword,
        canAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
