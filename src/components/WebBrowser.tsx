'use client';

import { useAppStore } from '@/lib/store';
import { Globe, RefreshCw, Menu } from 'lucide-react';

export default function WebBrowser({ id }: { id: string }) {
  const { closeApp, toggleMaximize, focusApp, windows, activeWindowId } = useAppStore();
  const windowState = windows.find(w => w.id === id);
  const isActive = activeWindowId === id;

  if (!windowState) return null;

  return (
    <div 
      className={`xfce-window ${windowState.isMaximized ? 'xfce-window-maximized' : 'xfce-window-normal'}`}
      style={{ zIndex: windowState.zIndex, background: 'white', color: 'black' }}
      onClick={() => focusApp(id)}
    >
      {/* Title Bar */}
      <div className={`xfce-titlebar ${isActive ? '' : 'xfce-titlebar-inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14}/> Mozilla Firefox ESR</div>
        <div className="window-controls">
          <div className="win-btn" onClick={() => toggleMaximize(id)}>_</div>
          <div className="win-btn" onClick={() => toggleMaximize(id)}>□</div>
          <div className="win-btn close" onClick={() => closeApp(id)}>×</div>
        </div>
      </div>

      {/* Browser Toolbar */}
      <div style={{ background: '#f5f5f5', padding: '6px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>←</button>
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>→</button>
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><RefreshCw size={14}/></button>
        <div style={{ flex: 1, background: 'white', border: '1px solid #ccc', borderRadius: '14px', padding: '4px 12px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#888' }}>https://</span>
          <span>kali.org/tools</span>
        </div>
        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><Menu size={16}/></button>
      </div>

      {/* Web Content Mock */}
      <div style={{ flex: 1, background: '#f8f9fa', padding: '32px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>Kali Linux Tools Interface</h1>
          <p style={{ color: '#555', marginBottom: '16px', lineHeight: '1.6' }}>
            Welcome to the mock web interface. This is a simulated environment inside the Kali UI container.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Information Gathering</h3>
              <ul style={{ color: '#0066cc', listStyleType: 'disc', paddingLeft: '16px', fontSize: '14px' }}>
                <li>nmap</li><li>masscan</li><li>recon-ng</li>
              </ul>
            </div>
            <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '4px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Vulnerability Analysis</h3>
              <ul style={{ color: '#0066cc', listStyleType: 'disc', paddingLeft: '16px', fontSize: '14px' }}>
                <li>nikto</li><li>sqlmap</li><li>wp-scan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
