import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Menu
} from 'lucide-react';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { SalesView } from './components/sales/SalesView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { CustomersView } from './components/customers/CustomersView';
import { StockView } from './components/inventory/StockView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ReturnsView } from './components/returns/ReturnsView';
import { CashView } from './components/cash/CashView';
import { ShiftsView } from './components/shifts/ShiftsView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { BackupView } from './components/backup/BackupView';
import { DeploymentGuideView } from './components/deployment/DeploymentGuideView';
import { LabelPrintModal } from './components/common/LabelPrintModal';

const MainLayout: React.FC = () => {
  const { currentUser, canAccess } = useAuth();
  const { cart } = useApp();
  const [currentTab, setCurrentTab] = useState<string>(currentUser?.role === 'kasir' ? 'pos' : 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  // Handle Tab Navigation with RBAC safeguard
  const handleSelectTab = (tab: string) => {
    if (tab === 'labels') {
      setShowLabelModal(true);
      return;
    }
    setCurrentTab(tab);
    setSidebarOpen(false);
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleSelectTab} />;
      case 'pos':
        return <PosView />;
      case 'sales':
        return <SalesView onNavigateToReturns={() => setCurrentTab('returns')} />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'customers':
        return <CustomersView />;
      case 'stock':
      case 'stock_movements':
        return <StockView />;
      case 'purchases':
        return <PurchasesView />;
      case 'returns':
        return <ReturnsView />;
      case 'cash':
        return <CashView />;
      case 'shifts':
        return <ShiftsView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'backup':
      case 'audit_logs':
        return <BackupView />;
      case 'deployment':
        return <DeploymentGuideView />;
      default:
        return <DashboardView onNavigate={handleSelectTab} />;
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-100 font-sans antialiased text-slate-800 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenShiftModal={() => setCurrentTab('shifts')}
        onNavigate={handleSelectTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dynamic View Area with mobile bottom padding */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop md+) */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30 flex items-center justify-around px-2 text-slate-400 shadow-2xl safe-area-bottom"
      >
        {/* Kasir / POS Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab('pos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative min-h-[48px] ${
            currentTab === 'pos' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none font-medium">Kasir</span>
        </button>

        {/* Produk Tab */}
        {canAccess('products') && (
          <button
            type="button"
            onClick={() => handleSelectTab('products')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] ${
              currentTab === 'products' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">Produk</span>
          </button>
        )}

        {/* Dashboard Tab */}
        {canAccess('dashboard') && (
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] ${
              currentTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none font-medium">Dashboard</span>
          </button>
        )}

        {/* Riwayat Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab('sales')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] ${
            currentTab === 'sales' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-none font-medium">Riwayat</span>
        </button>

        {/* Menu (All Modules Drawer) */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px] ${
            sidebarOpen ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-none font-medium">Menu</span>
        </button>
      </nav>

      {/* Label Modal Trigger */}
      {showLabelModal && <LabelPrintModal onClose={() => setShowLabelModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
