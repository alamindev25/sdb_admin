import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, ShieldCheck, Lock, Unlock, DollarSign, Check, X, UserCheck, Clock } from 'lucide-react';
import { apiRequest } from '../api/client';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Adjustment state
  const [airAdjustment, setAirAdjustment] = useState<number>(0);
  const [walletAdjustment, setWalletAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [accountStatus, setAccountStatus] = useState<string>('active');
  const [verificationStatus, setVerificationStatus] = useState<string>('verified');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&accountStatus=${statusFilter}`;
      const res = await apiRequest(`/users/members${query}`);
      if (res.data) setUsers(res.data);

      // Also fetch un-filtered count for badge
      const allRes = await apiRequest(`/users/members`);
      if (allRes.data) setAllUsers(allRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const pendingCount = (allUsers.length > 0 ? allUsers : users).filter(
    (u) => u.accountStatus === 'pending'
  ).length;

  const handleApproveUser = async (u: any) => {
    const confirmMsg = `আপনি কি "${u.name}" (${u.phone}) এর রেজিস্ট্রেশন অনুমোদন করতে চান?\n\n• ইউজারের ওয়ালেটে ৫০ টাকা বোনাস যুক্ত হবে।\n${u.referredBy ? `• রেফারার (${u.referredBy}) এর অ্যাকাউন্টে ৫০ টাকা বোনাস যুক্ত হবে।\n` : ''}• ইউজার সাথে সাথে অ্যাপে লগইন করতে পারবেন।`;
    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await apiRequest(`/users/members/${u._id}/approve`, {
        method: 'PUT',
      });
      alert(res.message || 'গ্রাহকের অ্যাকাউন্ট সফলভাবে অনুমোদিত হয়েছে!');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'অনুমোদন ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectUser = async (u: any) => {
    if (!window.confirm(`আপনি কি "${u.name}" এর রেজিস্ট্রেশন আবেদন বাতিল করতে চান?`)) return;

    setSubmitting(true);
    try {
      const res = await apiRequest(`/users/members/${u._id}/reject`, {
        method: 'PUT',
      });
      alert(res.message || 'গ্রাহকের রেজিস্ট্রেশন বাতিল করা হয়েছে।');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'বাতিলকরণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await apiRequest(`/users/members/${selectedUser._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          accountStatus,
          verificationStatus,
          airBalanceAdjustment: airAdjustment,
          walletBalanceAdjustment: walletAdjustment,
          adjustmentReason,
        }),
      });
      setSelectedUser(null);
      setAirAdjustment(0);
      setWalletAdjustment(0);
      setAdjustmentReason('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            ব্যবহারকারী ও রেজিস্ট্রেশন অনুমোদন (User & Referral Management)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            নতুন রেজিস্ট্রেশন অনুমোদন, রেফারেল ট্র্যাকিং, অ্যাকাউন্ট স্ট্যাটাস ও ব্যালেন্স পর্যবেক্ষণ
          </p>
        </div>

        <button onClick={fetchUsers} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={15} /> রিফ্রেশ
        </button>
      </div>

      {/* Info notification box if pending registrations exist */}
      {pendingCount > 0 && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#B45309',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            <span>
              <strong>{pendingCount} জন নতুন গ্রাহক</strong> অনুমোদনের অপেক্ষায় রয়েছে। অনুমোদন করলে নতুন গ্রাহকের ওয়ালেটে ৫০ টাকা এবং রেফারারের অ্যাকাউন্টে ৫০ টাকা বোনাস যুক্ত হবে।
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="btn"
            style={{
              background: '#D97706',
              color: '#ffffff',
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            অপেক্ষমাণ তালিকা দেখুন ({pendingCount})
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: '', label: 'সকল গ্রাহক', count: allUsers.length },
            { id: 'pending', label: 'অনুমোদনের অপেক্ষায় (Pending)', count: pendingCount, highlight: true },
            { id: 'active', label: 'Active (সক্রিয়)', count: allUsers.filter((u) => u.accountStatus === 'active').length },
            { id: 'blocked', label: 'Blocked (ব্লকড)', count: allUsers.filter((u) => u.accountStatus === 'blocked').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className="btn"
              style={{
                fontSize: '12.5px',
                padding: '6px 14px',
                background:
                  statusFilter === tab.id
                    ? tab.highlight
                      ? '#d97706'
                      : '#2563eb'
                    : tab.highlight && tab.count > 0
                    ? '#fef3c7'
                    : '#f1f5f9',
                color:
                  statusFilter === tab.id
                    ? '#fff'
                    : tab.highlight && tab.count > 0
                    ? '#b45309'
                    : '#475569',
                fontWeight: 600,
                borderRadius: '8px',
                border: tab.highlight && statusFilter !== tab.id ? '1px solid #fde68a' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    background: statusFilter === tab.id ? 'rgba(255,255,255,0.25)' : tab.highlight ? '#f59e0b' : '#cbd5e1',
                    color: statusFilter === tab.id ? '#ffffff' : tab.highlight ? '#ffffff' : '#334155',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="নাম, ফোন, রেফার কোড বা UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            style={{ width: '240px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <button onClick={fetchUsers} className="btn btn-primary" style={{ padding: '6px 12px' }}>
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>গ্রাহক আইডি</th>
                <th>নাম ও যোগাযোগ</th>
                <th>রেফারেল তথ্য</th>
                <th>ওয়ালেট ব্যালেন্স</th>
                <th>স্ট্যাটাস</th>
                <th>নিবন্ধনের সময়</th>
                <th style={{ textAlign: 'center' }}>অ্যাকশন (অনুমোদন / ম্যানেজ)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    কোনো গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} style={{ backgroundColor: u.accountStatus === 'pending' ? '#fffbeb' : undefined }}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                        {u.customId}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{u.name}</strong>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{u.phone}</div>
                      {u.email && <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{u.email}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                          কোড: {u.referralCode || `REF${u.customId}`}
                        </span>
                        {u.referredBy ? (
                          <span style={{ color: '#059669', fontWeight: 600, fontSize: '10.5px' }}>
                            রেফারার: {u.referredBy}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>সরাসরি নিবন্ধন</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: '13px' }}>
                        ৳ {Number(u.walletBalance || 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        এয়ার: ৳ {Number(u.airBalance || 0).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      {u.accountStatus === 'pending' ? (
                        <span
                          className="badge"
                          style={{
                            background: '#FEF3C7',
                            color: '#B45309',
                            border: '1px solid #F59E0B',
                            fontWeight: 700,
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Clock size={11} /> অপেক্ষমাণ (Pending)
                        </span>
                      ) : u.accountStatus === 'active' ? (
                        <span className="badge badge-green" style={{ fontSize: '11px' }}>
                          Active (সক্রিয়)
                        </span>
                      ) : u.accountStatus === 'rejected' ? (
                        <span className="badge badge-red" style={{ fontSize: '11px' }}>
                          বাতিলকৃত
                        </span>
                      ) : (
                        <span className="badge badge-red" style={{ fontSize: '11px' }}>
                          {u.accountStatus}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {u.accountStatus === 'pending' ? (
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleApproveUser(u)}
                            disabled={submitting}
                            className="btn"
                            style={{
                              padding: '5px 12px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="অনুমোদন করুন - ইউজারের ওয়ালেটে ৫০ টাকা এবং রেফারারের অ্যাকাউন্টে ৫০ টাকা বোনাস যুক্ত হবে"
                          >
                            <Check size={13} /> অনুমোদন
                          </button>
                          <button
                            onClick={() => handleRejectUser(u)}
                            disabled={submitting}
                            className="btn"
                            style={{
                              padding: '5px 10px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              background: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title="বাতিল করুন"
                          >
                            <X size={13} /> বাতিল
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAccountStatus(u.accountStatus);
                            setVerificationStatus(u.verificationStatus || 'verified');
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          ম্যানেজ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Manage Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>গ্রাহক তথ্য ও ব্যালেন্স সমন্বয়</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>নাম: <strong>{selectedUser.name}</strong> ({selectedUser.customId})</div>
                <div>ফোন: <strong>{selectedUser.phone}</strong></div>
                <div>রেফার কোড: <strong style={{ color: '#2563eb' }}>{selectedUser.referralCode || `REF${selectedUser.customId}`}</strong></div>
                {selectedUser.referredBy && (
                  <div>রেফারার: <strong style={{ color: '#059669' }}>{selectedUser.referredBy}</strong></div>
                )}
                <div style={{ marginTop: '4px' }}>
                  বর্তমান ওয়ালেট: <strong style={{ color: '#10b981' }}>৳ {selectedUser.walletBalance}</strong> | এয়ার ব্যালেন্স: <strong style={{ color: '#2563eb' }}>৳ {selectedUser.airBalance}</strong>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>অ্যাকাউন্ট স্ট্যাটাস</label>
                <select
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="pending">Pending (অপেক্ষমাণ)</option>
                  <option value="blocked">Blocked (ব্লকড)</option>
                  <option value="rejected">Rejected (বাতিলকৃত)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>ওয়ালেট ব্যালেন্স পরিবর্তন (+ বা - লিখুন)</label>
                <input
                  type="number"
                  placeholder="যেমন: 50 বা -50"
                  value={walletAdjustment || ''}
                  onChange={(e) => setWalletAdjustment(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>এয়ার ব্যালেন্স পরিবর্তন (+ বা - লিখুন)</label>
                <input
                  type="number"
                  placeholder="যেমন: 100 বা -100"
                  value={airAdjustment || ''}
                  onChange={(e) => setAirAdjustment(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '5px' }}>সমন্বয়ের কারণ / নোট</label>
                <input
                  type="text"
                  placeholder="যেমন: বোনাস প্রদান বা জরিমানা"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setSelectedUser(null)} className="btn btn-outline">
                বাতিল
              </button>
              <button onClick={handleUpdateUser} disabled={submitting} className="btn btn-primary">
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
