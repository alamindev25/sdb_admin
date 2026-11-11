import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, RefreshCw, CheckCircle, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const ResellingView: React.FC = () => {
  const [resellProducts, setResellProducts] = useState<any[]>([]);
  const [resellOrders, setResellOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string>('confirmed');
  const [orderNote, setOrderNote] = useState<string>('');

  // Form State
  const [pTitle, setPTitle] = useState('');
  const [pCategory, setPCategory] = useState('Electronics');
  const [pDescription, setPDescription] = useState('');
  const [pWholesale, setPWholesale] = useState<number>(500);
  const [pRetail, setPRetail] = useState<number>(850);
  const [pStock, setPStock] = useState<number>(100);
  const [pImage, setPImage] = useState('');

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
      console.error('Failed to fetch reselling data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/resell', {
        method: 'POST',
        body: JSON.stringify({
          title: pTitle,
          category: pCategory,
          description: pDescription,
          wholesalePrice: Number(pWholesale),
          suggestedRetailPrice: Number(pRetail),
          estimatedProfit: Number(pRetail) - Number(pWholesale),
          stock: Number(pStock),
          imageUrl: pImage || undefined,
        }),
      });
      setShowProductModal(false);
      setPTitle('');
      setPDescription('');
      setPImage('');
      fetchResellData();
    } catch (err: any) {
      alert(err.message || 'Failed to create resell product');
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      await apiRequest(`/resell/admin/orders/${selectedOrder._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: orderStatus,
          adminNote: orderNote || undefined,
        }),
      });
      setSelectedOrder(null);
      setOrderNote('');
      fetchResellData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            রিসেলিং শপ ম্যানেজমেন্ট (Reselling Hub & Orders)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            পণ্য ক্যাটালগ নিয়ন্ত্রণ, পাইকারি/খুচরা মূল্য ও কাস্টমার ডেলিভারি অর্ডার প্রসেসিং
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchResellData} className="btn btn-outline" style={{ display: 'flex', gap: '6px' }}>
            <RefreshCw size={15} /> রিফ্রেশ
          </button>
          <button onClick={() => setShowProductModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
            <Plus size={16} /> নতুন রিসেল প্রোডাক্ট
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>মোট রিসেল প্রোডাক্ট</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{resellProducts.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>পেন্ডিং অর্ডার</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {resellOrders.filter((o) => o.status === 'pending').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <PackageCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>ডেলিভার্ড অর্ডার</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              {resellOrders.filter((o) => o.status === 'delivered').length}
            </div>
          </div>
        </div>
      </div>

      {/* Resell Orders Queue */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          রিসেলারদের কাস্টমার অর্ডার সমূহ ({resellOrders.length})
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>পণ্য</th>
                <th>পরিমাণ</th>
                <th>কাস্টমার ও ঠিকানা</th>
                <th>রিসেলার মার্জিন</th>
                <th>তারিখ</th>
                <th>স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>লোড হচ্ছে...</td></tr>
              ) : resellOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>কোনো অর্ডার নেই</td></tr>
              ) : (
                resellOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td><strong>{ord.product?.title || 'Product'}</strong></td>
                    <td><span className="badge badge-blue">{ord.quantity} টি</span></td>
                    <td>
                      <div><strong>{ord.customerName}</strong> ({ord.customerPhone})</div>
                      <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px' }}>{ord.deliveryAddress}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>৳ {ord.resellerMarginExpected}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>বাই: {ord.user?.name}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-green' : ord.status === 'shipped' ? 'badge-blue' : ord.status === 'cancelled' ? 'badge-red' : 'badge-amber'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setOrderStatus(ord.status);
                        }}
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
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          রিসেলিং প্রোডাক্ট ক্যাটালগ ({resellProducts.length})
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>পণ্য ও ছবি</th>
                <th>ক্যাটাগরি</th>
                <th>পাইকারি মূল্য</th>
                <th>খুচরা মূল্য</th>
                <th>রিসেলার লাভ</th>
                <th>স্টক</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {resellProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingCart size={18} color="#94a3b8" />
                        </div>
                      )}
                      <div>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b', maxWidth: '240px' }}>{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{p.category}</span></td>
                  <td>৳ {p.wholesalePrice}</td>
                  <td><strong>৳ {p.suggestedRetailPrice}</strong></td>
                  <td><span style={{ color: '#10b981', fontWeight: 700 }}>৳ {p.estimatedProfit}</span></td>
                  <td>{p.stock} টি</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                      {p.isActive ? 'সক্রিয়' : 'আউট অফ স্টক'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>নতুন রিসেল প্রোডাক্ট যোগ করুন</h3>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: T900 Ultra 2 Smartwatch"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">ক্যাটাগরি</label>
                  <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="form-control">
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion & Bags">Fashion & Bags</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">প্রাথমিক স্টক (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">পাইকারি মূল্য (Wholesale ৳)</label>
                  <input
                    type="number"
                    required
                    value={pWholesale}
                    onChange={(e) => setPWholesale(Number(e.target.value))}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">খুচরা মূল্য (Retail ৳)</label>
                  <input
                    type="number"
                    required
                    value={pRetail}
                    onChange={(e) => setPRetail(Number(e.target.value))}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">পণ্যের ছবি URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">পণ্যের বিবরণ</label>
                <textarea
                  required
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  className="form-control"
                  placeholder="পণ্যের বৈশিষ্ট্য ও বিবরণ লিখুন..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary">
                  প্রোডাক্ট প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Order Modal */}
      {selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>কাস্টমার অর্ডার স্ট্যাটাস আপডেট</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>অর্ডারকৃত পণ্য</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedOrder.product?.title} ({selectedOrder.quantity} টি)</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>কাস্টমার ও ডেলিভারি ঠিকানা</div>
                <div style={{ fontSize: '13px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                  <div><strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})</div>
                  <div style={{ marginTop: '4px', color: '#475569' }}>{selectedOrder.deliveryAddress}</div>
                </div>
              </div>

              <div>
                <label className="form-label">ডেলিভারি স্ট্যাটাস</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="confirmed">নিশ্চিত করা হয়েছে (Confirmed)</option>
                  <option value="shipped">শিপমেন্টে পাঠানো হয়েছে (Shipped)</option>
                  <option value="delivered">ডেলিভার্ড ও কমপ্লিট (Delivered)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="form-label">অ্যাডমিন নোট / ট্র্যাকিং নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: রেডেক্স ট্র্যাকিং #123456"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn btn-outline">
                  বন্ধ করুন
                </button>
                <button type="button" onClick={handleUpdateOrder} className="btn btn-primary">
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
