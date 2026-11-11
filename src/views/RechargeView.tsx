import React, { useState, useEffect } from 'react';
import { Smartphone, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const RechargeView: React.FC = () => {
  const [recharges, setRecharges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('processing');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchRecharges = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      const res = await apiRequest(`/recharge/admin/all${query}`);
      if (res.data) {
        setRecharges(res.data);
      }
    } catch (err) {
      console.error('Failed to load recharges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, [statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await apiRequest(`/recharge/${selectedRequest._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNote || `Status updated to ${newStatus} by admin`,
        }),
      });
      setSelectedRequest(null);
      setAdminNote('');
      fetchRecharges();
    } catch (err: any) {
      alert(err.message || 'Failed to update recharge status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            মোবাইল রিচার্জ ম্যানেজমেন্ট (Mobile Recharge Queue)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            ম্যানুয়াল ও অ্যাডমিন-রিভিউড রিচার্জ প্রসেসিং সেন্টার (Phase 1 Safe Settlement)
          </p>
        </div>

        <button onClick={fetchRecharges} className="btn btn-outline" style={{ display: 'flex', gap: '6px' }}>
          <RefreshCw size={15} /> রিফ্রেশ
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: '', label: 'সকল রিকোয়েস্ট' },
            { id: 'requested', label: 'পেন্ডিং (Requested)' },
            { id: 'processing', label: 'প্রসেসিং (Processing)' },
            { id: 'successful', label: 'সফল (Successful)' },
            { id: 'rejected', label: 'বাতিল (Rejected)' },
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
            placeholder="নাম্বার বা রেফারেন্স লিখুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRecharges()}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              width: '220px',
              fontFamily: 'inherit',
            }}
          />
          <button onClick={fetchRecharges} className="btn btn-primary" style={{ padding: '6px 12px' }}>
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
                <th>রেফারেন্স আইডি</th>
                <th>গ্রাহক তথ্য</th>
                <th>মোবাইল নম্বর</th>
                <th>অপারেটর</th>
                <th>পরিমাণ</th>
                <th>স্ট্যাটাস</th>
                <th>অনুরোধের সময়</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : recharges.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    কোনো রিচার্জ রিকোয়েস্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                recharges.map((rc) => (
                  <tr key={rc._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                        {rc.referenceId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{rc.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rc.user?.customId || ''}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '14px', letterSpacing: '0.3px' }}>{rc.phoneNumber}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rc.rechargeType}</div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          textTransform: 'uppercase',
                          background:
                            rc.operator === 'grameenphone'
                              ? '#dbeafe'
                              : rc.operator === 'robi'
                              ? '#fee2e2'
                              : rc.operator === 'banglalink'
                              ? '#ffedd5'
                              : '#f3e8ff',
                          color:
                            rc.operator === 'grameenphone'
                              ? '#1d4ed8'
                              : rc.operator === 'robi'
                              ? '#b91c1c'
                              : rc.operator === 'banglalink'
                              ? '#c2410c'
                              : '#7e22ce',
                        }}
                      >
                        {rc.operator}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>৳ {rc.amount}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rc.status === 'successful'
                            ? 'badge-green'
                            : rc.status === 'processing'
                            ? 'badge-amber'
                            : rc.status === 'rejected'
                            ? 'badge-red'
                            : 'badge-blue'
                        }`}
                      >
                        {rc.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(rc.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {new Date(rc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedRequest(rc);
                          setNewStatus(rc.status === 'requested' ? 'processing' : 'successful');
                          setAdminNote(rc.adminNote || '');
                        }}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        আপডেট করুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                রিচার্জ স্ট্যাটাস আপডেট করুন ({selectedRequest.referenceId})
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>গ্রাহক: <strong>{selectedRequest.user?.name}</strong></div>
                <div>মোবাইল: <strong>{selectedRequest.phoneNumber}</strong></div>
                <div>অপারেটর: <strong style={{ textTransform: 'uppercase' }}>{selectedRequest.operator}</strong></div>
                <div>পরিমাণ: <strong style={{ color: '#2563eb', fontSize: '15px' }}>৳ {selectedRequest.amount}</strong></div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  নতুন স্ট্যাটাস নির্বাচন করুন:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="requested">Requested (অনুরোধ অপেক্ষারত)</option>
                  <option value="processing">Processing (প্রক্রিয়াধীন)</option>
                  <option value="successful">Successful (সফল সম্পন্ন)</option>
                  <option value="rejected">Rejected (বাতিল ও রিফান্ড)</option>
                  <option value="failed">Failed (ব্যর্থ ও রিফান্ড)</option>
                </select>
              </div>

              {(newStatus === 'rejected' || newStatus === 'failed') && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '12.5px',
                  }}
                >
                  <AlertTriangle size={20} />
                  <span>
                    <strong>সতর্কতা:</strong> বাতিল বা ব্যর্থ করলে ব্যবহারকারীর এয়ার ব্যালেন্সে স্বয়ংক্রিয়ভাবে ৳ {selectedRequest.amount} রিফান্ড জমা হবে।
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  প্রশাসনিক নোট / ট্রানজাকশন রেফারেন্স:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Flexiload SIM-01 TxID: 89431..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedRequest(null)} className="btn btn-outline">
                বাতিল
              </button>
              <button onClick={handleUpdateStatus} disabled={submitting} className="btn btn-primary">
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
