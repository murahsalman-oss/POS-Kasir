import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Truck,
  RotateCcw,
  Package,
  FolderTree,
  Building2,
  Users,
  Boxes,
  ArrowLeftRight,
  Wallet,
  Clock,
  BarChart3,
  UserCog,
  FileText,
  DatabaseBackup,
  Settings,
  Server,
  Tag,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onToggle }) => {
  const { currentUser, canAccess } = useAuth();
  const { products, activeShift, settings } = useApp();

  const lowStockCount = products.filter((p) => p.stock <= (p.minStock || 10)).length;

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    requiredModule?: string;
  }

  interface MenuGroup {
    groupTitle?: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          requiredModule: currentUser?.role === 'kasir' ? 'dashboard_kasir' : 'dashboard'
        }
      ]
    },
    {
      groupTitle: 'TRANSAKSI',
      items: [
        {
          id: 'pos',
          label: 'Kasir (POS)',
          icon: ShoppingCart,
          badge: 'F3',
          badgeColor: 'bg-emerald-600 text-white',
          requiredModule: 'pos'
        },
        {
          id: 'sales',
          label: 'Riwayat Penjualan',
          icon: Receipt,
          requiredModule: 'sales_history'
        },
        {
          id: 'purchases',
          label: 'Pembelian (PO)',
          icon: Truck,
          requiredModule: 'purchases'
        },
        {
          id: 'returns',
          label: 'Retur Barang',
          icon: RotateCcw,
          requiredModule: 'returns_kasir'
        }
      ]
    },
    {
      groupTitle: 'MASTER DATA',
      items: [
        {
          id: 'products',
          label: 'Katalog Produk',
          icon: Package,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
          requiredModule: 'products'
        },
        {
          id: 'categories',
          label: 'Kategori & Satuan',
          icon: FolderTree,
          requiredModule: 'products'
        },
        {
          id: 'suppliers',
          label: 'Data Supplier',
          icon: Building2,
          requiredModule: 'suppliers'
        },
        {
          id: 'customers',
          label: 'Data Pelanggan',
          icon: Users,
          requiredModule: 'customers'
        },
        {
          id: 'labels',
          label: 'Cetak Label Barcode',
          icon: Tag,
          requiredModule: 'label_print'
        }
      ]
    },
    {
      groupTitle: 'INVENTORI',
      items: [
        {
          id: 'stock',
          label: 'Stok & Opname',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
          badgeColor: 'bg-rose-500 text-white',
          requiredModule: 'stock'
        },
        {
          id: 'stock_movements',
          label: 'Mutasi Stok Ledger',
          icon: ArrowLeftRight,
          requiredModule: 'stock'
        }
      ]
    },
    {
      groupTitle: 'KEUANGAN',
      items: [
        {
          id: 'cash',
          label: 'Kas & Pengeluaran',
          icon: Wallet,
          requiredModule: 'cash'
        },
        {
          id: 'shifts',
          label: 'Closing & Shift Kasir',
          icon: Clock,
          badge: activeShift ? 'Aktif' : 'Tutup',
          badgeColor: activeShift ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200',
          requiredModule: 'shifts'
        }
      ]
    },
    {
      groupTitle: 'LAPORAN',
      items: [
        {
          id: 'reports',
          label: 'Laporan & Laba/Rugi',
          icon: BarChart3,
          requiredModule: 'reports'
        }
      ]
    },
    {
      groupTitle: 'SISTEM & KEAMANAN',
      items: [
        {
          id: 'users',
          label: 'Pengguna & RBAC',
          icon: UserCog,
          requiredModule: 'users'
        },
        {
          id: 'audit_logs',
          label: 'Audit Log Aktivitas',
          icon: FileText,
          requiredModule: 'audit'
        },
        {
          id: 'backup',
          label: 'Backup Database SQL',
          icon: DatabaseBackup,
          requiredModule: 'backup'
        },
        {
          id: 'settings',
          label: 'Pengaturan Toko',
          icon: Settings,
          requiredModule: 'settings'
        }
      ]
    },
    {
      groupTitle: 'DEPLOYMENT HOSTING',
      items: [
        {
          id: 'deployment',
          label: 'cPanel & Source Code',
          icon: Server,
          badge: 'PHP 8.0',
          badgeColor: 'bg-indigo-600 text-white',
          requiredModule: 'deployment'
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-slate-900 border-r border-slate-800 text-slate-300 w-72 md:w-64 shrink-0 transition-transform duration-300 ease-in-out flex flex-col z-50 fixed inset-y-0 left-0 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="md:hidden p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-white">Menu Navigasi Toko</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {menuGroups.map((group, gIdx) => {
            // Filter items based on RBAC permissions
            const accessibleItems = group.items.filter((item) => {
              if (!item.requiredModule) return true;
              return canAccess(item.requiredModule);
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {group.groupTitle && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {group.groupTitle}
                  </div>
                )}
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (isOpen) onToggle();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            item.badgeColor || 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Status Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Status Server</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Online
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-300 font-medium truncate">
              {settings.storeName}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
