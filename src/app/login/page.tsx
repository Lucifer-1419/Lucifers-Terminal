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
        <div className="login-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-wrapper" style={{ marginBottom: '8px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="Username"
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
              placeholder="Password"
              required
              autoFocus
              disabled={loading}
            />
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
          </div>
          
          <button type="submit" disabled={loading} style={{ display: 'none' }}>Submit</button>
        </form>

        <div className="login-topbar">
          <div>Kali Linux</div>
          <div className="login-topbar-right">
            <span>en_US</span>
            <span>{time}</span>
            <span className="login-power">⏻</span>
          </div>
        </div>
      </div>
    </div>
  );
}
