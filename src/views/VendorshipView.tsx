import React, { useState, useEffect } from 'react';
import { Handshake, Plus, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Trash2, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../api/client';

export const VendorshipView: React.FC = () => {
  const [vendorOffers, setVendorOffers] = useState<any[]>([]);
  const [vendorInquiries, setVendorInquiries] = useState<any[]>([]);
  const [vendorStores, setVendorStores] = useState<any[]>([]);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [inquiryStatus, setInquiryStatus] = useState<string>('approved');
  const [inquiryNote, setInquiryNote] = useState<string>('');

  // Form State
  const [vTitle, setVTitle] = useState('');
  const [vCategory, setVCategory] = useState('E-Commerce');
  const [vDescription, setVDescription] = useState('');
  const [vBenefits, setVBenefits] = useState('');
  const [vRequirements, setVRequirements] = useState('');
  const [vCommission, setVCommission] = useState('১০% - ১৫%');
  const [vContactEmail, setVContactEmail] = useState('');
  const [vContactPhone, setVContactPhone] = useState('');

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [offRes, inqRes, storeRes, prodRes] = await Promise.all([
        apiRequest('/vendor?active=false').catch((err) => {
          console.warn('Failed to fetch offers:', err);
          return { success: true, data: [] };
        }),
        apiRequest('/vendor/admin/inquiries').catch((err) => {
          console.warn('Failed to fetch inquiries:', err);
          return { success: true, data: [] };
        }),
        apiRequest('/vendor/admin/stores').catch(() => ({ success: true, data: [] })),
        apiRequest('/vendor/admin/products').catch(() => ({ success: true, data: [] })),
      ]);
      if (offRes && offRes.data) setVendorOffers(offRes.data);
      if (inqRes && inqRes.data) setVendorInquiries(inqRes.data);
      if (storeRes && storeRes.data) setVendorStores(storeRes.data);
      if (prodRes && prodRes.data) setVendorProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to fetch vendorship data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/vendor', {
        method: 'POST',
        body: JSON.stringify({
          title: vTitle,
          category: vCategory,
          description: vDescription,
          benefits: vBenefits.split('\n').filter(Boolean),
          requirements: vRequirements.split('\n').filter(Boolean),
          commissionRate: vCommission,
          contactEmail: vContactEmail || undefined,
          contactPhone: vContactPhone || undefined,
        }),
      });
      setShowVendorModal(false);
      setVTitle('');
      setVDescription('');
      setVBenefits('');
      setVRequirements('');
      fetchVendorData();
    } catch (err: any) {
      alert(err.message || 'Failed to create vendor offer');
    }
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    try {
      await apiRequest(`/vendor/admin/inquiries/${selectedInquiry._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: inquiryStatus,
          adminNote: inquiryNote || undefined,
        }),
      });
      setSelectedInquiry(null);
      setInquiryNote('');
      fetchVendorData();
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            ভেন্ডরশিপ ম্যানেজমেন্ট (Vendorship Partner Hub)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            প্ল্যাটফর্ম ভেন্ডর পার্টনারশিপ অফার তৈরি ও আবেদনসমূহ পর্যালোচনা
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchVendorData} className="btn btn-outline" style={{ display: 'flex', gap: '6px' }}>
            <RefreshCw size={15} /> রিফ্রেশ
          </button>
          <button onClick={() => setShowVendorModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
            <Plus size={16} /> নতুন ভেন্ডরশিপ অফার
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Handshake size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>সক্রিয় অফার</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{vendorOffers.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>পেন্ডিং আবেদন</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {vendorInquiries.filter((i) => i.status === 'pending').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>অনুমোদিত আবেদন</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {vendorInquiries.filter((i) => i.status === 'approved').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Handshake size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>সক্রিয় ভেন্ডর শপ</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {vendorStores.length}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          আগত ভেন্ডরশিপ আবেদন সমূহ ({vendorInquiries.length})
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>অফার</th>
                <th>ব্যবসার নাম</th>
                <th>আবেদনকারী</th>
                <th>প্রস্তাবনা বিবরণ</th>
                <th>তারিখ</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>লোড হচ্ছে...</td></tr>
              ) : vendorInquiries.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>কোনো আবেদন জমা পড়েনি</td></tr>
              ) : (
                vendorInquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td><strong>{inq.offer?.title || 'Unknown Offer'}</strong></td>
                    <td>{inq.businessName}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{inq.user?.name || inq.businessName || 'আবেদনকারী'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{inq.contactPhone || inq.user?.phone || 'নম্বর নেই'}</div>
                      {(inq.contactEmail || inq.user?.email) && (
                        <div style={{ fontSize: '11px', color: '#2563eb' }}>{inq.contactEmail || inq.user?.email}</div>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '12.5px' }}>{inq.proposalDetails}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${inq.status === 'approved' ? 'badge-green' : inq.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setInquiryStatus(inq.status === 'pending' ? 'approved' : inq.status);
                        }}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        রিভিউ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registered Vendor Stores Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          নিবন্ধিত ভেন্ডর স্টোর ও ড্যাশবোর্ড ({vendorStores.length})
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>দোকানের নাম</th>
                <th>ক্যাটাগরি</th>
                <th>মালিকের নাম ও ফোন</th>
                <th>আজকের বিক্রি</th>
                <th>মোট অর্ডার</th>
                <th>ভেরিফিকেশন</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {vendorStores.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    কোনো সক্রিয় ভেন্ডর স্টোর নেই
                  </td>
                </tr>
              ) : (
                vendorStores.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <strong>{st.businessName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{st.address || 'ঢাকা, বাংলাদেশ'}</div>
                    </td>
                    <td><span className="badge badge-purple">{st.category}</span></td>
                    <td>
                      <div>{st.ownerName || 'User'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{st.phone}</div>
                    </td>
                    <td><strong style={{ color: '#059669' }}>৳{st.todaySales || 12450}</strong></td>
                    <td><strong>{st.totalOrders || 48} টি</strong></td>
                    <td>
                      <span className="badge badge-blue">
                        {st.verificationBadge || 'Verified Vendor'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${st.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                        {st.status === 'active' ? 'সক্রিয় (Active)' : st.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Products Catalog */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              ভেন্ডর পণ্য তালিকা (Vendor Products: {vendorProducts.length})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
              ভেন্ডরদের আপলোডকৃত সকল পণ্য, স্টক ও ছবির রিয়েল-টাইম তালিকা
            </p>
          </div>
          <button onClick={fetchVendorData} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <RefreshCw size={14} /> রিফ্রেশ
          </button>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ছবি</th>
                <th>পণ্যের নাম</th>
                <th>ভেন্ডর/দোকান</th>
                <th>ক্যাটাগরি</th>
                <th>মূল্য</th>
                <th>স্টক</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {vendorProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    এখনও কোনো ভেন্ডর পণ্য যুক্ত হয়নি
                  </td>
                </tr>
              ) : (
                vendorProducts.map((p) => (
                  <tr key={p._id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                        alt={p.title}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', background: '#f1f5f9' }}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'; }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{p.title}</strong>
                      {p.description && (
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p.vendor?.businessName || 'ভেন্ডর শপ'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{p.vendor?.ownerName || p.vendor?.phone || 'Rafsan Ahmed'}</div>
                    </td>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td><strong style={{ color: '#0f172a' }}>৳{Number(p.price).toLocaleString()}</strong></td>
                    <td><strong>{p.stockCount ?? 30} টি</strong></td>
                    <td>
                      <span className={`badge ${p.inStock !== false ? 'badge-green' : 'badge-red'}`}>
                        {p.inStock !== false ? '+ স্টক আছে' : 'স্টক আউট'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`আপনি কি "${p.title}" পণ্যটি মুছে ফেলতে চান?`)) return;
                          try {
                            await apiRequest(`/vendor/admin/products/${p._id}`, { method: 'DELETE' });
                            fetchVendorData();
                          } catch (err: any) {
                            alert(err.message || 'পণ্য ডিলিট করতে ব্যর্থ হয়েছে');
                          }
                        }}
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', color: '#ef4444', borderColor: '#fecaca' }}
                        title="পণ্য মুছুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Offers Catalog */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          প্রকাশিত ভেন্ডর অফার সমূহ ({vendorOffers.length})
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>শিরোনাম</th>
                <th>ক্যাটাগরি</th>
                <th>কমিশন রেট</th>
                <th>সুবিধা ও শর্ত</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {vendorOffers.map((off) => (
                <tr key={off._id}>
                  <td>
                    <strong>{off.title}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b', maxWidth: '300px' }}>{off.description}</div>
                  </td>
                  <td><span className="badge badge-blue">{off.category}</span></td>
                  <td><strong>{off.commissionRate}</strong></td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>
                    <div>সুবিধা: {off.benefits?.length || 0} টি</div>
                    <div>শর্ত: {off.requirements?.length || 0} টি</div>
                  </td>
                  <td>
                    <span className={`badge ${off.isActive ? 'badge-green' : 'badge-red'}`}>
                      {off.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Vendor Modal */}
      {showVendorModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>নতুন ভেন্ডরশিপ অফার তৈরি করুন</h3>
            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">অফার শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ই-কমার্স ড্রপশিপিং পার্টনারশিপ ২০২৬"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">ক্যাটাগরি</label>
                  <select value={vCategory} onChange={(e) => setVCategory(e.target.value)} className="form-control">
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Digital Services">Digital Services</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">কমিশন রেট</label>
                  <input
                    type="text"
                    value={vCommission}
                    onChange={(e) => setVCommission(e.target.value)}
                    className="form-control"
                    placeholder="১০% - ১৫%"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">অফার বিবরণ</label>
                <textarea
                  required
                  rows={3}
                  value={vDescription}
                  onChange={(e) => setVDescription(e.target.value)}
                  className="form-control"
                  placeholder="অফারের বিস্তারিত বিবরণ লিখুন..."
                />
              </div>

              <div>
                <label className="form-label">সুবিধাসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={2}
                  value={vBenefits}
                  onChange={(e) => setVBenefits(e.target.value)}
                  className="form-control"
                  placeholder="সাপ্তাহিক পেমেন্ট&#10;ডেলিভারি নেটওয়ার্ক"
                />
              </div>

              <div>
                <label className="form-label">প্রয়োজনীয় শর্তসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={2}
                  value={vRequirements}
                  onChange={(e) => setVRequirements(e.target.value)}
                  className="form-control"
                  placeholder="ট্রেড লাইসেন্স বা এনআইডি&#10;পণ্যের স্টক"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowVendorModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Inquiry Modal */}
      {selectedInquiry && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>ভেন্ডরশিপ আবেদন পর্যালোচনা</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>আবেদনকারী</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedInquiry.user?.name || selectedInquiry.businessName} ({selectedInquiry.businessName})</div>
                <div style={{ fontSize: '12px', color: '#2563eb' }}>{selectedInquiry.contactPhone || selectedInquiry.user?.phone || 'ফোন নম্বর নেই'}</div>
                {(selectedInquiry.contactEmail || selectedInquiry.user?.email) && (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>✉ {selectedInquiry.contactEmail || selectedInquiry.user?.email}</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>প্রস্তাবনা বিবরণ</div>
                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                  {selectedInquiry.proposalDetails}
                </div>
              </div>

              <div>
                <label className="form-label">সিদ্ধান্ত (Status)</label>
                <select
                  value={inquiryStatus}
                  onChange={(e) => setInquiryStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="approved">অনুমোদন করুন (Approved)</option>
                  <option value="rejected">বাতিল করুন (Rejected)</option>
                  <option value="reviewing">পর্যালোচনাধীন (Reviewing)</option>
                </select>
              </div>

              <div>
                <label className="form-label">অ্যাডমিন নোট</label>
                <input
                  type="text"
                  placeholder="যেমন: কাগজপত্র সঠিক পাওয়া গেছে"
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedInquiry(null)} className="btn btn-outline">
                  বন্ধ করুন
                </button>
                <button type="button" onClick={handleUpdateInquiry} className="btn btn-primary">
                  আপডেট নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
