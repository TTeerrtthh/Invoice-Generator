// tmp_big_invoice.js
// Creates a large invoice with many items to test single-page truncation
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    // login existing test user
    const loginResp = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const login = await loginResp.json();
    if (!login || !login.token) throw new Error('Login failed: ' + JSON.stringify(login));
    const token = login.token;

    const items = [];
    for (let i = 1; i <= 120; i++) {
      items.push({ description: `Line item number ${i} — a longer description to exercise wrapping and height`, quantity: 1, price: (i % 7) * 123.45 + 10, taxed: i % 3 === 0 });
    }

    const payload = {
      invoiceNumber: 'BIG-' + Date.now(),
      issueDate: new Date().toISOString(),
      clientName: 'Big Client',
      clientEmail: 'bigclient@example.com',
      clientAddress: '123 Large St, Big City, 00000',
      companyName: 'Company Name',
      companyStreet: '[Street Address]',
      companyAddress: '[City, ST ZIP]',
      companyPhone: '[000-000-0000]',
      companyWebsite: 'example.com',
      items,
      notes: 'Testing large invoice truncation behavior.'
    };

    const createResp = await fetch(base + '/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    });
    const created = await createResp.json();
    if (!created || !created._id) throw new Error('Create invoice failed: ' + JSON.stringify(created));
    console.log('Created invoice id', created._id);

    // fetch PDF
    const pdfResp = await fetch(base + `/invoices/${created._id}/pdf`, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!pdfResp.ok) {
      const t = await pdfResp.text();
      throw new Error('Failed to fetch PDF: ' + t);
    }
    const ab = await pdfResp.arrayBuffer();
    const fs = require('fs');
    const out = 'invoice_big_test.pdf';
    fs.writeFileSync(out, Buffer.from(ab));
    console.log('Wrote', out);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
