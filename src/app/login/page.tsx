'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          if (data.role === 'ADMIN') router.push('/admin');
          else router.push('/desktop');
        }
      })
      .catch(() => {});

    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/desktop');
        }
      } else {
        setError('Incorrect password, please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('System error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg"></div>
      
      <div className="login-content">
        <div className="login-header">
          <div className="login-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef2929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <div className="login-title">LUCIFER'S TERMINAL</div>
          <div className="login-subtitle">Secure Gateway Access</div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-wrapper">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="System ID"
              required
              disabled={loading}
              style={{ textAlign: 'center', fontWeight: 'bold' }}
            />
          </div>
          
          <div className="login-input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="Passphrase"
              required
              disabled={loading}
              style={{ textAlign: 'center' }}
            />
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Initialize Connection'}
          </button>
        </form>

        <div className="login-topbar">
          <div>LUCIFER NETWORK // AUTHORIZED PERSONNEL ONLY</div>
          <div className="login-topbar-right">
            <span>SECURE-NODE</span>
            <span>{time}</span>
            <span className="login-power">⏻</span>
          </div>
        </div>
      </div>
    </div>
  );
}
