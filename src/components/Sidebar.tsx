import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Lock,
  LogOut,
  Sparkles,
  Handshake,
  ShoppingCart,
  Image as ImageIcon,
  Network,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'withdrawals', label: 'Withdrawals (উইথড্রয়াল)', icon: DollarSign },
    { id: 'banners', label: 'Banners & Slider', icon: ImageIcon },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'referrals', label: 'Referral Team (রেফারেল)', icon: Network },
    { id: 'vendorship', label: 'Vendorship', icon: Handshake },
    { id: 'reselling', label: 'Reselling Shop', icon: ShoppingCart },
    { id: 'microjobs', label: 'Micro Jobs (Tasks)', icon: Sparkles },
    { id: 'jobposts', label: 'Job Posts', icon: Briefcase },
    { id: 'drive', label: 'Drive Offers', icon: DollarSign },
    { id: 'recharge', label: 'Mobile Recharge', icon: Smartphone },
    { id: 'staff', label: 'Staff & Permissions', icon: UserCheck },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'settings', label: 'Settings & Modules', icon: Settings },
    { id: 'security', label: 'Security & Audit Logs', icon: Lock },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
              overflow: 'hidden',
            }}
          >
            <img
              src="/logo.png"
              alt="SDB Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.2px' }}>
              Smart Digital Business
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Admin Panel v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-hover)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#fff' : '#94a3b8'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
            }}
          >
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8' }}>
              {user?.role === 'super_admin' ? 'Owner / Super Admin' : user?.role || 'Staff'}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
