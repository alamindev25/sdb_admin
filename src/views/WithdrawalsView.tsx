import React, { useState, useEffect } from 'react';
import { DollarSign, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../api/client';

export const WithdrawalsView: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalAction, setModalAction] = useState<'successful' | 'rejected'>('successful');
  const [adminTrxId, setAdminTrxId] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      let query = `?status=${statusFilter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await apiRequest(`/wallet/admin/withdrawals${query}`);
      if (res.data) {
        setWithdrawals(res.data);
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const handleUpdateStatus = async (item: any, newStatus: 'successful' | 'rejected', trxId = '', note = '') => {
    setSubmitting(true);
    try {
      const targetId = item.referenceId || item._id;
      await apiRequest(`/wallet/admin/withdrawals/${targetId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          adminTrxId: trxId || undefined,
          adminNote: note || undefined,
        }),
      });
      setSelectedRequest(null);
      setAdminTrxId('');
      setAdminNote('');
      await fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || 'উত্তোলন স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingTotal = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const paidTotal = withdrawals
    .filter((w) => w.status === 'successful')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            টাকা উত্তোলন ম্যানেজমেন্ট (Withdrawals Management)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            ব্যবহারকারীদের উপার্জিত ব্যালেন্স উত্তোলনের আবেদন যাচাই, অনুমোদন ও পেমেন্ট রেকর্ড
          </p>
        </div>

        <button onClick={fetchWithdrawals} className="btn btn-outline" style={{ display: 'flex', gap: '6px' }}>
          <RefreshCw size={15} /> রিফ্রেশ
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>পেন্ডিং উইথড্রয়াল রিকোয়েস্ট</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              ৳ {pendingTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
              {pendingCount} টি আবেদন অনুমোদনের অপেক্ষায়
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>মোট সফল পে-আউট (Paid)</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              ৳ {paidTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              পরিশোধ সম্পন্ন হয়েছে
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>মোট আবেদন সংখ্যা</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {withdrawals.length} টি
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              সকল মেথড সম্মিলিত
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: '', label: 'সকল আবেদন' },
            { id: 'pending', label: 'পেন্ডিং (Pending)' },
            { id: 'successful', label: 'পেমেন্ট সফল (Paid)' },
            { id: 'rejected', label: 'বাতিলকৃত (Rejected)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className="btn"
              style={{
                fontSize: '12.5px',
                padding: '6px 14px',
                background: statusFilter === tab.id ? '#2563eb' : '#f1f5f9',
                color: statusFilter === tab.id ? '#fff' : '#475569',
                fontWeight: statusFilter === tab.id ? 600 : 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="নম্বর, TrxID বা নাম লিখুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWithdrawals()}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              width: '230px',
              fontFamily: 'inherit',
            }}
          />
          <button onClick={fetchWithdrawals} className="btn btn-primary" style={{ padding: '6px 12px' }}>
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>রেফারেন্স আইডি</th>
                <th>গ্রাহক তথ্য</th>
                <th>পেমেন্ট মেথড</th>
                <th>গ্রহীতার নম্বর</th>
                <th>পরিমাণ</th>
                <th>স্ট্যাটাস</th>
                <th>আবেদনের সময়</th>
                <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    উইথড্রয়াল ডেটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    কোনো উত্তোলনের আবেদন পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const method = (w.paymentMethod || 'bkash').toLowerCase();
                  const isPending = w.status === 'pending';
                  const isSuccess = w.status === 'successful';
                  const isRejected = w.status === 'rejected';

                  return (
                    <tr key={w._id || w.referenceId}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                          {w.referenceId || w._id}
                        </span>
                        {w.adminTrxId && (
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                            Trx: {w.adminTrxId}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          <span>{w.user?.name || w.userName || 'amin'}</span>
                          {(w.role === 'vendor' || (w.referenceId && w.referenceId.startsWith('VWD-'))) && (
                            <span style={{ marginLeft: '6px', fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ভেন্ডর
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {w.user?.customId || w.customId || 'UID10028'} • {w.user?.phone || w.userPhone || ''}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            fontSize: '11px',
                            background:
                              method === 'bkash'
                                ? '#fce7f3'
                                : method === 'nagad'
                                ? '#ffedd5'
                                : '#ede9fe',
                            color:
                              method === 'bkash'
                                ? '#be185d'
                                : method === 'nagad'
                                ? '#c2410c'
                                : '#6d28d9',
                          }}
                        >
                          {method}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14px', letterSpacing: '0.3px', color: '#0f172a' }}>
                          {w.accountNumber}
                        </strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {w.accountType === 'agent' ? 'এজেন্ট অ্যাকাউন্ট' : 'পার্সোনাল অ্যাকাউন্ট'}
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                          ৳ {w.amount}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isSuccess
                              ? 'badge-green'
                              : isPending
                              ? 'badge-amber'
                              : isRejected
                              ? 'badge-red'
                              : 'badge-blue'
                          }`}
                        >
                          {isSuccess ? 'পেমেন্ট সফল' : isPending ? 'পেন্ডিং' : isRejected ? 'বাতিল' : w.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(w.createdAt || Date.now()).toLocaleDateString('bn-BD')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(w.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setSelectedRequest(w);
                                setModalAction('successful');
                                setAdminTrxId('');
                                setAdminNote('');
                              }}
                              className="btn"
                              style={{
                                background: '#10b981',
                                color: '#fff',
                                fontSize: '12px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              ✓ অনুমোদন (Approve)
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(w);
                                setModalAction('rejected');
                                setAdminTrxId('');
                                setAdminNote('');
                              }}
                              className="btn"
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                fontSize: '12px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              ✕ বাতিল
                            </button>
                          </div>
                        ) : isSuccess ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> পরিশোধিত
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                            <XCircle size={14} /> বাতিলকৃত
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Approval Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {modalAction === 'successful' ? 'উইথড্রয়াল পেমেন্ট অনুমোদন' : 'উইথড্রয়াল বাতিল ও রিফান্ড'}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Request Details Box */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>গ্রাহকের নাম:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRequest.user?.name || selectedRequest.userName || 'amin'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>মেথড ও নম্বর:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                    {(selectedRequest.paymentMethod || 'bkash').toUpperCase()} - {selectedRequest.accountNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>উত্তোলনের পরিমাণ:</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                    ৳ {selectedRequest.amount}
                  </span>
                </div>
              </div>

              {modalAction === 'successful' ? (
                <>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      পেমেন্ট TrxID (যেমন bKash / Nagad TrxID):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: 9J382K19LP"
                      value={adminTrxId}
                      onChange={(e) => setAdminTrxId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      অ্যাডমিন নোট (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: সফলভাবে টাকা পাঠানো হয়েছে"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '6px' }}>
                  ⚠️ আবেদনটি বাতিল করলে গ্রাহকের ওয়ালেটে ৳ {selectedRequest.amount} টাকা তাৎক্ষণিক ফেরত (Refund) প্রদান করা হবে।
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest, modalAction, adminTrxId, adminNote)}
                disabled={submitting}
                className="btn"
                style={{
                  fontSize: '13px',
                  padding: '6px 16px',
                  background: modalAction === 'successful' ? '#10b981' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'প্রসেসিং হচ্ছে...' : modalAction === 'successful' ? '✓ পেমেন্ট নিশ্চিত করুন' : '✕ বাতিল নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
