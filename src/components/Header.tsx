import React, { useState, useEffect } from 'react';
import { Search, Bell, Globe, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrentApiBase, setApiEnvironmentPreference } from '../api/client';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="admin-header">
      {/* Search Input */}
      <div style={{ position: 'relative', width: '340px' }}>
        <Search
          size={16}
          color="#94a3b8"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search here... (User, Phone, Transaction)"
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '13.5px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>আজকের তারিখ:</span>
            <strong style={{ color: '#0f172a' }}>১৬ অক্টোবর, ২০২৬</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px' }}>🕒</span>
            <strong style={{ color: '#0f172a' }}>{timeStr || '12:45 PM'}</strong>
          </div>
        </div>

        {/* Backend Environment Indicator Badge with Switcher */}
        <div
          title={`Connected Backend: ${getCurrentApiBase()}\nClick to toggle environment`}
          onClick={() => {
            const current = getCurrentApiBase();
            const nextMode = current.includes('localhost') ? 'live' : 'local';
            if (window.confirm(`Switch backend environment to ${nextMode.toUpperCase()} (${nextMode === 'live' ? 'Render Cloud' : 'Localhost:5001'})?`)) {
              setApiEnvironmentPreference(nextMode);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: getCurrentApiBase().includes('onrender.com') ? '#eff6ff' : '#ecfdf5',
            color: getCurrentApiBase().includes('onrender.com') ? '#2563eb' : '#059669',
            border: `1px solid ${getCurrentApiBase().includes('onrender.com') ? '#bfdbfe' : '#a7f3d0'}`,
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getCurrentApiBase().includes('onrender.com') ? '#3b82f6' : '#10b981',
              boxShadow: `0 0 8px ${getCurrentApiBase().includes('onrender.com') ? '#3b82f6' : '#10b981'}`,
            }}
          />
          <span>{getCurrentApiBase().includes('onrender.com') ? 'Live Cloud' : 'Localhost'}</span>
        </div>

        {/* Language Pill */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f1f5f9',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12.5px',
            fontWeight: 500,
            color: '#334155',
          }}
        >
          <Globe size={15} />
          <span>বাংলা / EN</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={18} color="#475569" />
          </div>
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
            }}
          >
            3
          </span>
        </div>

        {/* Admin Avatar Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{user?.name || 'Sakibur Rahman'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Owner / Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
