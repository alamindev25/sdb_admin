import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Wallet,
  Clock,
  ShieldCheck,
  PlusCircle,
  Smartphone,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Briefcase,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [moduleToggles, setModuleToggles] = useState<Record<string, boolean>>({
    recharge: true,
    adsAndJobs: true,
    messenger: false,
    groups: false,
    meeting: false,
    productsAndServices: true,
    referral: false,
    verification: true,
  });

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/stats/dashboard');
      if (res.data) {
        setStats(res.data);
        if (res.data.moduleControls) {
          setModuleToggles(res.data.moduleControls);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleModule = async (key: string) => {
    const updated = { ...moduleToggles, [key]: !moduleToggles[key] };
    setModuleToggles(updated);
    try {
      await apiRequest('/stats/module-settings', {
        method: 'POST',
        body: JSON.stringify({ modules: updated }),
      });
    } catch (err) {
      console.error('Failed to update module toggle:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ fontSize: '15px', color: '#64748b' }}>ড্যাশবোর্ড ডেটা লোড হচ্ছে...</div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalUsers: 12458,
    activeUsers: 8732,
    todayEarnings: 48750,
    pendingWithdrawals: 12500,
    pendingWithdrawalsCount: 1,
    pendingVerifications: 23,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: '14px',
          padding: '24px 28px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>👑</span>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>স্বাগতম, {user?.name || 'Sakibur Rahman'}</h2>
          </div>
          <p style={{ fontSize: '13.5px', color: '#bfdbfe' }}>
            Smart Digital Business Admin Panel এ আপনাকে স্বাগতম! এখান থেকে পুরো সিস্টেম নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <button
          onClick={() => onNavigate('recharge')}
          className="btn"
          style={{
            background: '#ffffff',
            color: '#1e3a8a',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Smartphone size={16} />
          <span>রিচার্জ রিকোয়েস্ট দেখুন</span>
        </button>
      </div>

      {/* Top 5 Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {/* Total Users */}
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>মোট ব্যবহারকারী</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              {summary.totalUsers.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} />
              <span>↑ 12% গত ৭ দিনের তুলনায়</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>সক্রিয় ব্যবহারকারী</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              {summary.activeUsers.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} />
              <span>↑ 18% সক্রিয় হার</span>
            </div>
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>আজকের আয়</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              ৳ {summary.todayEarnings.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} />
              <span>↑ 26% গত দিনের তুলনায়</span>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div
          className="stat-card"
          onClick={() => onNavigate('withdrawals')}
          style={{ borderLeft: '4px solid #f59e0b', cursor: 'pointer' }}
          title="উইথড্রয়াল ম্যানেজমেন্ট দেখতে ক্লিক করুন"
        >
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>পেন্ডিং উইথড্রয়াল</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              ৳ {summary.pendingWithdrawals.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
              <span>{stats?.pendingCounts?.withdrawals ?? summary.pendingWithdrawalsCount ?? 1} টি অনুরোধ পর্যালোচনাধীন ➜</span>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="stat-card" style={{ borderLeft: '4px solid #f43f5e' }}>
          <div className="stat-icon" style={{ background: '#ffe4e6', color: '#f43f5e' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>পেন্ডিং ভেরিফিকেশন</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
              {summary.pendingVerifications}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} />
              <span>↑ 10% নতুন রিকোয়েস্ট</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="card">
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '14px' }}>
          ⚡ দ্রুত অ্যাক্সেস (Quick Actions)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '12px' }}>
          {[
            { label: 'Withdrawals', icon: DollarSign, tab: 'withdrawals', color: '#10b981' },
            { label: 'Recharge', icon: Smartphone, tab: 'recharge', color: '#2563eb' },
            { label: 'Ads & Tasks', icon: PlusCircle, tab: 'microjobs', color: '#8b5cf6' },
            { label: 'Create Job', icon: Briefcase, tab: 'jobposts', color: '#10b981' },
            { label: 'Products', icon: ShoppingBag, tab: 'products', color: '#f59e0b' },
            { label: 'Drive Offers', icon: Wallet, tab: 'drive', color: '#06b6d4' },
            { label: 'Users', icon: Users, tab: 'users', color: '#6366f1' },
            { label: 'Staff Roles', icon: UserCheck, tab: 'staff', color: '#ec4899' },
            { label: 'Settings', icon: FileCheck, tab: 'settings', color: '#475569' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate(act.tab)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 10px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = act.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: `${act.color}15`,
                    color: act.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Charts + Module Access Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Income Analytics */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>আয়ের সারসংক্ষেপ (Income Summary)</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>গত ৭ দিনের সামগ্রিক আয় ও খরচের তুলনা</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Deposit
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} /> Withdrawal
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> Total Balance
              </span>
            </div>
          </div>

          <div
            style={{
              height: '180px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              padding: '10px 0',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'].map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px', width: '100%', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '12px',
                      height: `${[40, 65, 80, 50, 95, 75, 110][i]}px`,
                      background: '#10b981',
                      borderRadius: '3px 3px 0 0',
                    }}
                    title="Deposit"
                  />
                  <div
                    style={{
                      width: '12px',
                      height: `${[25, 45, 30, 40, 60, 50, 70][i]}px`,
                      background: '#2563eb',
                      borderRadius: '3px 3px 0 0',
                    }}
                    title="Withdrawal"
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module Access Control */}
        <div className="card">
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>মডিউল নিয়ন্ত্রণ (System Controls)</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>লাইভ অ্যাপের ফিচারগুলো চালু বা বন্ধ করুন</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { key: 'recharge', label: 'মোবাইল রিচার্জ সিস্টেম', active: true },
              { key: 'adsAndJobs', label: 'বিজ্ঞাপন ও মাইক্রো জবস', active: true },
              { key: 'productsAndServices', label: 'পণ্য ও সেবা শপ', active: true },
              { key: 'verification', label: 'ইউজার ভেরিফিকেশন মোড', active: true },
              { key: 'referral', label: 'রেফারেল বোনাস প্রোগ্রাম', active: false },
            ].map((m) => (
              <div
                key={m.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{m.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={moduleToggles[m.key] !== undefined ? moduleToggles[m.key] : m.active}
                    onChange={() => handleToggleModule(m.key)}
                  />
                  <span className="slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Transactions + Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Recent Transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>সাম্প্রতিক লেনদেন (Recent Transactions)</h3>
            <button onClick={() => onNavigate('recharge')} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
              সব দেখুন <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ব্যবহারকারী</th>
                  <th>ধরন</th>
                  <th>পরিমাণ</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx: any) => (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.user?.name || 'User'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.phoneNumber}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">Recharge ({tx.operator})</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>৳ {tx.amount}</td>
                      <td>
                        <span
                          className={`badge ${
                            tx.status === 'successful'
                              ? 'badge-green'
                              : tx.status === 'processing'
                              ? 'badge-amber'
                              : tx.status === 'rejected'
                              ? 'badge-red'
                              : 'badge-purple'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                      কোনো লেনদেন পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>সাম্প্রতিক কার্যক্রম (Recent Activity)</h3>
            <button onClick={() => onNavigate('security')} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }}>
              ভিউ অল <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act: any) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      marginTop: '6px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{act.details}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px' }}>
                      <span>কর্তৃক: {act.userName || 'System'}</span>
                      <span>•</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>কোনো কার্যক্রম নেই</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
