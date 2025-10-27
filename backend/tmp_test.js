(async ()=>{
  try{
    const registerResp = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', email: 'test@example.com', password: 'password123' })
    });
    const reg = await registerResp.json();
    console.log('register response:', reg);
    let token = reg.token;
    if(!token){
      // try login if user already exists
      const loginResp = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });
      const login = await loginResp.json();
      console.log('login response:', login);
      token = login.token;
      if(!token){
        console.error('No token returned from login; aborting.');
        return;
      }
    }
    const invoiceNumber = 'INV-' + Date.now();
    const createResp = await fetch('http://localhost:5000/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ clientName: 'ACME', clientEmail: 'client@acme.com', invoiceNumber, items: [{ description: 'Service', quantity: 2, price: 50 }] })
    });
    const created = await createResp.json();
    console.log('create response:', created);
  }catch(e){
    console.error('error', e);
  }
})();
