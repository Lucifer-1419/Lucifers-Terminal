'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Terminal as TermIcon, Folder, Trash2, Globe, Wifi, Battery, Volume2, Clock, Power, Target } from 'lucide-react';
import Terminal from './Terminal';
import FileManager from './FileManager';
import WebBrowser from './WebBrowser';
import Missions from './Missions';
import { useRouter } from 'next/navigation';

export default function Desktop() {
  const { windows, openApp, activeWindowId } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState('');
  const router = useRouter();

  useEffect(() => {
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
      </div>

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
