import React, { useState } from 'react';
import { createInvoice, updateInvoice } from '../api/invoices';

export default function InvoiceForm({ invoice: incomingInvoice, onSaved }) {
  // support edit mode by accepting a prop `invoice` (prefill) and `onSaved` callback
  // (If used as a child, parent can pass selected invoice and onSaved() to refresh list)
  const [form, setForm] = useState({
    number: '',
    date: '',
    customer: { name: '', email: '', address: '' },
    items: [],
    total: 0,
    companyName: '',
    companyAddress: '',
    companyStreet: '',
    companyCity: '',
    companyZip: '',
    companyWebsite: '',
    companyPhone: ''
  });

  // If parent passes `invoice` prop, prefill form (handled in useEffect below)
  // allow parent to pass `onSaved` callback
  // Note: when using this component standalone (no props), it behaves as before (create mode)
  // eslint-disable-next-line no-unused-vars
  

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'customerName') {
      setForm(f => ({ ...f, customer: { ...f.customer, name: value } }));
    } else if (name === 'customerEmail') {
      setForm(f => ({ ...f, customer: { ...f.customer, email: value } }));
    } else if (name === 'customerAddress') {
      setForm(f => ({ ...f, customer: { ...f.customer, address: value } }));
    } else if (name === 'companyName' || name === 'companyAddress' || name === 'companyPhone' || name === 'companyStreet' || name === 'companyCity' || name === 'companyZip' || name === 'companyWebsite') {
      setForm(f => ({ ...f, [name]: value }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // build payload matching backend Invoice schema
      const payload = {
        invoiceNumber: form.number,
        issueDate: form.date || new Date().toISOString(),
        clientName: form.customer?.name || '',
        clientEmail: form.customer?.email || undefined,
        clientAddress: form.customer?.address || undefined,
        items: form.items || [],
        total: Number(form.total) || ((form.items || []).reduce((s,it)=>s + (Number(it.quantity || 0) * Number(it.price || 0)), 0)),
        companyName: form.companyName || undefined,
        companyAddress: form.companyAddress || undefined,
        companyStreet: form.companyStreet || undefined,
        companyCity: form.companyCity || undefined,
        companyZip: form.companyZip || undefined,
        companyWebsite: form.companyWebsite || undefined,
        companyPhone: form.companyPhone || undefined
      };

      if (!payload.invoiceNumber || !payload.clientName) {
        return alert('Please provide invoice number and client name');
      }

      // If we're in edit mode (incomingInvoice exists and has _id), call update
      if (incomingInvoice && incomingInvoice._id) {
        await updateInvoice(incomingInvoice._id, payload);
        if (typeof onSaved === 'function') onSaved();
      } else {
        await createInvoice(payload);
        if (typeof onSaved === 'function') onSaved();
      }
      // reset the form after successful create
      setForm({ number: '', date: '', customer: { name: '', email: '', address: '' }, items: [], total: 0, companyName: '', companyAddress: '', companyStreet: '', companyCity: '', companyZip: '', companyWebsite: '', companyPhone: '' });
      setItem({ description: '', quantity: 1, price: 0, taxed: false });
    } catch (err) {
      console.error(err);
      // show backend error message if present
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to create invoice';
      alert(msg);
    }
  }

  // If parent provided an invoice prop, prefill form (this component also supports editing)
  React.useEffect(() => {
    if (incomingInvoice && incomingInvoice._id) {
      setForm({
        number: incomingInvoice.invoiceNumber || '',
        date: incomingInvoice.issueDate ? incomingInvoice.issueDate.split('T')[0] : '',
        customer: { name: incomingInvoice.clientName || '', email: incomingInvoice.clientEmail || '', address: incomingInvoice.clientAddress || '' },
        items: incomingInvoice.items || [],
        total: incomingInvoice.total || 0,
        companyName: incomingInvoice.companyName || '',
        companyAddress: incomingInvoice.companyAddress || '',
        companyStreet: incomingInvoice.companyStreet || '',
        companyCity: incomingInvoice.companyCity || '',
        companyZip: incomingInvoice.companyZip || '',
        companyWebsite: incomingInvoice.companyWebsite || '',
        companyPhone: incomingInvoice.companyPhone || ''
      });
    }
  }, [incomingInvoice]);

  // item inputs
  const [item, setItem] = useState({ description: '', quantity: 1, price: 0, taxed: false });

  function addItem() {
    setForm(f => ({ ...f, items: [...(f.items || []), item] }));
    setItem({ description: '', quantity: 1, price: 0 });
  }

  function removeItem(index) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{incomingInvoice && incomingInvoice._id ? 'Edit Invoice' : 'Create Invoice'}</h2>
      <div className="row">
        <div style={{ flex: 1 }}>
          <label>Customer Name</label>
          <input name="customerName" value={form.customer.name} onChange={handleChange} />
          <label>Customer Email</label>
          <input name="customerEmail" value={form.customer.email} onChange={handleChange} />
          <label>Customer Address</label>
          <textarea name="customerAddress" value={form.customer.address} onChange={handleChange} rows={2} />
        </div>
        <div style={{ width: 260 }}>
          <label>Invoice number</label>
          <input name="number" value={form.number} onChange={handleChange} />
          <label>Invoice date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
      </div>

      <h3 style={{ marginTop: 12 }}>Company (appears on PDF)</h3>
      <div className="row">
        <div style={{ flex: 1 }}>
          <label>Company Name</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} />
          <label>Company Street</label>
          <input name="companyStreet" value={form.companyStreet} onChange={handleChange} />
          <label>Company Address (city, state)</label>
          <input name="companyAddress" value={form.companyAddress} onChange={handleChange} />
          <label>Company ZIP</label>
          <input name="companyZip" value={form.companyZip} onChange={handleChange} />
          <label>Website</label>
          <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} />
        </div>
        <div style={{ width: 220 }}>
          <label>Company Phone</label>
          <input name="companyPhone" value={form.companyPhone} onChange={handleChange} />
        </div>
      </div>

      <h3 style={{ marginTop: 18 }}>Items</h3>
      <div className="items-row">
        <input placeholder="Description" value={item.description} onChange={e => setItem(it => ({ ...it, description: e.target.value }))} />
        <input style={{ width: 60 }} type="number" value={item.quantity} onChange={e => setItem(it => ({ ...it, quantity: Number(e.target.value) }))} />
        <input style={{ width: 120 }} type="number" value={item.price} onChange={e => setItem(it => ({ ...it, price: Number(e.target.value) }))} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={item.taxed} onChange={e => setItem(it => ({ ...it, taxed: e.target.checked }))} /> Taxed</label>
        <button type="button" className="btn secondary" onClick={addItem}>Add item</button>
      </div>

      {form.items && form.items.length > 0 && (
        <table className="items-table">
          <thead>
            <tr><th>Description</th><th style={{ width:60 }}>Qty</th><th style={{ width:120 }}>Unit</th><th style={{ width:60 }}>Tax</th><th style={{ width:120 }}>Actions</th></tr>
          </thead>
          <tbody>
            {form.items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.description}</td>
                <td style={{ width: 60 }}>{it.quantity}</td>
                <td style={{ width: 120 }}>{it.price.toFixed(2)}</td>
                <td style={{ width: 60 }}>{it.taxed ? 'X' : ''}</td>
                <td style={{ width: 120 }}><button type="button" className="btn secondary" onClick={() => removeItem(idx)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 12 }}>
        <label>Total</label>
        <input name="total" type="number" value={form.total} onChange={handleChange} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn" type="submit">{incomingInvoice && incomingInvoice._id ? 'Save Changes' : 'Create'}</button>
      </div>
    </form>
  );
}
