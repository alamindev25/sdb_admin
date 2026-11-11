import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, CheckCircle, XCircle, Clock, FileText, Check, ExternalLink, Trash2, Globe, Share2, ChevronDown, ChevronUp, Eye, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const MicroJobsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendor_tasks' | 'user_submissions' | 'all_jobs'>('vendor_tasks');
  const [jobs, setJobs] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [vendorTaskFilter, setVendorTaskFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [allJobsFilter, setAllJobsFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Page Like & Follow');
  const [platform, setPlatform] = useState('Facebook');
  const [targetLink, setTargetLink] = useState('');
  const [description, setDescription] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(1.5);
  const [workers, setWorkers] = useState<number>(100);
  const [proofRequirements, setProofRequirements] = useState('Screenshot (স্ক্রিনশট)');
  const [reviewSystem, setReviewSystem] = useState('Manual Review (ম্যানুয়াল যাচাই)');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const platforms = [
    { name: 'Facebook', color: '#1877F2' },
    { name: 'TikTok', color: '#000000' },
    { name: 'YouTube', color: '#FF0000' },
    { name: 'Instagram', color: '#E1306C' },
    { name: 'Telegram', color: '#229ED9' },
    { name: 'Website', color: '#0D9488' },
    { name: 'Other', color: '#64748B' },
  ];

  const categories = [
    'Page Like & Follow',
    'Channel Subscribe & Watch',
    'App Download & Review',
    'Sign Up & Registration',
    'Social Share & Comments',
    'Telegram Join & React',
    'Website Visit & Click',
    'Typing & Data Entry',
    'Other Tasks',
  ];

  const fetchJobs = async () => {
    try {
      const res = await apiRequest('/microjobs?active=false');
      if (res.data) setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await apiRequest('/microjobs/admin/submissions');
      if (res.data) setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchJobs(), fetchSubmissions()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const instructions = instructionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const totalReward = workers * rewardAmount;

      await apiRequest('/microjobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          platform,
          targetLink: targetLink.trim(),
          description,
          instructions: instructions.length > 0 ? instructions : [description],
          rewardAmount,
          maxSubmissions: workers,
          totalReward,
          proofRequirements,
          reviewSystem,
          isActive: true,
        }),
      });

      setShowCreateModal(false);
      setTitle('');
      setTargetLink('');
      setDescription('');
      setInstructionsText('');
      setRewardAmount(1.5);
      setWorkers(100);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to create micro job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveJob = async (job: any) => {
    try {
      await apiRequest(`/microjobs/${job._id}/approve`, {
        method: 'PUT',
      });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to approve job');
    }
  };

  const handleRejectJob = async (job: any) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই টাস্কটি বাতিল করতে চান?')) return;
    try {
      await apiRequest(`/microjobs/${job._id}/reject`, {
        method: 'PUT',
      });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to reject job');
    }
  };

  const handleToggleJobStatus = async (job: any) => {
    try {
      await apiRequest(`/microjobs/${job._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই টাস্কটি মুছে ফেলতে চান?')) return;
    try {
      await apiRequest(`/microjobs/${id}`, {
        method: 'DELETE',
      });
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleReviewSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      await apiRequest(`/microjobs/admin/submissions/${selectedSubmission._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminNote }),
      });
      setSelectedSubmission(null);
      setAdminNote('');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to review submission');
    } finally {
      setSubmitting(false);
    }
  };

  const getJobSubmissions = (job: any) => {
    const jId = job._id || job.id;
    return submissions.filter(
      (s) =>
        s.job?._id === jId ||
        s.job?.id === jId ||
        s.job?._id?.toString() === jId?.toString() ||
        (s.job?.title && s.job.title === job.title)
    );
  };

  const pendingVendorTasksCount = jobs.filter((j) => j.approvalStatus === 'pending').length;
  const pendingUserSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

  const handleDirectApproveSubmission = async (submissionId: string) => {
    setSubmitting(true);
    try {
      await apiRequest(`/microjobs/admin/submissions/${submissionId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved', adminNote: 'Approved directly from submission table' }),
      });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectRejectSubmission = async (submissionId: string) => {
    const reason = window.prompt('টাস্ক প্রুফ বাতিলের কারণ লিখুন (ঐচ্ছিক):', 'প্রমাণ যথাযথ নয়');
    if (reason === null) return;
    setSubmitting(true);
    try {
      await apiRequest(`/microjobs/admin/submissions/${submissionId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected', adminNote: reason || 'Rejected by Admin' }),
      });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            মাইক্রো জব ও টাস্ক ম্যানেজমেন্ট (Micro Jobs & Tasks)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            ভেন্ডরদের টাস্ক অনুমোদন এবং গ্রাহকদের জমা দেওয়া প্রুফ ভেরিফিকেশন ও পে-আউট সেন্টার
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={loadAllData}
            className="btn btn-secondary"
            style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px' }}
            title="রিফ্রেশ করুন"
          >
            🔄 রিফ্রেশ
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <Plus size={16} /> নতুন টাস্ক তৈরি করুন
          </button>
        </div>
      </div>

      {/* Separate Primary Tabs: Vendor Task Approvals vs User Proof Submissions vs All Jobs */}
      <div className="card" style={{ padding: '10px 16px', display: 'flex', gap: '10px', flexWrap: 'wrap', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('vendor_tasks')}
          className="btn"
          style={{
            background: activeTab === 'vendor_tasks' ? '#2563eb' : '#f8fafc',
            color: activeTab === 'vendor_tasks' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '13.5px',
            padding: '10px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: activeTab === 'vendor_tasks' ? 'none' : '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
        >
          <span>📌 ১. ভেন্ডরদের টাস্ক অনুমোদন</span>
          {pendingVendorTasksCount > 0 && (
            <span
              style={{
                background: activeTab === 'vendor_tasks' ? '#f59e0b' : '#d97706',
                color: '#ffffff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              {pendingVendorTasksCount} অপেক্ষমাণ
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('user_submissions')}
          className="btn"
          style={{
            background: activeTab === 'user_submissions' ? '#2563eb' : '#f8fafc',
            color: activeTab === 'user_submissions' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '13.5px',
            padding: '10px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: activeTab === 'user_submissions' ? 'none' : '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
        >
          <span>📥 ২. ইউজারদের জমা দেওয়া প্রুফ অনুমোদন</span>
          {pendingUserSubmissionsCount > 0 && (
            <span
              style={{
                background: activeTab === 'user_submissions' ? '#f59e0b' : '#d97706',
                color: '#ffffff',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              {pendingUserSubmissionsCount} অপেক্ষমাণ
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all_jobs')}
          className="btn"
          style={{
            background: activeTab === 'all_jobs' ? '#2563eb' : '#f8fafc',
            color: activeTab === 'all_jobs' ? '#ffffff' : '#334155',
            fontWeight: 700,
            fontSize: '13.5px',
            padding: '10px 18px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: activeTab === 'all_jobs' ? 'none' : '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
        >
          <span>📋 ৩. সকল টাস্কের সার্বিক তালিকা ({jobs.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* OPTION 1: VENDOR TASKS APPROVAL ONLY                         */}
      {/* ============================================================ */}
      {activeTab === 'vendor_tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#1e40af' }}>
            💡 <strong>ভেন্ডরদের টাস্ক অনুমোদন সেন্টার:</strong> ভেন্ডর ও ব্যবহারকারীদের তৈরি করা নতুন টাস্ক এখানে রিভিউ করুন। 'অনুমোদন' বাটনে চাপ দিলে টাস্কটি মোবাইল অ্যাপে সবার জন্য লাইভ ও উন্মুক্ত হবে।
          </div>

          {/* Quick Sub-Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setVendorTaskFilter('pending')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: vendorTaskFilter === 'pending' ? '#d97706' : '#fffbeb',
                color: vendorTaskFilter === 'pending' ? '#ffffff' : '#b45309',
                border: '1px solid #fde68a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>অনুমোদনের অপেক্ষায়</span>
              <span
                style={{
                  background: vendorTaskFilter === 'pending' ? 'rgba(255,255,255,0.3)' : '#fef3c7',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {pendingVendorTasksCount}
              </span>
            </button>
            <button
              onClick={() => setVendorTaskFilter('approved')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: vendorTaskFilter === 'approved' ? '#059669' : '#ecfdf5',
                color: vendorTaskFilter === 'approved' ? '#ffffff' : '#047857',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              অনুমোদিত টাস্ক ({jobs.filter((j) => j.approvalStatus === 'approved').length})
            </button>
            <button
              onClick={() => setVendorTaskFilter('rejected')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: vendorTaskFilter === 'rejected' ? '#dc2626' : '#fee2e2',
                color: vendorTaskFilter === 'rejected' ? '#ffffff' : '#b91c1c',
                border: '1px solid #fecaca',
                cursor: 'pointer',
              }}
            >
              বাতিলকৃত টাস্ক ({jobs.filter((j) => j.approvalStatus === 'rejected').length})
            </button>
            <button
              onClick={() => setVendorTaskFilter('all')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: vendorTaskFilter === 'all' ? '#1e293b' : '#f8fafc',
                color: vendorTaskFilter === 'all' ? '#ffffff' : '#64748b',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              সব পোস্টকৃত টাস্ক ({jobs.length})
            </button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>টাস্ক শিরোনাম ও বিবরণ</th>
                    <th>প্ল্যাটফর্ম ও ক্যাটাগরি</th>
                    <th>পোস্টকারী ভেন্ডর</th>
                    <th>পারিশ্রমিক ও মোট বাজেট</th>
                    <th>কর্মী টার্গেট</th>
                    <th>অনুমোদন স্ট্যাটাস</th>
                    <th>অ্যাকশন (অনুমোদন / বাতিল)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                        লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : jobs.filter((j) => {
                      if (vendorTaskFilter === 'pending') return j.approvalStatus === 'pending';
                      if (vendorTaskFilter === 'approved') return j.approvalStatus === 'approved';
                      if (vendorTaskFilter === 'rejected') return j.approvalStatus === 'rejected';
                      return true;
                    }).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        কোনো ভেন্ডর টাস্ক পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    jobs
                      .filter((j) => {
                        if (vendorTaskFilter === 'pending') return j.approvalStatus === 'pending';
                        if (vendorTaskFilter === 'approved') return j.approvalStatus === 'approved';
                        if (vendorTaskFilter === 'rejected') return j.approvalStatus === 'rejected';
                        return true;
                      })
                      .map((j) => (
                        <tr key={j._id}>
                          <td style={{ maxWidth: '280px' }}>
                            <strong style={{ color: '#0f172a', display: 'block' }}>{j.title}</strong>
                            <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {j.description}
                            </div>
                            {j.targetLink && (
                              <a
                                href={j.targetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}
                              >
                                <ExternalLink size={12} /> লিংক ভিজিট করুন
                              </a>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  width: 'fit-content',
                                }}
                              >
                                {j.platform || 'General'}
                              </span>
                              <span className="badge badge-purple" style={{ fontSize: '10.5px', width: 'fit-content' }}>
                                {j.category}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>{j.creatorName || j.createdBy?.name || (j.creatorRole === 'vendor' ? 'ভেন্ডর' : 'ব্যবহারকারী')}</span>
                                {(j.creatorRole === 'vendor' || j.createdBy?.role === 'vendor') && (
                                  <span style={{ fontSize: '10px', background: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    ভেন্ডর
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {j.creatorPhone || j.createdBy?.phone || j.createdBy?.customId || ''}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                              ৳ {j.rewardAmount} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/ কাজ</span>
                            </div>
                            {j.totalReward ? (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                মোট বাজেট: ৳ {j.totalReward}
                              </div>
                            ) : null}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {j.maxSubmissions || 0} জন
                            </span>
                          </td>
                          <td>
                            {j.approvalStatus === 'pending' ? (
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #F59E0B',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Clock size={11} /> টাস্ক অপেক্ষমাণ (Pending)
                              </span>
                            ) : j.approvalStatus === 'rejected' ? (
                              <span className="badge badge-red" style={{ fontSize: '11px' }}>
                                বাতিলকৃত
                              </span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                                  অনুমোদিত (Live)
                                </span>
                                <button
                                  onClick={() => handleToggleJobStatus(j)}
                                  className={`badge ${j.isActive ? 'badge-green' : 'badge-red'}`}
                                  style={{ cursor: 'pointer', border: 'none', width: 'fit-content', fontSize: '10px' }}
                                  title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                                >
                                  {j.isActive ? 'Active' : 'Closed'}
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {j.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveJob(j)}
                                    className="btn"
                                    style={{
                                      padding: '6px 10px',
                                      background: '#10B981',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                    title="টাস্কটি অনুমোদন ও লাইভ করুন"
                                  >
                                    <Check size={13} /> অনুমোদন
                                  </button>
                                  <button
                                    onClick={() => handleRejectJob(j)}
                                    className="btn"
                                    style={{
                                      padding: '6px 10px',
                                      background: '#FEE2E2',
                                      color: '#B91C1C',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                    title="টাস্কটি বাতিল করুন"
                                  >
                                    <XCircle size={13} /> বাতিল
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteJob(j._id)}
                                className="btn"
                                style={{
                                  padding: '6px 8px',
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                                title="টাস্ক মুছুন"
                              >
                                <Trash2 size={14} />
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
        </div>
      )}

      {/* ============================================================ */}
      {/* OPTION 2: USER COMPLETED PROOFS APPROVAL ONLY                */}
      {/* ============================================================ */}
      {activeTab === 'user_submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#065f46' }}>
            💡 <strong>ইউজারদের কাজের প্রমাণ ও অর্থ অনুমোদন সেন্টার:</strong> ব্যবহারকারীরা কাজ সম্পন্ন করে যে প্রুফ ও স্ক্রিনশট জমা দিয়েছেন তা যাচাই করুন। 'অনুমোদন ও রিওয়ার্ড জমা' বাটনে চাপ দিলে ইউজারের ওয়ালেটে স্বয়ংক্রিয়ভাবে অর্থ জমা হয়ে যাবে।
          </div>

          {/* Submissions Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSubmissionFilterStatus('pending')}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: submissionFilterStatus === 'pending' ? '#d97706' : '#fef3c7',
                  color: submissionFilterStatus === 'pending' ? '#ffffff' : '#b45309',
                  border: '1px solid #fde68a',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                অনুমোদনের অপেক্ষায় ({pendingUserSubmissionsCount})
              </button>
              <button
                onClick={() => setSubmissionFilterStatus('approved')}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: submissionFilterStatus === 'approved' ? '#16a34a' : '#dcfce7',
                  color: submissionFilterStatus === 'approved' ? '#ffffff' : '#15803d',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                অনুমোদিত ও পেইড ({submissions.filter((s) => s.status === 'approved').length})
              </button>
              <button
                onClick={() => setSubmissionFilterStatus('rejected')}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: submissionFilterStatus === 'rejected' ? '#dc2626' : '#fee2e2',
                  color: submissionFilterStatus === 'rejected' ? '#ffffff' : '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                বাতিলকৃত প্রুফ ({submissions.filter((s) => s.status === 'rejected').length})
              </button>
              <button
                onClick={() => setSubmissionFilterStatus('all')}
                className="btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: submissionFilterStatus === 'all' ? '#0f172a' : '#f1f5f9',
                  color: submissionFilterStatus === 'all' ? '#ffffff' : '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                সকল জমা দেওয়া প্রুফ ({submissions.length})
              </button>
            </div>

            {selectedJobFilter !== 'all' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600 }}>ফিল্টার সক্রিয়</span>
                <button
                  onClick={() => setSelectedJobFilter('all')}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11.5px', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕ ফিল্টার মুছুন
                </button>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>টাস্কের নাম</th>
                    <th>কর্মী / ব্যবহারকারী</th>
                    <th>জমা দেওয়া প্রমাণ (Proof বিবরণ)</th>
                    <th>সংযুক্ত ফাইল</th>
                    <th>রিওয়ার্ড</th>
                    <th>স্ট্যাটাস</th>
                    <th>জমার তারিখ</th>
                    <th style={{ textAlign: 'center' }}>সরাসরি অনুমোদন ও অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                        লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : submissions
                      .filter((sub) => {
                        if (selectedJobFilter !== 'all') {
                          if (sub.job?._id !== selectedJobFilter && sub.job?.id !== selectedJobFilter && sub.job?.title !== selectedJobFilter) {
                            return false;
                          }
                        }
                        if (submissionFilterStatus === 'pending') return sub.status === 'pending';
                        if (submissionFilterStatus === 'approved') return sub.status === 'approved';
                        if (submissionFilterStatus === 'rejected') return sub.status === 'rejected';
                        return true;
                      }).length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        কোনো কাজের প্রুফ জমা পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    submissions
                      .filter((sub) => {
                        if (selectedJobFilter !== 'all') {
                          if (sub.job?._id !== selectedJobFilter && sub.job?.id !== selectedJobFilter && sub.job?.title !== selectedJobFilter) {
                            return false;
                          }
                        }
                        if (submissionFilterStatus === 'pending') return sub.status === 'pending';
                        if (submissionFilterStatus === 'approved') return sub.status === 'approved';
                        if (submissionFilterStatus === 'rejected') return sub.status === 'rejected';
                        return true;
                      })
                      .map((sub) => (
                        <tr key={sub._id}>
                          <td>
                            <strong style={{ color: '#0f172a', display: 'block' }}>{sub.job?.title || 'Task'}</strong>
                            {sub.job?.category && (
                              <span className="badge badge-purple" style={{ fontSize: '10px', marginTop: '2px' }}>
                                {sub.job.category}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{sub.user?.name || 'ব্যবহারকারী'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.user?.phone || sub.user?.customId || ''}</div>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                              {sub.proofDescription || 'কোনো লিখিত বিবরণ নেই'}
                            </div>
                          </td>
                          <td>
                            {sub.proofAttachmentUrl ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <img
                                  src={sub.proofAttachmentUrl}
                                  alt="Proof"
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => setSelectedSubmission(sub)}
                                  title="ক্লিক করে বড় করে দেখুন"
                                />
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0,
                                  }}
                                >
                                  ডকুমেন্ট দেখুন ↗
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>কোনো ফাইল নেই</span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: '#059669', fontSize: '13.5px' }}>৳ {sub.rewardAmount}</strong>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                sub.status === 'approved'
                                  ? 'badge-green'
                                  : sub.status === 'rejected'
                                  ? 'badge-red'
                                  : 'badge-amber'
                              }`}
                              style={{ fontWeight: 600, fontSize: '11px' }}
                            >
                              {sub.status === 'approved'
                                ? 'অনুমোদিত (পেইড)'
                                : sub.status === 'rejected'
                                ? 'বাতিল'
                                : 'অপেক্ষমাণ (Pending)'}
                            </span>
                          </td>
                          <td style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {sub.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleDirectApproveSubmission(sub._id)}
                                  disabled={submitting}
                                  className="btn"
                                  style={{
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '5px 9px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  }}
                                  title="অনুমোদন করুন ও ওয়ালেটে টাকা জমা দিন"
                                >
                                  <Check size={12} /> অনুমোদন ও রিওয়ার্ড জমা
                                </button>
                                <button
                                  onClick={() => handleDirectRejectSubmission(sub._id)}
                                  disabled={submitting}
                                  className="btn"
                                  style={{
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '5px 8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                  title="বাতিল করুন"
                                >
                                  <XCircle size={12} /> বাতিল
                                </button>
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="btn"
                                  style={{
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '5px',
                                    padding: '5px 7px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="বিস্তারিত পপআপে দেখুন"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedSubmission(sub)}
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '4px 8px', color: '#475569' }}
                              >
                                বিস্তারিত দেখুন
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
        </div>
      )}

      {/* ============================================================ */}
      {/* OPTION 3: ALL JOBS OVERVIEW & CONTROLS                       */}
      {/* ============================================================ */}
      {activeTab === 'all_jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
            💡 <strong>সার্বিক টাস্ক তালিকা:</strong> সকল চলমান ও সমাপ্ত টাস্কের পারফরম্যান্স ও অগ্রগতি দেখুন। যেকোনো টাস্কের প্রুফ দেখতে প্রুফ বাটনে ক্লিক করুন।
          </div>

          {/* All Jobs Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setAllJobsFilter('all')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: allJobsFilter === 'all' ? '#1e293b' : '#f8fafc',
                color: allJobsFilter === 'all' ? '#ffffff' : '#64748b',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              সকল কাজ ({jobs.length})
            </button>
            <button
              onClick={() => setAllJobsFilter('active')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: allJobsFilter === 'active' ? '#059669' : '#ecfdf5',
                color: allJobsFilter === 'active' ? '#ffffff' : '#047857',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              সক্রিয় কাজ ({jobs.filter((j) => j.isActive).length})
            </button>
            <button
              onClick={() => setAllJobsFilter('closed')}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                borderRadius: '8px',
                background: allJobsFilter === 'closed' ? '#dc2626' : '#fee2e2',
                color: allJobsFilter === 'closed' ? '#ffffff' : '#b91c1c',
                border: '1px solid #fecaca',
                cursor: 'pointer',
              }}
            >
              নিষ্ক্রিয় কাজ ({jobs.filter((j) => !j.isActive).length})
            </button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>টাস্ক শিরোনাম ও বিবরণ</th>
                    <th>প্ল্যাটফর্ম ও ক্যাটাগরি</th>
                    <th>পোস্টকারী</th>
                    <th>পারিশ্রমিক ও বাজেট</th>
                    <th>কর্মী সংখ্যা</th>
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
                  ) : jobs.filter((j) => {
                      if (allJobsFilter === 'active') return j.isActive;
                      if (allJobsFilter === 'closed') return !j.isActive;
                      return true;
                    }).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        কোনো টাস্ক পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    jobs
                      .filter((j) => {
                        if (allJobsFilter === 'active') return j.isActive;
                        if (allJobsFilter === 'closed') return !j.isActive;
                        return true;
                      })
                      .map((j) => {
                        const jobSubmissions = getJobSubmissions(j);
                        return (
                          <tr key={j._id}>
                            <td style={{ maxWidth: '280px' }}>
                              <strong style={{ color: '#0f172a', display: 'block' }}>{j.title}</strong>
                              <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {j.description}
                              </div>
                              {j.targetLink && (
                                <a
                                  href={j.targetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ fontSize: '11px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}
                                >
                                  <ExternalLink size={12} /> লিংক ভিজিট করুন
                                </a>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className="badge" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '11px', width: 'fit-content' }}>
                                  {j.platform || 'General'}
                                </span>
                                <span className="badge badge-purple" style={{ fontSize: '10.5px', width: 'fit-content' }}>
                                  {j.category}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1e293b' }}>
                                  {j.creatorName || j.createdBy?.name || 'অ্যাডমিন'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {j.creatorPhone || j.createdBy?.phone || ''}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                                ৳ {j.rewardAmount} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/ কাজ</span>
                              </div>
                              {j.totalReward ? (
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  মোট বাজেট: ৳ {j.totalReward}
                                </div>
                              ) : null}
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: '#334155' }}>
                                {Math.max(j.currentSubmissions || 0, jobSubmissions.length)}
                              </span>
                              {j.maxSubmissions ? ` / ${j.maxSubmissions}` : ''} জন
                              {jobSubmissions.length > 0 && (
                                <div style={{ marginTop: '3px' }}>
                                  <button
                                    onClick={() => {
                                      setSelectedJobFilter(j._id || j.id || j.title);
                                      setActiveTab('user_submissions');
                                    }}
                                    style={{
                                      background: '#EFF6FF',
                                      border: '1px solid #BFDBFE',
                                      color: '#2563EB',
                                      fontSize: '11px',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {jobSubmissions.length}টি প্রুফ দেখুন ↗
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span className={`badge ${j.approvalStatus === 'approved' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10.5px' }}>
                                  {j.approvalStatus === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                                </span>
                                <button
                                  onClick={() => handleToggleJobStatus(j)}
                                  className={`badge ${j.isActive ? 'badge-green' : 'badge-red'}`}
                                  style={{ cursor: 'pointer', border: 'none', width: 'fit-content', fontSize: '10px' }}
                                  title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                                >
                                  {j.isActive ? 'Active' : 'Closed'}
                                </button>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleDeleteJob(j._id)}
                                  className="btn"
                                  style={{
                                    padding: '6px 8px',
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                  title="টাস্ক মুছুন"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleCreateJob}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>নতুন মাইক্রো জব / টাস্ক তৈরি করুন</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Platform */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>প্ল্যাটফর্ম নির্বাচন করুন:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {platforms.map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setPlatform(p.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: platform === p.name ? `2px solid ${p.color}` : '1px solid #cbd5e1',
                          background: platform === p.name ? '#f0fdf4' : '#fff',
                          color: platform === p.name ? p.color : '#475569',
                          fontWeight: platform === p.name ? 700 : 500,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>ক্যাটাগরি:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>টার্গেট লিংক (URL):</label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/page..."
                      value={targetLink}
                      onChange={(e) => setTargetLink(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>টাস্কের শিরোনাম:</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Facebook Page Like & Follow"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>টাস্কের বিবরণ:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="টাস্কটি সম্পর্কে বিস্তারিত লিখুন..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>ধাপ বা নির্দেশনা (প্রতি লাইনে একটি ধাপ):</label>
                  <textarea
                    rows={2}
                    placeholder="১. নির্দিষ্ট পেজে যান&#10;২. লাইক ও ফলো করুন&#10;৩. স্ক্রিনশট দিন"
                    value={instructionsText}
                    onChange={(e) => setInstructionsText(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>কর্মী সংখ্যা:</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={workers}
                      onChange={(e) => setWorkers(Math.max(1, Number(e.target.value)))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>প্রতি কাজের টাকা (৳):</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0.01}
                      required
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>মোট বাজেট (৳):</label>
                    <div style={{ padding: '8px 10px', background: '#f1f5f9', borderRadius: '6px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                      ৳ {(workers * rewardAmount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>প্রমাণ গ্রহণের মাধ্যম:</label>
                    <select
                      value={proofRequirements}
                      onChange={(e) => setProofRequirements(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Screenshot (স্ক্রিনশট)">Screenshot (স্ক্রিনশট)</option>
                      <option value="Text Proof (লিংক / আইডি)">Text Proof (লিংক / আইডি)</option>
                      <option value="Screenshot + Text (স্ক্রিনশট ও টেক্সট)">Screenshot + Text (উভয়ই)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>রিভিউ সিস্টেম:</label>
                    <select
                      value={reviewSystem}
                      onChange={(e) => setReviewSystem(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Manual Review (ম্যানুয়াল যাচাই)">Manual Review (ম্যানুয়াল যাচাই)</option>
                      <option value="Automatic Verification (অটো ভেরিফিকেশন)">Automatic Verification (অটো)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'প্রকাশ হচ্ছে...' : 'টাস্ক প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>কাজের প্রমাণ রিভিউ ও অর্থ অনুমোদন</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div>টাস্ক: <strong>{selectedSubmission.job?.title}</strong></div>
                <div>গ্রাহক: <strong>{selectedSubmission.user?.name} ({selectedSubmission.user?.phone})</strong></div>
                <div>পুরস্কার: <strong style={{ color: '#10b981', fontSize: '15px' }}>৳ {selectedSubmission.rewardAmount}</strong></div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>গ্রাহকের জমা দেওয়া প্রমাণ:</label>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.proofDescription || 'কোনো লিখিত বিবরণ নেই'}
                </div>
              </div>

              {selectedSubmission.proofAttachmentUrl ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      📎 আপলোডকৃত ডকুমেন্ট / স্ক্রিনশট:
                    </label>
                    <a
                      href={selectedSubmission.proofAttachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      বড় করে দেখুন ↗
                    </a>
                  </div>
                  <div
                    style={{
                      maxHeight: '260px',
                      overflow: 'auto',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      padding: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={selectedSubmission.proofAttachmentUrl}
                      alt="Proof Attachment"
                      style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                  কোনো ফাইল বা স্ক্রিনশট সংযুক্ত নেই
                </div>
              )}

              {selectedSubmission.status === 'pending' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>অ্যাডমিন নোট (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    placeholder="যেমন: প্রমাণ যথাযথ যাচাই করা হয়েছে"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              )}

              <div style={{ fontSize: '12.5px', color: '#059669', background: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                💡 <strong>নোট:</strong> {selectedSubmission.status === 'approved' ? 'এই টাস্কটি ইতিমধ্যে অনুমোদিত এবং ব্যবহারকারীর ওয়ালেটে অর্থ যোগ হয়েছে।' : `'অনুমোদন (Approve)' বাটনে ক্লিক করলে গ্রাহকের ওয়ালেট ব্যালেন্সে স্বয়ংক্রিয়ভাবে ৳ ${selectedSubmission.rewardAmount} যোগ হয়ে যাবে।`}
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {selectedSubmission.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReviewSubmission('rejected')}
                    className="btn btn-danger"
                  >
                    বাতিল করুন (Reject)
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReviewSubmission('approved')}
                    className="btn btn-success"
                  >
                    অনুমোদন ও রিওয়ার্ড জমা দিন (Approve)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-secondary"
                >
                  বন্ধ করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
