import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, User, MapPin, DollarSign, Calendar } from 'lucide-react';
import { apiRequest } from '../api/client';

export const JobPostsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('ঢাকা');
  const [isRemote, setIsRemote] = useState(false);
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/jobposts?active=false');
      if (res.data) setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/jobposts/admin/applications');
      if (res.data) setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs();
    else fetchApplications();
  }, [activeTab]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requirements = requirementsText.split('\n').map((s) => s.trim()).filter(Boolean);
      await apiRequest('/jobposts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          company,
          location,
          isRemote,
          salaryRange,
          description,
          requirements,
        }),
      });
      setShowCreateModal(false);
      setTitle('');
      setCompany('');
      setDescription('');
      setRequirementsText('');
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to create job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAppStatus = async (status: string) => {
    if (!selectedApp) return;
    try {
      await apiRequest(`/jobposts/admin/applications/${selectedApp._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            চাকরির বিজ্ঞপ্তি ও নিয়োগ (Job Posts & Recruitment)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            নিয়োগ বিজ্ঞপ্তি প্রকাশ এবং প্রার্থীদের আবেদন ব্যবস্থাপনা
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '6px' }}
        >
          <Plus size={16} /> নতুন নিয়োগ বিজ্ঞপ্তি দিন
        </button>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '12px 20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('jobs')}
          className="btn"
          style={{
            background: activeTab === 'jobs' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'jobs' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          সকল চাকরির বিজ্ঞপ্তি ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className="btn"
          style={{
            background: activeTab === 'applications' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'applications' ? '#fff' : '#475569',
            fontWeight: 600,
          }}
        >
          প্রার্থীদের আবেদন সমূহ ({applications.length})
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>পদবী ও প্রতিষ্ঠান</th>
                  <th>স্থান / কর্মক্ষেত্র</th>
                  <th>বেতন পরিসীমা</th>
                  <th>স্ট্যাটাস</th>
                  <th>প্রকাশের তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      কোনো চাকরির বিজ্ঞপ্তি প্রকাশ করা হয়নি
                    </td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j._id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{j.title}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{j.company}</div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <MapPin size={13} color="#64748b" /> {j.location} {j.isRemote && '(Remote)'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{j.salaryRange || 'আলোচনা সাপেক্ষ'}</strong>
                      </td>
                      <td>
                        <span className={`badge ${j.isActive ? 'badge-green' : 'badge-red'}`}>
                          {j.isActive ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>পদবী</th>
                  <th>প্রার্থীর নাম</th>
                  <th>যোগাযোগ</th>
                  <th>অভিজ্ঞতা</th>
                  <th>স্ট্যাটাস</th>
                  <th>তারিখ</th>
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
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      কোনো আবেদন জমা পড়েনি
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.job?.title}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{app.job?.company}</div>
                      </td>
                      <td>
                        <strong>{app.applicantName}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{app.education}</div>
                      </td>
                      <td>
                        <div>{app.applicantPhone}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{app.applicantEmail}</div>
                      </td>
                      <td>{app.experienceYears} বছর</td>
                      <td>
                        <span
                          className={`badge ${
                            app.status === 'hired'
                              ? 'badge-green'
                              : app.status === 'shortlisted'
                              ? 'badge-blue'
                              : app.status === 'rejected'
                              ? 'badge-red'
                              : 'badge-purple'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="btn btn-outline"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                        >
                          স্ট্যাটাস পরিবর্তন
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
            <form onSubmit={handleCreateJob}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>নতুন চাকরির বিজ্ঞপ্তি তৈরি করুন</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>পদের নাম (Job Title):</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: কাস্টমার সাপোর্ট এক্সিকিউটিভ"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>কোম্পানি / ডিপার্টমেন্ট:</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Smart Digital Business"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>কাজের স্থান (Location):</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>বেতন সীমা:</label>
                    <input
                      type="text"
                      placeholder="যেমন: ৳ ১৫,০০০ - ৳ ২০,০০০"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isRemote"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                  />
                  <label htmlFor="isRemote" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    রিমোট / বাসা থেকে কাজের সুযোগ রয়েছে (Work From Home)
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>দায়িত্ব ও বিবরণ:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="দায়িত্ব ও কাজের বিস্তারিত বিবরণ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>যোগ্যতা ও শর্তাবলী (প্রতি লাইনে একটি):</label>
                  <textarea
                    rows={2}
                    placeholder="কম্পিউটার পরিচালনায় দক্ষ&#10;বাংলা ও ইংরেজিতে যোগাযোগ সক্ষমতা"
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'প্রকাশ হচ্ছে...' : 'বিজ্ঞপ্তি প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Application Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>প্রার্থীর আবেদন স্ট্যাটাস আপডেট</h3>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>প্রার্থী: <strong>{selectedApp.applicantName}</strong></div>
                <div>পদবী: <strong>{selectedApp.job?.title}</strong></div>
                <div>মোবাইল: <strong>{selectedApp.applicantPhone}</strong></div>
                {selectedApp.coverNote && <div style={{ marginTop: '6px', color: '#64748b' }}>"{selectedApp.coverNote}"</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  স্ট্যাটাস নির্ধারণ করুন:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'applied', label: 'Applied (আবেদনকৃত)' },
                    { id: 'shortlisted', label: 'Shortlisted (বাছাইকৃত)' },
                    { id: 'interviewed', label: 'Interviewed (সাক্ষাৎকার সম্পন্ন)' },
                    { id: 'hired', label: 'Hired (নিয়োগপ্রাপ্ত)' },
                    { id: 'rejected', label: 'Rejected (বাতিল)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdateAppStatus(s.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '13px', textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
