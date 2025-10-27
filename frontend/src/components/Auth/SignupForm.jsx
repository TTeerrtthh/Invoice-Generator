import React, { useState } from 'react';
import api, { setAuthToken } from '../../api/invoices';

export default function SignupForm({ onSignup }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const token = res.data?.token || res.token || (res.data && res.data.token);
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
        onSignup && onSignup(token);
      } else {
        alert('Signup failed: ' + JSON.stringify(res.data || res));
      }
    } catch (err) {
      alert('Signup error: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{padding:6}} />
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{padding:6}} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{padding:6}} />
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign up'}</button>
    </form>
  );
}
