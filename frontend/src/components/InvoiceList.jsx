import React, { useEffect, useState } from 'react';
import api, { getInvoices, sendInvoiceEmail } from '../api/invoices';

export default function InvoiceList({ onEdit, refreshKey }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    getInvoices()
      .then(data => {
        if (Array.isArray(data)) {
          setInvoices(data);
        } else {
          console.error('Expected invoices array but got:', data);
          setInvoices([]);
        }
      })
      .catch(err => {
        console.error('Failed to load invoices', err);
        setInvoices([]);
      });
  }, [refreshKey]);

  return (
    <div className="invoice-list">
      <h2>Invoices</h2>
      {invoices.length === 0 ? (
        <div>No invoices yet.</div>
      ) : (
        <div>
          {invoices.map(inv => (
            <div className="invoice-item" key={inv._id}>
              <div>
                <div style={{fontSize:16,fontWeight:700}}>{inv.clientName || inv.customer?.name || '—'}</div>
                <div className="meta">{inv.invoiceNumber || inv.number} — {(() => {
                  const d = new Date(inv.issueDate || inv.date);
                  const pad = (n) => (n < 10 ? '0' + n : n);
                  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
                })()}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div className="totals">Total: {Number(inv.total || 0).toFixed(2)}</div>
                <button className="download-btn" onClick={async () => {
                  try {
                    // fetch pdf as blob using authenticated api
                    const resp = await api.get(`/invoices/${inv._id}/pdf`, { responseType: 'blob' });
                    const blob = new Blob([resp.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `invoice-${inv.invoiceNumber || inv._id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Failed to download PDF: ' + (err?.response?.data?.message || err.message));
                  }
                }}>Download PDF</button>
                  <button className="download-btn" onClick={async () => {
                    try {
                      const resp = await sendInvoiceEmail(inv._id);
                      // If backend used Ethereal test account it returns preview URL
                      if (resp && resp.preview) {
                        // open preview in new tab for convenience
                        window.open(resp.preview, '_blank');
                        alert('Email sent (preview). Opened Ethereal preview in a new tab.');
                      } else {
                        alert('Email sent to ' + (inv.clientEmail || 'client'));
                      }
                    } catch (err) {
                      alert('Failed to send email: ' + (err?.response?.data?.message || err.message));
                    }
                  }}>Email PDF</button>
                <button className="download-btn" onClick={() => { if (typeof onEdit === 'function') onEdit(inv); }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
