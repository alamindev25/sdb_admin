import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { RechargeView } from './views/RechargeView';
import { MicroJobsView } from './views/MicroJobsView';
import { JobPostsView } from './views/JobPostsView';
import { DriveOffersView } from './views/DriveOffersView';
import { ProductsServicesView } from './views/ProductsServicesView';
import { VendorshipView } from './views/VendorshipView';
import { ResellingView } from './views/ResellingView';
import { WithdrawalsView } from './views/WithdrawalsView';
import { StaffPermissionsView } from './views/StaffPermissionsView';
import { UsersView } from './views/UsersView';
import { AuditView } from './views/AuditView';
import { BannersView } from './views/BannersView';
import { ReferralsView } from './views/ReferralsView';
import { LoginView } from './views/LoginView';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b132b', color: '#fff' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'banners':
        return <BannersView />;
      case 'referrals':
        return <ReferralsView />;
      case 'withdrawals':
        return <WithdrawalsView />;
      case 'recharge':
        return <RechargeView />;
      case 'microjobs':
        return <MicroJobsView />;
      case 'jobposts':
        return <JobPostsView />;
      case 'vendorship':
        return <VendorshipView />;
      case 'reselling':
        return <ResellingView />;
      case 'products':
        return <ProductsServicesView />;
      case 'drive':
        return <DriveOffersView />;
      case 'staff':
        return <StaffPermissionsView />;
      case 'users':
      case 'verification':
        return <UsersView />;
      case 'security':
      case 'settings':
        return <AuditView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="admin-main">
        <Header />
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
