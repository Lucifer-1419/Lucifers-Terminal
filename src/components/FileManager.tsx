'use client';

import { useAppStore } from '@/lib/store';
import { Folder, File, ChevronRight, HardDrive, Home, Star } from 'lucide-react';

export default function FileManager({ id }: { id: string }) {
  const { closeApp, toggleMaximize, focusApp, windows, activeWindowId } = useAppStore();
  const windowState = windows.find(w => w.id === id);
  const isActive = activeWindowId === id;

  if (!windowState) return null;

  return (
    <div 
      className={`xfce-window ${windowState.isMaximized ? 'xfce-window-maximized' : 'xfce-window-normal'}`}
      style={{ zIndex: windowState.zIndex, background: '#f5f5f5', color: '#333' }}
      onClick={() => focusApp(id)}
    >
      {/* Title Bar */}
      <div className={`xfce-titlebar ${isActive ? '' : 'xfce-titlebar-inactive'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Folder size={14}/> File System - /root</div>
        <div className="window-controls">
          <div className="win-btn" onClick={() => toggleMaximize(id)}>_</div>
          <div className="win-btn" onClick={() => toggleMaximize(id)}>□</div>
          <div className="win-btn close" onClick={() => closeApp(id)}>×</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#e0e0e0', padding: '4px 8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '8px', fontSize: '12px' }}>
        <button style={{ padding: '2px 8px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '2px' }}>Back</button>
        <button style={{ padding: '2px 8px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '2px' }}>Forward</button>
        <input type="text" value="/root" readOnly style={{ flex: 1, padding: '2px 6px', border: '1px solid #ccc' }} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '150px', background: '#eee', borderRight: '1px solid #ccc', padding: '8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', marginTop: '4px' }}>PLACES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', cursor: 'pointer', fontSize: '13px' }}><Home size={14} color="#888"/> Home</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', cursor: 'pointer', fontSize: '13px' }}><Folder size={14} color="#888"/> Desktop</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', cursor: 'pointer', fontSize: '13px' }}><Folder size={14} color="#888"/> Downloads</div>
          
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px', marginTop: '16px' }}>DEVICES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', cursor: 'pointer', fontSize: '13px' }}><HardDrive size={14} color="#888"/> File System</div>
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, background: 'white', padding: '16px', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: '16px', overflowY: 'auto' }}>
          {[
            { name: 'Desktop', type: 'folder' },
            { name: 'Downloads', type: 'folder' },
            { name: 'Documents', type: 'folder' },
            { name: 'Music', type: 'folder' },
            { name: 'Pictures', type: 'folder' },
            { name: 'Videos', type: 'folder' },
            { name: 'payload.exe', type: 'file' },
            { name: 'passwords.txt', type: 'file' },
            { name: 'notes.md', type: 'file' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', cursor: 'pointer' }}>
              {item.type === 'folder' ? <Folder size={48} color="#ceaa61" fill="#ceaa61" /> : <File size={48} color="#888" />}
              <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'center', wordWrap: 'break-word', width: '100%' }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
