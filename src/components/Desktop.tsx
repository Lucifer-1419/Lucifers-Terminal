'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Terminal as TermIcon, Folder, Trash2, Globe, Wifi, Battery, Volume2, Clock, Power, Target, ShieldAlert, Cpu, Network, Lock, Skull } from 'lucide-react';
import Terminal from './Terminal';
import FileManager from './FileManager';
import WebBrowser from './WebBrowser';
import Missions from './Missions';
import { useRouter } from 'next/navigation';

export default function Desktop() {
  const { windows, openApp, activeWindowId } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [restrictedApp, setRestrictedApp] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (data.role === 'ADMIN') setIsAdmin(true);
    });

    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const getAppName = (type: string) => {
    if (type === 'terminal') return 'Terminal';
    if (type === 'fileManager') return 'File Manager';
    if (type === 'webBrowser') return 'Browser';
    if (type === 'missions') return 'Missions';
    return type;
  };

  return (
    <div className="desktop-container" onClick={() => setMenuOpen(false)}>
      {/* Top Panel (XFCE Style) */}
      <div className="xfce-panel">
        <div className="xfce-panel-left">
          {/* Applications Menu Button */}
          <div 
            className={`panel-btn ${menuOpen ? 'panel-btn-active' : ''}`} 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <span style={{ marginRight: '8px', fontSize: '16px' }}>🐉</span>
            <span style={{ display: 'none' }}>Applications</span> 
            <span>Applications</span>
          </div>

          {/* Window Buttons in Taskbar */}
          <div className="window-list">
            {windows.map(win => (
              win.isOpen && (
                <div 
                  key={win.id} 
                  className={`panel-btn ${activeWindowId === win.id ? 'panel-btn-active' : ''}`}
                  onClick={() => useAppStore.getState().focusApp(win.id)}
                  style={{ fontSize: '11px', padding: '0 12px' }}
                >
                  [{getAppName(win.type)}]
                </div>
              )
            ))}
          </div>
        </div>

        {/* System Tray */}
        <div className="xfce-panel-right">
          <Wifi size={14} />
          <Volume2 size={14} />
          <Battery size={14} />
          <div className="panel-btn" style={{ gap: '8px' }}>
            <Clock size={14} />
            <span>{time}</span>
          </div>
          <div className="panel-btn" style={{ color: '#ef4444' }} onClick={handleLogout}>
            <Power size={14} />
          </div>
        </div>
      </div>

      {/* Start Menu Dropdown */}
      {menuOpen && (
        <div className="start-menu">
          <div className="start-menu-header">
            🐉 Kali Linux
          </div>
          <div style={{ padding: '4px 0' }}>
            <div className="start-menu-item" onClick={() => openApp('terminal')}>
              <TermIcon size={14}/> Terminal Emulator
            </div>
            <div className="start-menu-item" onClick={() => openApp('fileManager')}>
              <Folder size={14}/> File Manager
            </div>
            <div className="start-menu-item" onClick={() => openApp('webBrowser')}>
              <Globe size={14}/> Web Browser
            </div>
            <div className="start-menu-item" onClick={() => openApp('missions')}>
              <Target size={14}/> Missions (Tasks)
            </div>
            {isAdmin && (
              <div className="start-menu-item" onClick={() => router.push('/admin')} style={{ color: '#ef2929', borderTop: '1px solid #333', marginTop: '4px', paddingTop: '8px' }}>
                <ShieldAlert size={14}/> Admin Control Panel
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Background & Icons */}
      <div className="desktop-icons-area">
        <div className="desktop-icon" onDoubleClick={() => openApp('fileManager')} onClick={() => { openApp('fileManager') }}>
          <Folder size={36} color="#ceaa61" fill="#ceaa61" />
          <span className="desktop-icon-text">File System</span>
        </div>
        
        <div className="desktop-icon" onClick={() => openApp('terminal')}>
          <TermIcon size={36} color="#aaa" />
          <span className="desktop-icon-text">Terminal</span>
        </div>

        <div className="desktop-icon" onClick={() => openApp('webBrowser')}>
          <Globe size={36} color="#1e90ff" />
          <span className="desktop-icon-text">Web Browser</span>
        </div>

        <div className="desktop-icon" onClick={() => openApp('missions')}>
          <Target size={36} color="#ef2929" />
          <span className="desktop-icon-text">Missions</span>
        </div>

        <div className="desktop-icon">
          <Trash2 size={36} color="#888" />
          <span className="desktop-icon-text">Trash</span>
        </div>

        {/* Restricted Apps */}
        <div className="desktop-icon" onClick={() => setRestrictedApp('John the Ripper')}>
          <Skull size={36} color="#cc0000" />
          <span className="desktop-icon-text">John The Ripper</span>
        </div>
        <div className="desktop-icon" onClick={() => setRestrictedApp('Nmap Network Scanner')}>
          <Network size={36} color="#8ae234" />
          <span className="desktop-icon-text">Nmap</span>
        </div>
        <div className="desktop-icon" onClick={() => setRestrictedApp('Wireshark')}>
          <Cpu size={36} color="#729fcf" />
          <span className="desktop-icon-text">Wireshark</span>
        </div>
        <div className="desktop-icon" onClick={() => setRestrictedApp('Metasploit Framework')}>
          <ShieldAlert size={36} color="#fce94f" />
          <span className="desktop-icon-text">Metasploit</span>
        </div>
        
        {isAdmin && (
          <div className="desktop-icon" onClick={() => router.push('/admin')} style={{ marginTop: '24px' }}>
            <ShieldAlert size={36} color="#ef2929" />
            <span className="desktop-icon-text" style={{ color: '#ef2929' }}>Admin Panel</span>
          </div>
        )}
      </div>

      {/* Restricted Modal */}
      {restrictedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #ef2929', borderRadius: '4px', padding: '24px', width: '300px', textAlign: 'center', boxShadow: '0 0 20px rgba(239, 41, 41, 0.2)' }}>
            <Lock size={48} color="#ef2929" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ color: '#ef2929', marginBottom: '8px', fontSize: '18px' }}>ACCESS DENIED</h3>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Execution of <strong style={{ color: 'white' }}>{restrictedApp}</strong> is Restricted by Lucifer.
            </p>
            <button 
              onClick={() => setRestrictedApp(null)}
              style={{ background: '#ef2929', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* Render Open Windows */}
      {windows.map(win => {
        if (!win.isOpen) return null;
        if (win.type === 'terminal') return <Terminal key={win.id} id={win.id} />;
        if (win.type === 'fileManager') return <FileManager key={win.id} id={win.id} />;
        if (win.type === 'webBrowser') return <WebBrowser key={win.id} id={win.id} />;
        if (win.type === 'missions') return <Missions key={win.id} id={win.id} />;
        return null;
      })}
    </div>
  );
}
