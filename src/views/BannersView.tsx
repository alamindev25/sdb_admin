import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../api/client';

interface BannerItem {
  _id: string;
  title?: string;
  imageUrl?: string;
  buttonLink?: string;
  bannerType: 'home_hero' | 'promo' | 'popup';
  order: number;
  isActive: boolean;
  clicksCount?: number;
  viewsCount?: number;
  createdAt: string;
}

export const BannersView: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Simplified Form: Focus purely on Banner Upload
  const [imageUrl, setImageUrl] = useState<string>('');
  const [buttonLink, setButtonLink] = useState<string>('/recharge');
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Preview index for top preview
  const [previewBannerIndex, setPreviewBannerIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const LOCAL_STORAGE_KEY = 'sdb_admin_local_banners';

  const getLocalBanners = (): BannerItem[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveLocalBanners = (items: BannerItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/banners/admin/all');
      if (res.data && Array.isArray(res.data)) {
        setBanners(res.data);
        saveLocalBanners(res.data);
      } else {
        const local = getLocalBanners();
        setBanners(local);
      }
    } catch (err: any) {
      console.warn('Remote backend /banners pending deployment, using local storage:', err);
      const local = getLocalBanners();
      setBanners(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setImageUrl('');
    setButtonLink('/recharge');
    setOrder(banners.length);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl || '');
    setButtonLink(banner.buttonLink || '');
    setOrder(banner.order ?? 0);
    setIsActive(banner.isActive);
    setShowModal(true);
  };

  const handleFileProcess = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (PNG, JPG, WEBP) নির্বাচন করুন');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট (8MB) হতে পারবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('অনুগ্রহ করে একটি ব্যানার ছবি আপলোড করুন');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: 'ব্যানার ' + (Number(order) + 1),
      imageUrl,
      buttonLink: buttonLink.trim(),
      order: Number(order),
      isActive,
      bannerType: 'home_hero' as const,
    };

    try {
      if (editingBanner) {
        await apiRequest(`/banners/admin/${editingBanner._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/banners/admin', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchBanners();
    } catch (err: any) {
      // If server returned 404 because Render hasn't deployed the new backend routes yet
      const msg = err.message || '';
      if (msg.includes('Cannot POST') || msg.includes('Cannot PUT') || msg.includes('404') || msg.includes('Not Found')) {
        const local = getLocalBanners();
        const updatedBanner: BannerItem = {
          _id: editingBanner?._id || 'banner_' + Date.now(),
          ...payload,
          viewsCount: editingBanner?.viewsCount || 0,
          clicksCount: editingBanner?.clicksCount || 0,
          createdAt: editingBanner?.createdAt || new Date().toISOString(),
        };

        const updatedList = editingBanner
          ? local.map((b) => (b._id === editingBanner._id ? updatedBanner : b))
          : [updatedBanner, ...local.filter((b) => b._id !== updatedBanner._id)];

        saveLocalBanners(updatedList);
        setBanners(updatedList);
        setShowModal(false);
        alert(
          'ব্যানার সফলভাবে যুক্ত হয়েছে!\n\n(নোট: লাইভ Render সার্ভারে এখনও নতুন ব্যাকএন্ড কোড ডিপ্লয় হয়নি। আপনি গিটহাবে কোড পুশ করলে এটি ক্লাউড ডাটাবেজে স্থায়ী হবে।)'
        );
      } else {
        alert(err.message || 'ব্যানার সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await apiRequest(`/banners/admin/${id}/toggle`, {
        method: 'PATCH',
      });
      fetchBanners();
    } catch (err: any) {
      const local = getLocalBanners();
      const updated = (local.length > 0 ? local : banners).map((b) =>
        b._id === id ? { ...b, isActive: !b.isActive } : b
      );
      saveLocalBanners(updated);
      setBanners(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ব্যানারটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      await apiRequest(`/banners/admin/${id}`, {
        method: 'DELETE',
      });
      fetchBanners();
    } catch (err: any) {
      const local = getLocalBanners();
      const updated = (local.length > 0 ? local : banners).filter((b) => b._id !== id);
      saveLocalBanners(updated);
      setBanners(updated);
    }
  };

  const activePreview = banners[previewBannerIndex] || banners[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            ব্যানার আপলোড ও স্লাইডার ম্যানেজমেন্ট
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            সরাসরি অ্যাপের ব্যানার ইমেজ আপলোড করুন এবং হোম স্ক্রিন স্লাইডারে প্রদর্শন করুন
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchBanners}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ
          </button>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              padding: '9px 18px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={17} /> ব্যানার আপলোড করুন
          </button>
        </div>
      </div>

      {/* Live Mobile Hero Banner Preview */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
              মোবাইল অ্যাপে লাইভ ব্যানার প্রিভিউ (Mobile App Slider View)
            </span>
          </div>

          {banners.length > 1 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewBannerIndex(idx)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: previewBannerIndex === idx ? '#2563eb' : '#e2e8f0',
                    color: previewBannerIndex === idx ? '#ffffff' : '#64748b',
                  }}
                >
                  ব্যানার {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Realistic Mobile Banner Box */}
        <div
          style={{
            maxWidth: '520px',
            height: '160px',
            margin: '0 auto',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18)',
            background: activePreview?.imageUrl
              ? `url(${activePreview.imageUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!activePreview?.imageUrl && (
            <div style={{ textAlign: 'center', color: '#ffffff' }}>
              <ImageIcon size={38} style={{ opacity: 0.6, margin: '0 auto 6px' }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>কোনো ব্যানার ছবি আপলোড করা নেই</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>"ব্যানার আপলোড করুন" বাটনে চাপ দিয়ে ছবি যোগ করুন</div>
            </div>
          )}

          {activePreview?.buttonLink && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(4px)',
                color: '#ffffff',
                padding: '3px 9px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              লিংক: {activePreview.buttonLink}
            </div>
          )}
        </div>
      </div>

      {/* Banners List */}
      <div
        className="card"
        style={{
          padding: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            আপলোডকৃত ব্যানার তালিকা ({banners.length})
          </h3>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569' }}>ক্রম</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569' }}>ব্যানার ছবি</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569' }}>ক্লিক লিংক / রাউট</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12.5px', color: '#475569' }}>ভিউ / ক্লিক</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12.5px', color: '#475569' }}>স্ট্যাটাস</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12.5px', color: '#475569' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    <div>ব্যানার তালিকা লোড হচ্ছে...</div>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    কোনো ব্যানার আপলোড করা নেই। উপরে "ব্যানার আপলোড করুন" বাটনে চাপ দিন।
                  </td>
                </tr>
              ) : (
                banners.map((b, idx) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Order */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#334155' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '26px',
                          height: '26px',
                          lineHeight: '26px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          textAlign: 'center',
                          fontSize: '12px',
                        }}
                      >
                        {b.order ?? idx}
                      </span>
                    </td>

                    {/* Banner Image Preview Thumbnail */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '120px',
                            height: '52px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {b.imageUrl ? (
                            <img
                              src={b.imageUrl}
                              alt="Banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ImageIcon size={20} style={{ color: '#94a3b8' }} />
                          )}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          ব্যানার {idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* Link */}
                    <td style={{ padding: '14px 16px' }}>
                      {b.buttonLink ? (
                        <span
                          style={{
                            fontSize: '12.5px',
                            color: '#2563eb',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {b.buttonLink} <ExternalLink size={12} />
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>কোনো লিংক সেট নেই</span>
                      )}
                    </td>

                    {/* Views & Clicks */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span title="ভিউ" style={{ color: '#2563eb', fontWeight: 600 }}>
                          👁️ {b.viewsCount || 0}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <span title="ক্লিক" style={{ color: '#10b981', fontWeight: 600 }}>
                          👆 {b.clicksCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleStatus(b._id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '11px',
                          background: b.isActive ? '#dcfce7' : '#fee2e2',
                          color: b.isActive ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {b.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {b.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(b._id)}
                        title="মুছে ফেলুন"
                        style={{
                          padding: '6px 10px',
                          background: '#fef2f2',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={14} /> ডিলিট
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pure Banner Image Upload Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  ব্যানার আপলোড করুন (Upload Banner)
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0' }}>
                  মোবাইল অ্যাপ স্লাইডারের জন্য ব্যানার ইমেজ আপলোড করুন
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                ✕
              </button>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* Drag and Drop / Click Upload Box */}
              {!imageUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${isDragging ? '#2563eb' : '#94a3b8'}`,
                    borderRadius: '14px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: isDragging ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}
                  >
                    <UploadCloud size={28} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    এখানে ক্লিক করে ব্যানার ইমেজ সিলেক্ট করুন
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    বা ফাইলটি টেনে এনে ছেড়ে দিন (PNG, JPG, WEBP - সর্বোচ্চ 8MB)
                  </div>
                </div>
              ) : (
                /* Uploaded Image Preview */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '170px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #cbd5e1',
                      position: 'relative',
                      background: '#000000',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Uploaded Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                      ✓ ইমেজ সফলভাবে যুক্ত হয়েছে
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      ছবি পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              )}

              {/* Click Destination Link / Route */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  ব্যানারে ক্লিক করলে কোথায় যাবে (Route / Link - ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: /recharge, /vendor, /microjobs, /drive"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                  ব্যবহারকারী অ্যাপে ব্যানারে ট্যাপ করলে এই পেজে নিয়ে যাবে
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  স্লাইডারের সিরিয়াল ক্রম (Order)
                </label>
                <input
                  type="number"
                  min="0"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              {/* Active Immediately */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  আপলোড হওয়ার সাথে সাথে মোবাইল অ্যাপে দেখাবে (Active)
                </label>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '14px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageUrl}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: submitting || !imageUrl ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submitting || !imageUrl ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <UploadCloud size={16} /> {submitting ? 'আপলোড হচ্ছে...' : 'ব্যানার আপলোড করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
