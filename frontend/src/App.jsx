import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import api from './api/invoices';
import OAuthSuccess from './components/Auth/OAuthSuccess';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import { setAuthToken } from './api/invoices';

function Home({ currentUser, onLogout }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentTab, setCurrentTab] = useState('create');

  return (
    <div className="container" style={{ display: 'flex', gap: 16 }}>
      <Sidebar user={currentUser} onNavigate={(t) => setCurrentTab(t)} onLogout={onLogout} />
      <div style={{ flex: 1 }}>
        <h1>Invoice Generator</h1>
        {currentTab === 'create' && (
          <InvoiceForm invoice={selectedInvoice} onSaved={() => { setSelectedInvoice(null); setRefreshKey(k => k + 1); }} />
        )}
        {currentTab === 'past' && (
          <InvoiceList onEdit={(inv) => setSelectedInvoice(inv)} refreshKey={refreshKey} />
        )}
        {currentTab === 'profile' && (
          <Profile onSelect={(inv) => setSelectedInvoice(inv)} />
        )}
      </div>
    </div>
  );
}

function AppShell() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) setAuthToken(token);
    else setAuthToken(null);
  }, [token]);

  // fetch current user when token changes
  useEffect(() => {
    let cancelled = false;
    async function fetchUser() {
      if (!token) {
        setCurrentUser(null);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (!cancelled) setCurrentUser(res.data.user || res.data);
      } catch (err) {
        console.error('Failed to fetch current user', err);
        setCurrentUser(null);
      }
    }
    fetchUser();
    return () => { cancelled = true; };
  }, [token]);

  const onLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <div>
      <header className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">Invoice Generator</Link>
        <div>
          {!token ? (
            <>
              <button className="btn" onClick={() => { setShowLogin(s => !s); setShowSignup(false); }}>Sign in</button>
              <button className="btn" onClick={() => { setShowSignup(s => !s); setShowLogin(false); }} style={{ marginLeft: 8 }}>Sign up</button>
              {showLogin && <LoginForm onLogin={(t) => { setToken(t); setShowLogin(false); }} />}
              {showSignup && <SignupForm onSignup={(t) => { setToken(t); setShowSignup(false); }} />}
            </>
          ) : (
            <button className="btn" onClick={onLogout}>Logout</button>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} onLogout={onLogout} />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
