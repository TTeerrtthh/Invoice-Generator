import React, { useEffect, useState } from 'react';
import { getInvoices } from '../api/invoices';
import api, { setAuthToken } from '../api/invoices';

export default function Profile({ onSelect }) {
  const [invoices, setInvoices] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      load();
    } else {
      setInvoices([]);
    }
  }, [token]);

  async function load() {
    try {
      const data = await getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setInvoices([]);
    }
  }

  const onLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setToken(null);
    window.location.reload();
  };

  return (
    <div style={{ width: 280, padding: 12, borderRight: '1px solid #eee' }}>
      <h3>Profile</h3>
      {!token ? (
        <div>Please sign in to view invoices.</div>
      ) : (
        <div>
          <div style={{ marginBottom: 8 }}>
            <button className="btn" onClick={load}>Refresh</button>
            <button className="btn" onClick={onLogout} style={{ marginLeft: 8 }}>Logout</button>
          </div>
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {invoices.length === 0 ? <div>No invoices yet.</div> : (
              invoices.map(inv => (
                <div key={inv._id} style={{ padding: 6, borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => onSelect && onSelect(inv)}>
                  <div style={{ fontWeight: 700 }}>{inv.clientName || '—'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{inv.invoiceNumber}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
