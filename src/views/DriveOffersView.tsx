import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const DriveOffersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [operator, setOperator] = useState('grameenphone');
  const [packageDetails, setPackageDetails] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(798);
  const [offerPrice, setOfferPrice] = useState<number>(580);
  const [commissionEarned, setCommissionEarned] = useState<number>(60);
  const [eligibleRegion, setEligibleRegion] = useState('All Bangladesh');
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/drive?active=false');
      if (res.data) setOffers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/drive/admin/requests');
      if (res.data) setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    else fetchRequests();
  }, [activeTab]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest('/drive', {
        method: 'POST',
        body: JSON.stringify({
          title,
          operator,
          packageDetails,
          regularPrice,
          offerPrice,
          commissionEarned,
          eligibleRegion,
        }),
      });
      setShowCreateModal(false);
      setTitle('');
      setPackageDetails('');
      fetchOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to create drive offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReqStatus = async (status: string) => {
    if (!selectedReq) return;
    try {
      await apiRequest(`/drive/admin/requests/${selectedReq._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setSelectedReq(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            ড্রাইভ অফার ম্যানেজমেন্ট (Telecom Drive Packs)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            টেলিকম স্পেশাল ড্রাইভ প্যাক (MB/GB/Minutes) তৈরি ও সক্রিয়করণ অনুরোধ
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '6px' }}
        >
          <Plus size={16} /> নতুন ড্রাইভ অফার যোগ করুন
        </button>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('offers')}
          className="btn"
          style={{
            background: activeTab === 'offers' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'offers' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          সকল ড্রাইভ অফার তালিকা ({offers.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className="btn"
          style={{
            background: activeTab === 'requests' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'requests' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          অ্যাক্টিভেশন রিকোয়েস্ট ({requests.length})
        </button>
      </div>

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অফার শিরোনাম</th>
                  <th>অপারেটর</th>
                  <th>প্যাকেজ বিবরণ</th>
                  <th>নিয়মিত মূল্য</th>
                  <th>অফার মূল্য</th>
                  <th>কমিশন</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      কোনো ড্রাইভ অফার নেই
                    </td>
                  </tr>
                ) : (
                  offers.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <strong>{o.title}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{o.eligibleRegion}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{ textTransform: 'uppercase' }}>
                          {o.operator}
                        </span>
                      </td>
                      <td>{o.packageDetails}</td>
                      <td style={{ textDecoration: 'line-through', color: '#94a3b8' }}>৳ {o.regularPrice}</td>
                      <td>
                        <strong style={{ color: '#10b981', fontSize: '14px' }}>৳ {o.offerPrice}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#2563eb' }}>৳ {o.commissionEarned}</strong>
                      </td>
                      <td>
                        <span className={`badge ${o.isActive ? 'badge-green' : 'badge-red'}`}>
                          {o.isActive ? 'Active' : 'Unpublished'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>অফার</th>
                  <th>গ্রাহক</th>
                  <th>গ্রহীতার নম্বর</th>
                  <th>বিভাগ</th>
                  <th>মূল্য</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      কোনো রিকোয়েস্ট জমা পড়েনি
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.driveOffer?.title}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{r.driveOffer?.packageDetails}</div>
                      </td>
                      <td>
                        <div>{r.user?.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{r.user?.phone}</div>
                      </td>
                      <td>
                        <strong style={{ letterSpacing: '0.5px' }}>{r.recipientPhone}</strong>
                      </td>
                      <td>{r.division}</td>
                      <td>
                        <strong style={{ color: '#10b981' }}>৳ {r.amountPaid}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${r.status === 'successful'
                              ? 'badge-green'
                              : r.status === 'processing'
                                ? 'badge-amber'
                                : r.status === 'rejected'
                                  ? 'badge-red'
                                  : 'badge-purple'
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedReq(r)}
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          আপডেট
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateOffer}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>নতুন ড্রাইভ অফার তৈরি করুন</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>অফার নাম / শিরোনাম:</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: গ্রামীণফোন ৪০ জিবি + ৮০০ মিনিট (৩০ দিন)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>অপারেটর:</label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      <option value="grameenphone">Grameenphone</option>
                      <option value="robi">Robi</option>
                      <option value="banglalink">Banglalink</option>
                      <option value="teletalk">Teletalk</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>প্রযোজ্য বিভাগ / অঞ্চল:</label>
                    <input
                      type="text"
                      value={eligibleRegion}
                      onChange={(e) => setEligibleRegion(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>প্যাকেজ বিবরণ:</label>
                  <input
                    type="text"
                    required
                    placeholder="40GB Data + 800 Mins (30 Days)"
                    value={packageDetails}
                    onChange={(e) => setPackageDetails(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>নিয়মিত মূল্য:</label>
                    <input
                      type="number"
                      required
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>অফার মূল্য:</label>
                    <input
                      type="number"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>কমিশন:</label>
                    <input
                      type="number"
                      value={commissionEarned}
                      onChange={(e) => setCommissionEarned(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'অফার যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>ড্রাইভ অফার স্ট্যাটাস আপডেট</h3>
              <button onClick={() => setSelectedReq(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>অফার: <strong>{selectedReq.driveOffer?.title}</strong></div>
                <div>নম্বর: <strong>{selectedReq.recipientPhone}</strong> ({selectedReq.division})</div>
                <div>মূল্য: <strong style={{ color: '#10b981' }}>৳ {selectedReq.amountPaid}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'processing', label: 'Processing (প্রসেসিং)' },
                  { id: 'successful', label: 'Successful (সক্রিয় সম্পন্ন)' },
                  { id: 'rejected', label: 'Rejected (বাতিল)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleUpdateReqStatus(s.id)}
                    className="btn btn-outline"
                    style={{ fontSize: '13px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
