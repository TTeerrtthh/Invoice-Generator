// create_sample_invoice.js
// Creates a sample invoice (matching screenshot items) and downloads the generated PDF
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

  let invoiceNumber = '123789';
    const payload = {
      invoiceNumber,
      issueDate: '2025-10-26T00:00:00.000Z',
      clientName: 'teerth',
      clientEmail: 'teerth@example.com',
      clientAddress: 'Client Street, City, ZIP',
      companyName: 'Company Name',
      companyStreet: '[Street Address]',
      companyAddress: '[City, ST ZIP]',
      companyPhone: '[000-000-0000]',
      companyWebsite: 'example.com',
      items: [
        { description: 'food', quantity: 1, price: 10, taxed: false },
        { description: 'games', quantity: 1, price: 500, taxed: false },
        { description: 'shopping', quantity: 1, price: 10000, taxed: false }
      ],
      notes: '1. Total payment due in 30 days\n2. Please include the invoice number on your check'
    };

    const createResp = await fetch(base + '/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload)
    });
    let created = await createResp.json();
    if (!created || !created._id) {
      // if duplicate invoiceNumber, try to find existing invoice with that number
      if (created && created.error && String(created.error).includes('duplicate key')) {
        console.log('Invoice number already exists, searching for existing invoice...');
        const listResp = await fetch(base + '/invoices', { headers: { Authorization: 'Bearer ' + token } });
        const list = await listResp.json();
        const found = (list || []).find(i => i.invoiceNumber === invoiceNumber);
        if (found && found._id) {
          created = found;
          console.log('Using existing invoice id', created._id);
        } else {
          // try creating with a slightly different invoiceNumber to avoid duplicate
          invoiceNumber = invoiceNumber + '-' + Date.now();
          payload.invoiceNumber = invoiceNumber;
          console.log('Retrying create with invoiceNumber', invoiceNumber);
          const retryResp = await fetch(base + '/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
          });
          created = await retryResp.json();
          if (!created || !created._id) throw new Error('Retry create failed: ' + JSON.stringify(created));
          console.log('Created invoice id', created._id);
        }
      } else {
        throw new Error('Create invoice failed: ' + JSON.stringify(created));
      }
    } else {
      console.log('Created invoice id', created._id);
    }

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
    const out = 'invoice_reference_match.pdf';
    fs.writeFileSync(out, Buffer.from(ab));
    console.log('Wrote', out);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
