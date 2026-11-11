import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Crown, UserPlus, Check, X, Eye } from 'lucide-react';
import { apiRequest } from '../api/client';

export const StaffPermissionsView: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'staff'>('manager');
  const [accountStatus, setAccountStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/users/staff');
      if (res.data) setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('/users/staff', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          accountStatus,
        }),
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            Admin & Staff Management (এডমিন ও স্টাফ ব্যবস্থাপনা)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            এখান থেকে আপনি এডমিন/স্টাফ তৈরি, পরিচালনা ও পারমিশন সেট করতে পারবেন।
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '6px' }}
        >
          <Plus size={16} /> + নতুন এডমিন/স্টাফ
        </button>
      </div>

      {/* Staff Table matching screenshot */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>নাম (Name)</th>
                <th>রোল (Role)</th>
                <th>স্ট্যাটাস (Status)</th>
                <th>লাস্ট লগইন (Last Login)</th>
                <th>অ্যাকশন (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#1e3a8a',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{s.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{s.email || s.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            s.role === 'super_admin'
                              ? '#fef3c7'
                              : s.role === 'admin'
                              ? '#dbeafe'
                              : s.role === 'manager'
                              ? '#dcfce7'
                              : '#f3e8ff',
                          color:
                            s.role === 'super_admin'
                              ? '#b45309'
                              : s.role === 'admin'
                              ? '#1d4ed8'
                              : s.role === 'manager'
                              ? '#15803d'
                              : '#7e22ce',
                          fontWeight: 700,
                        }}
                      >
                        {s.role === 'super_admin'
                          ? 'Level 1: Owner / Super Admin'
                          : s.role === 'admin'
                          ? 'Level 2: Main Admin'
                          : s.role === 'manager'
                          ? 'Level 3: Manager'
                          : 'Level 4: Staff'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-green">● Active</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : '16 Oct 2026, 11:45 AM'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          ✏️ এডিট
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role & Permission Levels 4 Cards matching screenshot */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Role & Permission Levels (দায়িত্ব ও ক্ষমতার স্তর)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Level 1 */}
          <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Crown size={20} color="#f59e0b" />
              <div>
                <strong style={{ fontSize: '14px' }}>Level 1: Owner / Super Admin</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>(শুধু আপনি)</div>
              </div>
            </div>
            <ul style={{ fontSize: '12px', color: '#475569', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Full Control (সর্বময় ক্ষমতা)</li>
              <li>সব মডিউল অ্যাক্সেস</li>
              <li>সব রিপোর্ট ও ফাইন্যান্স</li>
              <li>এডমিন ও স্টাফ নিয়ন্ত্রণ</li>
            </ul>
          </div>

          {/* Level 2 */}
          <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield size={20} color="#2563eb" />
              <div>
                <strong style={{ fontSize: '14px' }}>Level 2: Main Admin</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>(বিশ্বাস্য এডমিন)</div>
              </div>
            </div>
            <ul style={{ fontSize: '12px', color: '#475569', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>User Management</li>
              <li>Verification অনুমোদন</li>
              <li>Recharge & Finance</li>
              <li>Ads/Jobs Management</li>
            </ul>
          </div>

          {/* Level 3 */}
          <div className="card" style={{ borderTop: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <UserCheck size={20} color="#10b981" />
              <div>
                <strong style={{ fontSize: '14px' }}>Level 3: Manager</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>(বিভাগ পরিচালনা)</div>
              </div>
            </div>
            <ul style={{ fontSize: '12px', color: '#475569', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Jobs & Tasks পর্যবেক্ষণ</li>
              <li>Meeting / Group সাপোর্ট</li>
              <li>User Support টিকিট</li>
              <li>নিজস্ব বিভাগের রিপোর্ট</li>
            </ul>
          </div>

          {/* Level 4 */}
          <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <UserPlus size={20} color="#8b5cf6" />
              <div>
                <strong style={{ fontSize: '14px' }}>Level 4: Staff</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>(নির্দিষ্ট কাজ)</div>
              </div>
            </div>
            <ul style={{ fontSize: '12px', color: '#475569', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>নির্দিষ্ট কাজের দায়িত্ব</li>
              <li>Limited Access</li>
              <li>On/Off কন্টেন্ট কন্ট্রোল</li>
              <li>অন্য বিভাগ দেখা যাবে না</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Permission Matrix Table matching screenshot */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Permission Matrix (মডিউল ও পারমিশন ম্যাট্রিক্স)
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              প্রতিটি রোলের জন্য আলাদা অ্যাক্সেস পারমিশন সেট করুন
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
              ● Full Access
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
              ◐ View Only
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              ○ No Access
            </span>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>মডিউল / ফিচার (Module / Feature)</th>
                <th style={{ textAlign: 'center' }}>Owner (Level 1)</th>
                <th style={{ textAlign: 'center' }}>Main Admin (Level 2)</th>
                <th style={{ textAlign: 'center' }}>Manager (Level 3)</th>
                <th style={{ textAlign: 'center' }}>Staff (Level 4)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { module: 'Dashboard', l1: 'full', l2: 'full', l3: 'full', l4: 'view' },
                { module: 'Users Management', l1: 'full', l2: 'full', l3: 'view', l4: 'none' },
                { module: 'Wallet & Finance', l1: 'full', l2: 'full', l3: 'none', l4: 'none' },
                { module: 'Mobile Recharge (ম্যানুয়াল প্রসেসিং)', l1: 'full', l2: 'full', l3: 'full', l4: 'full' },
                { module: 'Verification (আইডি ভেরিফিকেশন)', l1: 'full', l2: 'full', l3: 'view', l4: 'none' },
                { module: 'Ads & Tasks (Micro Jobs)', l1: 'full', l2: 'full', l3: 'full', l4: 'view' },
                { module: 'Job Posts & Recruitment', l1: 'full', l2: 'full', l3: 'full', l4: 'none' },
                { module: 'Drive Offers (টেলিকম অফার)', l1: 'full', l2: 'full', l3: 'full', l4: 'view' },
                { module: 'Products & Services (Vendorship/Resell)', l1: 'full', l2: 'full', l3: 'view', l4: 'none' },
                { module: 'Staff & Permissions Management', l1: 'full', l2: 'view', l3: 'none', l4: 'none' },
                { module: 'Reports & Analytics', l1: 'full', l2: 'full', l3: 'view', l4: 'none' },
                { module: 'Settings & Security', l1: 'full', l2: 'view', l3: 'none', l4: 'none' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.module}</strong></td>
                  {['l1', 'l2', 'l3', 'l4'].map((colKey) => {
                    const val = (row as any)[colKey];
                    return (
                      <td key={colKey} style={{ textAlign: 'center' }}>
                        {val === 'full' ? (
                          <span style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>●</span>
                        ) : val === 'view' ? (
                          <span style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 'bold' }}>◐</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>○</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Staff Modal matching screenshot */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateStaff}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Add New Admin / Staff</h3>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>নাম লিখুন (Name):</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: তানিয়া ইসলাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>ইমেইল (Email):</label>
                    <input
                      type="email"
                      required
                      placeholder="staff@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>মোবাইল নাম্বার:</label>
                    <input
                      type="text"
                      required
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>পাসওয়ার্ড:</label>
                    <input
                      type="password"
                      required
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>রোল নির্ধারণ করুন:</label>
                    <select
                      value={role}
                      onChange={(e: any) => setRole(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      <option value="admin">Level 2 - Main Admin</option>
                      <option value="manager">Level 3 - Manager</option>
                      <option value="staff">Level 4 - Staff</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
