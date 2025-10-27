import React from 'react';

export default function Sidebar({ user, onNavigate, onLogout }) {
  return (
    <div style={{ width: 260, background: '#2f2f70', color: '#fff', minHeight: '100vh', paddingTop: 18 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>Welcome, {user?.username || 'Guest'}</div>
      </div>

      <div style={{ padding: 12 }}>
        <button className="btn sidebar-btn" style={btnStyle} onClick={() => onNavigate('profile')}>My Profile</button>
        <button className="btn sidebar-btn" style={btnStyle} onClick={() => onNavigate('create')}>Create Invoice</button>
        <button className="btn sidebar-btn" style={btnStyle} onClick={() => onNavigate('past')}>Past Invoices</button>
        <div style={{ height: 12 }} />
        <button className="btn sidebar-logout" style={{ ...btnStyle, background: '#ff5c5c' }} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

const btnStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 12px',
  marginBottom: 8,
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6,
  cursor: 'pointer'
};
