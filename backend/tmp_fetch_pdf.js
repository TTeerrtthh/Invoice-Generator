(async ()=>{
  try{
    // login to get token
    const loginResp = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const login = await loginResp.json();
    const token = login.token;
    if(!token){ console.error('no token'); return; }
    // replace with an invoice id you created
    const invoiceId = process.argv[2] || '68fe40101c76b4d4e2a4336b';
    const resp = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/pdf`, { headers: { Authorization: 'Bearer ' + token } });
    if(!resp.ok){ console.error('Failed to fetch PDF', await resp.text()); return; }
    const buffer = await resp.arrayBuffer();
    const fs = require('fs');
    fs.writeFileSync('invoice_test.pdf', Buffer.from(buffer));
    console.log('Wrote invoice_test.pdf');
  }catch(e){ console.error(e); }
})();
