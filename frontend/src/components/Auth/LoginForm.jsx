import React, { useState } from 'react';
import api, { setAuthToken } from '../../api/invoices';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token } = res.data || res; // api may return data or raw
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        onLogin && onLogin(token);
      } else {
        alert('Login failed: ' + (res.data?.message || JSON.stringify(res.data || res)));
      }
    } catch (err) {
      alert('Login error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{padding:6}} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{padding:6}} />
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</button>
    </form>
  );
}
