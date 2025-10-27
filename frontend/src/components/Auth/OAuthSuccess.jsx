import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../../api/invoices';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
    }
    // redirect to app root
    navigate('/');
  }, [search, navigate]);

  return <div>Signing you in…</div>;
}
