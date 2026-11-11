import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, Shield, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/stats/audit-logs');
      if (res.data) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
            নিরাপত্তা ও অডিট লগ (Security & Audit Logs)
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            সকল প্রশাসনিক পরিবর্তন, লগইন এবং আর্থিক অ্যাকশনের অপরিবর্তনীয় রেকর্ড
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-outline">
          <RefreshCw size={15} /> রিফ্রেশ
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>সময় ও তারিখ</th>
                <th>অপারেটর / ব্যবহারকারী</th>
                <th>মডিউল</th>
                <th>অ্যাকশন</th>
                <th>বিবরণ (Details)</th>
                <th>আইপি অ্যাড্রেস</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    কোনো অডিট লগ রেকর্ড নেই
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{log.userName || 'System'}</strong>
                    </td>
                    <td>
                      <span className="badge badge-purple">{log.module}</span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
