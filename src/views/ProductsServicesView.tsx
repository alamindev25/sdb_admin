import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const ProductsServicesView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'vendor' | 'resell'>('vendor');
  const [vendorOffers, setVendorOffers] = useState<any[]>([]);
  const [vendorInquiries, setVendorInquiries] = useState<any[]>([]);
  const [resellProducts, setResellProducts] = useState<any[]>([]);
  const [resellOrders, setResellOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showVendorModal, setShowVendorModal] = useState<boolean>(false);
  const [showResellModal, setShowResellModal] = useState<boolean>(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Vendor Form
  const [vTitle, setVTitle] = useState('');
  const [vCategory, setVCategory] = useState('E-Commerce');
  const [vDescription, setVDescription] = useState('');
  const [vBenefits, setVBenefits] = useState('');
  const [vRequirements, setVRequirements] = useState('');
  const [vCommission, setVCommission] = useState('১০% - ১৫%');

  // Resell Form
  const [pTitle, setPTitle] = useState('');
  const [pCategory, setPCategory] = useState('Electronics');
  const [pDescription, setPDescription] = useState('');
  const [pWholesale, setPWholesale] = useState<number>(500);
  const [pRetail, setPRetail] = useState<number>(850);
  const [pStock, setPStock] = useState<number>(100);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [offRes, inqRes] = await Promise.all([
        apiRequest('/vendor?active=false'),
        apiRequest('/vendor/admin/inquiries'),
      ]);
      if (offRes.data) setVendorOffers(offRes.data);
      if (inqRes.data) setVendorInquiries(inqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResellData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        apiRequest('/resell?active=false'),
        apiRequest('/resell/admin/orders'),
      ]);
      if (prodRes.data) setResellProducts(prodRes.data);
      if (ordRes.data) setResellOrders(ordRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'vendor') fetchVendorData();
    else fetchResellData();
  }, [activeSection]);

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
        }),
      });
      setShowVendorModal(false);
      fetchVendorData();
    } catch (err: any) {
      alert(err.message || 'Failed to create vendor offer');
    }
  };

  const handleCreateResell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/resell', {
        method: 'POST',
        body: JSON.stringify({
          title: pTitle,
          category: pCategory,
          description: pDescription,
          wholesalePrice: pWholesale,
          suggestedRetailPrice: pRetail,
          estimatedProfit: pRetail - pWholesale,
          stock: pStock,
        }),
      });
      setShowResellModal(false);
      fetchResellData();
    } catch (err: any) {
      alert(err.message || 'Failed to create resell product');
    }
  };

  const handleUpdateInquiry = async (status: string) => {
    if (!selectedInquiry) return;
    try {
      await apiRequest(`/vendor/admin/inquiries/${selectedInquiry._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setSelectedInquiry(null);
      fetchVendorData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOrder = async (status: string) => {
    if (!selectedOrder) return;
    try {
      await apiRequest(`/resell/admin/orders/${selectedOrder._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setSelectedOrder(null);
      fetchResellData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            পণ্য ও পরিষেবা (Products & Services Management)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            ভেন্ডরশিপ অংশীদারিত্ব এবং রিসেলিং ক্যাটালগ নিয়ন্ত্রণ
          </p>
        </div>

        {activeSection === 'vendor' ? (
          <button onClick={() => setShowVendorModal(true)} className="btn btn-primary">
            <Plus size={16} /> নতুন ভেন্ডরশিপ অফার
          </button>
        ) : (
          <button onClick={() => setShowResellModal(true)} className="btn btn-primary">
            <Plus size={16} /> নতুন রিসেল প্রোডাক্ট যোগ করুন
          </button>
        )}
      </div>

      {/* Main Switch Tabs */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveSection('vendor')}
          className="btn"
          style={{
            background: activeSection === 'vendor' ? '#2563eb' : '#f1f5f9',
            color: activeSection === 'vendor' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          ভেন্ডরশিপ প্রোগ্রাম (Vendorship)
        </button>
        <button
          onClick={() => setActiveSection('resell')}
          className="btn"
          style={{
            background: activeSection === 'resell' ? '#2563eb' : '#f1f5f9',
            color: activeSection === 'resell' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          রিসেলিং প্রোডাক্টস (Reselling)
        </button>
      </div>

      {/* VENDORSHIP SECTION */}
      {activeSection === 'vendor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vendor Inquiries */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
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
                    <th>স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        কোনো আবেদন নেই
                      </td>
                    </tr>
                  ) : (
                    vendorInquiries.map((inq) => (
                      <tr key={inq._id}>
                        <td><strong>{inq.offer?.title}</strong></td>
                        <td>{inq.businessName}</td>
                        <td>
                          <div>{inq.user?.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{inq.contactPhone}</div>
                        </td>
                        <td style={{ maxWidth: '280px', fontSize: '12.5px' }}>{inq.proposalDetails}</td>
                        <td>
                          <span className={`badge ${inq.status === 'approved' ? 'badge-green' : inq.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedInquiry(inq)}
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

          {/* Vendor Offers Catalog */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              প্রকাশিত ভেন্ডর অফার সমূহ ({vendorOffers.length})
            </h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>শিরোনাম</th>
                    <th>ক্যাটাগরি</th>
                    <th>কমিশন রেট</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorOffers.map((vo) => (
                    <tr key={vo._id}>
                      <td><strong>{vo.title}</strong></td>
                      <td><span className="badge badge-purple">{vo.category}</span></td>
                      <td><strong style={{ color: '#2563eb' }}>{vo.commissionRate || 'N/A'}</strong></td>
                      <td><span className={`badge ${vo.isActive ? 'badge-green' : 'badge-red'}`}>{vo.isActive ? 'Active' : 'Archived'}</span></td>
                      <td>{new Date(vo.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESELLING SECTION */}
      {activeSection === 'resell' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Reseller Orders */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              রিসেলিং অর্ডার রিকোয়েস্ট ({resellOrders.length})
            </h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>পণ্য</th>
                    <th>রিসেলার</th>
                    <th>গ্রাহকের নাম ও মোবাইল</th>
                    <th>পরিমাণ</th>
                    <th>প্রত্যাশিত প্রফিট</th>
                    <th>স্ট্যাটাস</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {resellOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        কোনো রিসেলার অর্ডার নেই
                      </td>
                    </tr>
                  ) : (
                    resellOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td><strong>{ord.product?.title}</strong></td>
                        <td>{ord.user?.name}</td>
                        <td>
                          <div>{ord.customerName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.customerPhone}</div>
                        </td>
                        <td>{ord.quantity} পিস</td>
                        <td><strong style={{ color: '#10b981' }}>৳ {ord.resellerMarginExpected}</strong></td>
                        <td>
                          <span className={`badge ${ord.status === 'completed' ? 'badge-green' : ord.status === 'processing' ? 'badge-amber' : ord.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedOrder(ord)}
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

          {/* Resell Products Catalog */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              রিসেলিং প্রোডাক্ট ক্যাটালগ ({resellProducts.length})
            </h3>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>প্রোডাক্ট নাম</th>
                    <th>পাইকারি মূল্য</th>
                    <th>খুচরা মূল্য</th>
                    <th>আনুমানিক লাভ</th>
                    <th>স্টক</th>
                    <th>স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {resellProducts.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.title}</strong></td>
                      <td>৳ {p.wholesalePrice}</td>
                      <td>৳ {p.suggestedRetailPrice}</td>
                      <td><strong style={{ color: '#10b981' }}>৳ {p.estimatedProfit}</strong></td>
                      <td>{p.stock} টি</td>
                      <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Out of Stock'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Inquiry Review Modal */}
      {selectedInquiry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>ভেন্ডরশিপ আবেদন স্ট্যাটাস</h3>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>ব্যবসা: <strong>{selectedInquiry.businessName}</strong></div>
                <div>ফোন: <strong>{selectedInquiry.contactPhone}</strong></div>
                <div style={{ marginTop: '6px' }}>"{selectedInquiry.proposalDetails}"</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
                {['contacted', 'approved', 'rejected'].map((s) => (
                  <button key={s} onClick={() => handleUpdateInquiry(s)} className="btn btn-outline" style={{ textTransform: 'capitalize' }}>
                    Mark as {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resell Order Review Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>রিসেলিং অর্ডার স্ট্যাটাস</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>পণ্য: <strong>{selectedOrder.product?.title}</strong></div>
                <div>গ্রাহক: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})</div>
                <div>ঠিকানা: {selectedOrder.deliveryAddress}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '10px' }}>
                {['confirmed', 'processing', 'completed', 'cancelled'].map((s) => (
                  <button key={s} onClick={() => handleUpdateOrder(s)} className="btn btn-outline" style={{ textTransform: 'capitalize' }}>
                    Mark as {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Vendor Modal */}
      {showVendorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateVendor}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>নতুন ভেন্ডরশিপ অফার তৈরি</h3>
                <button type="button" onClick={() => setShowVendorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>অফার শিরোনাম:</label>
                  <input type="text" required value={vTitle} onChange={(e) => setVTitle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>ক্যাটাগরি:</label>
                  <input type="text" required value={vCategory} onChange={(e) => setVCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>বিবরণ:</label>
                  <textarea rows={3} required value={vDescription} onChange={(e) => setVDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowVendorModal(false)} className="btn btn-outline">বাতিল</button>
                <button type="submit" className="btn btn-primary">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Resell Modal */}
      {showResellModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleCreateResell}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>নতুন রিসেলিং প্রোডাক্ট যোগ করুন</h3>
                <button type="button" onClick={() => setShowResellModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>প্রোডাক্ট নাম:</label>
                  <input type="text" required value={pTitle} onChange={(e) => setPTitle(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>পাইকারি মূল্য:</label>
                    <input type="number" required value={pWholesale} onChange={(e) => setPWholesale(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>খুচরা মূল্য:</label>
                    <input type="number" required value={pRetail} onChange={(e) => setPRetail(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>স্টক সংখ্যা:</label>
                    <input type="number" required value={pStock} onChange={(e) => setPStock(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>বিবরণ:</label>
                  <textarea rows={2} required value={pDescription} onChange={(e) => setPDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowResellModal(false)} className="btn btn-outline">বাতিল</button>
                <button type="submit" className="btn btn-primary">যোগ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
