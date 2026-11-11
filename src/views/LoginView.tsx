import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@sdb.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0b132b 100%)',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '24px',
              color: '#fff',
              marginBottom: '14px',
              boxShadow: '0 8px 16px rgba(37,99,235,0.4)',
            }}
          >
            SDB
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Smart Digital Business</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            অ্যাডমিন প্যানেল লগইন (Staff & Admin Access)
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              ইমেইল বা মোবাইল নম্বর:
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@sdb.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              পাসওয়ার্ড:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontWeight: 700, fontSize: '14.5px', marginTop: '8px' }}
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'} <ArrowRight size={16} />
          </button>

          {/* Demo helper */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '8px' }}>
              ডেমো ক্রেডেনশিয়াল:
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin@sdb.com');
                  setPassword('Admin@123456');
                }}
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('rafiq@gmail.com');
                  setPassword('Admin@123456');
                }}
                className="btn btn-outline"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Staff (Admin)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
