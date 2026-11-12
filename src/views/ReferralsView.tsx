import React, { useState, useEffect } from 'react';
import { Network, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../api/client';

type Tab = 'links' | 'team' | 'suspicious';

const STATUS_LABEL: Record<string, string> = { verified: 'ভেরিফাইড', unverified: 'আনভেরিফাইড', pending: 'পেন্ডিং' };
const STATUS_COLOR: Record<string, string> = { verified: '#10b981', unverified: '#64748b', pending: '#f59e0b' };

const StatusBadge: React.FC<{ s: string }> = ({ s }) => (
  <span className="badge" style={{ background: `${STATUS_COLOR[s] || '#64748b'}22`, color: STATUS_COLOR[s] || '#64748b' }}>
    {STATUS_LABEL[s] || s}
  </span>
);

export const ReferralsView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('links');
  const [overview, setOverview] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [team, setTeam] = useState<any>(null);
  const [teamId, setTeamId] = useState('');
  const [suspicious, setSuspicious] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    try {
      const res = await apiRequest('/referral/admin/overview');
      setOverview(res.data);
    } catch (e: any) {
      setError(e.message || 'ওভারভিউ লোড করা যায়নি');
    }
  };

  const loadLinks = async (p = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/referral/admin/links?page=${p}&limit=30&q=${encodeURIComponent(search)}`);
      setLinks(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (e: any) {
      setError(e.message || 'তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  const loadTeam = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/referral/admin/team/${encodeURIComponent(id.trim())}`);
      setTeam(res.data);
    } catch (e: any) {
      setTeam(null);
      setError(e.message || 'টিম লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  const loadSuspicious = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/referral/admin/suspicious');
      setSuspicious(res.data);
    } catch (e: any) {
      setError(e.message || 'স্ক্যান ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (tab === 'links') loadLinks(page);
    if (tab === 'suspicious') loadSuspicious();
    if (tab === 'team') setLoading(false);
  }, [tab, page]);

  const stat = (label: string, value: React.ReactNode, color: string) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}>
            <Network size={22} /> রেফারেল টিম সিস্টেম
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            ১০ লেভেল পর্যন্ত টিম দৃশ্যমান · বর্তমানে শুধু লেভেল ১ এ বোনাস (৳{overview?.config?.levelBonus?.[1] ?? 15} / ভেরিফিকেশন, ফি ৳{overview?.config?.verificationFee ?? 20})
          </p>
        </div>
        <button
          className="btn btn-outline"
          style={{ display: 'flex', gap: 6 }}
          onClick={() => {
            loadOverview();
            if (tab === 'links') loadLinks();
            if (tab === 'suspicious') loadSuspicious();
          }}
        >
          <RefreshCw size={14} /> রিফ্রেশ
        </button>
      </div>

      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {stat('মোট সদস্য', overview.totalMembers, '#3b82f6')}
          {stat('রেফারেলে যুক্ত', overview.referredMembers, '#8b5cf6')}
          {stat('ভেরিফাইড', overview.verifiedMembers, '#10b981')}
          {stat('মোট ফি সংগ্রহ', `৳${overview.totalFeesCollected}`, '#0ea5e9')}
          {stat('রেফারেল বোনাস দেওয়া', `৳${overview.totalBonusPaid}`, '#f59e0b')}
          {stat('কোম্পানির অংশ', `৳${overview.companyShare}`, '#14b8a6')}
          {overview.failedPayouts > 0 && stat('ব্যর্থ পেআউট', overview.failedPayouts, '#ef4444')}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {([['links', 'কে কাকে রেফার করেছে'], ['team', 'সদস্যের টিম ও লেভেল'], ['suspicious', 'সন্দেহজনক অ্যাকাউন্ট']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} className={tab === id ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="card" style={{ padding: 12, color: '#b91c1c', marginBottom: 12 }}>{error}</div>}

      {tab === 'links' && (
        <>
          <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(1), loadLinks(1))}
              placeholder="নাম / মোবাইল / আইডি দিয়ে খুঁজুন"
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8 }}
            />
            <button className="btn btn-primary" onClick={() => { setPage(1); loadLinks(1); }}>
              <Search size={14} />
            </button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>সদস্য</th>
                    <th>রেফারার</th>
                    <th>ভেরিফিকেশন</th>
                    <th>রেজিস্ট্রেশন</th>
                    <th>বোনাস</th>
                    <th>কোম্পানি</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6}>লোড হচ্ছে...</td></tr>
                  ) : links.length === 0 ? (
                    <tr><td colSpan={6}>কোনো রেফারেল পাওয়া যায়নি</td></tr>
                  ) : (
                    links.map((r) => (
                      <tr key={r.customId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{r.customId} · {r.phone}</div>
                        </td>
                        <td>
                          {r.referrer ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); setTeamId(r.referrer.customId); setTab('team'); loadTeam(r.referrer.customId); }}>
                              {r.referrer.name} ({r.referrer.customId})
                            </a>
                          ) : '-'}
                        </td>
                        <td><StatusBadge s={r.verificationStatus} /></td>
                        <td>{new Date(r.registeredAt).toLocaleDateString()}</td>
                        <td>৳{r.bonusPaid}{r.payoutStatus === 'failed' && <span style={{ color: '#ef4444' }}> (ব্যর্থ)</span>}</td>
                        <td>৳{r.companyShare}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>আগের</button>
            <span style={{ alignSelf: 'center', fontSize: 13 }}>{page} / {totalPages}</span>
            <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>পরের</button>
          </div>
        </>
      )}

      {tab === 'team' && (
        <>
          <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadTeam(teamId)}
              placeholder="সদস্যের ইউজার আইডি (যেমন UID10002)"
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8 }}
            />
            <button className="btn btn-primary" onClick={() => loadTeam(teamId)}>টিম দেখুন</button>
          </div>
          {team && (
            <>
              <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                <div style={{ fontWeight: 700 }}>{team.member.name} ({team.member.customId}) · {team.member.phone}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {team.levels.map((l: any) => (
                    <span key={l.level} className="badge" style={{ background: l.total ? '#eff6ff' : '#f1f5f9', color: l.total ? '#1d4ed8' : '#94a3b8' }}>
                      লেভেল {l.level}: {l.total} (ভেরিফাইড {l.verified})
                    </span>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr><th>লেভেল</th><th>সদস্য</th><th>মোবাইল</th><th>ভেরিফিকেশন</th><th>সরাসরি রেফার</th></tr>
                    </thead>
                    <tbody>
                      {team.members.map((m: any) => (
                        <tr key={m.customId}>
                          <td>{m.level}</td>
                          <td>{m.name} ({m.customId})</td>
                          <td>{m.phone}</td>
                          <td><StatusBadge s={m.verificationStatus} /></td>
                          <td>{m.directReferrals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'suspicious' && suspicious && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="card" style={{ padding: 14, fontSize: 13, color: '#92400e', background: '#fffbeb', display: 'flex', gap: 8 }}>
            <AlertTriangle size={16} /> এগুলো স্বয়ংক্রিয় সংকেত মাত্র — প্রমাণ নয়। ম্যানুয়ালি যাচাই করে সিদ্ধান্ত নিন।
          </div>
          <div className="card" style={{ padding: 14 }}>
            <b>একই নামে একাধিক অ্যাকাউন্ট ({suspicious.duplicateNames.length})</b>
            {suspicious.duplicateNames.map((d: any) => (
              <div key={d.name} style={{ fontSize: 13, marginTop: 6 }}>{d.name} — {d.count}টি: {d.customIds.join(', ')}</div>
            ))}
          </div>
          <div className="card" style={{ padding: 14 }}>
            <b>২৪ ঘণ্টায় অস্বাভাবিক বেশি সাইন-আপ ({suspicious.signupBursts.length})</b>
            {suspicious.signupBursts.map((d: any) => (
              <div key={d.customId} style={{ fontSize: 13, marginTop: 6 }}>{d.name} ({d.customId}) — {d.signupsLast24h} জন</div>
            ))}
          </div>
          <div className="card" style={{ padding: 14 }}>
            <b>রেজিস্ট্রেশনের ৫ মিনিটের মধ্যে ভেরিফাই ({suspicious.fastVerifications.length})</b>
            {suspicious.fastVerifications.map((d: any) => (
              <div key={d.customId} style={{ fontSize: 13, marginTop: 6 }}>{d.name} ({d.customId}) · {d.phone} — {d.gapMin} মিনিট</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
