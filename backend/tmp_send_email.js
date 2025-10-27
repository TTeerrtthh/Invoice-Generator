(async ()=>{
  try{
    // login to get token
    const loginResp = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const login = await loginResp.json();
    if(!login || !login.token){ console.error('login failed', login); return; }
    const token = login.token;
    // find latest invoice for this user
    const listResp = await fetch('http://localhost:5000/api/invoices', { headers: { Authorization: 'Bearer ' + token } });
    const invoices = await listResp.json();
    if(!Array.isArray(invoices) || invoices.length === 0){ console.error('no invoices for user'); return; }
    const invoiceId = invoices[0]._id;
    console.log('Using invoice id:', invoiceId);

    const resp = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/email`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    const result = await resp.json();
    console.log('Email endpoint response:', result);
    if(result.preview) console.log('Preview URL (Ethereal):', result.preview);
  }catch(e){ console.error(e); }
})();
